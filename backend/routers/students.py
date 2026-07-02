from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database import db_manager
from models.user import UserInDB
from routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[UserInDB])
async def get_all_students(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    students_cursor = db_manager.db.users.find({"role": "student"})
    students = await students_cursor.to_list(length=1000)
    for student in students:
        student["_id"] = str(student["_id"])
    return students

@router.get("/search", response_model=List[UserInDB])
async def search_students(query: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    students_cursor = db_manager.db.users.find({
        "role": "student",
        "$or": [
            {"full_name": {"$regex": query, "$options": "i"}},
            {"roll_number": {"$regex": query, "$options": "i"}}
        ]
    })
    students = await students_cursor.to_list(length=100)
    for student in students:
        student["_id"] = str(student["_id"])
    return students
