from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database import db_manager
from models.marks import MarksCreate, MarksInDB
from routers.auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/", response_model=MarksInDB)
async def add_marks(marks: MarksCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can add marks")

    student = await db_manager.db.users.find_one({"_id": marks.student_id, "role": "student"})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    marks_dict = marks.model_dump()
    
    total_obtained = sum(sub["marks_obtained"] for sub in marks_dict["subjects"])
    total_max = sum(sub["total_marks"] for sub in marks_dict["subjects"])
    if total_max > 0:
        marks_dict["total_percentage"] = (total_obtained / total_max) * 100
        
    marks_dict["_id"] = str(uuid.uuid4())
    marks_dict["created_at"] = datetime.utcnow()

    await db_manager.db.marks.insert_one(marks_dict)
    return marks_dict

@router.get("/me", response_model=List[MarksInDB])
async def get_my_marks(current_user: dict = Depends(get_current_user)):
    cursor = db_manager.db.marks.find({"student_id": current_user["_id"]}).sort("created_at", -1)
    marks = await cursor.to_list(length=100)
    for m in marks:
        m["_id"] = str(m["_id"])
    return marks
