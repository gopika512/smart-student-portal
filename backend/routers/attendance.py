from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database import db_manager
from models.attendance import MarkAttendance, AttendanceInDB
from routers.auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/mark")
async def mark_attendance(attendance: MarkAttendance, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can mark attendance")

    student = await db_manager.db.users.find_one({"_id": attendance.student_id, "role": "student"})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing_record = await db_manager.db.attendance.find_one({"student_id": attendance.student_id})
    
    new_record = {
        "date": attendance.date,
        "status": attendance.status
    }

    if existing_record:
        # Update existing record
        await db_manager.db.attendance.update_one(
            {"_id": existing_record["_id"]},
            {"$push": {"records": new_record}}
        )
    else:
        # Create new record
        attendance_doc = {
            "_id": str(uuid.uuid4()),
            "student_id": attendance.student_id,
            "student_name": student["full_name"],
            "roll_number": student.get("roll_number", ""),
            "records": [new_record]
        }
        await db_manager.db.attendance.insert_one(attendance_doc)

    return {"msg": "Attendance marked successfully"}

@router.get("/me")
async def get_my_attendance(current_user: dict = Depends(get_current_user)):
    record = await db_manager.db.attendance.find_one({"student_id": current_user["_id"]})
    if not record:
        return {"records": [], "percentage": 0}
    
    total = len(record["records"])
    present = sum(1 for r in record["records"] if r["status"] == "present")
    percentage = (present / total * 100) if total > 0 else 0
    
    return {
        "records": record["records"],
        "percentage": round(percentage, 2)
    }

@router.get("/all", response_model=List[AttendanceInDB])
async def get_all_attendance(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    cursor = db_manager.db.attendance.find({})
    records = await cursor.to_list(length=1000)
    for r in records:
        r["_id"] = str(r["_id"])
    return records
