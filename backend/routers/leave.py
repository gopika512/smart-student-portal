from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database import db_manager
from models.leave import LeaveRequestCreate, LeaveRequestInDB
from routers.auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/", response_model=LeaveRequestInDB)
async def create_leave_request(leave: LeaveRequestCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can request leave")

    leave_dict = leave.model_dump()
    leave_dict["_id"] = str(uuid.uuid4())
    leave_dict["created_at"] = datetime.utcnow()
    leave_dict["student_id"] = current_user["_id"]
    leave_dict["status"] = "pending"

    await db_manager.db.leave_requests.insert_one(leave_dict)
    return leave_dict

@router.get("/me", response_model=List[LeaveRequestInDB])
async def get_my_leave_requests(current_user: dict = Depends(get_current_user)):
    cursor = db_manager.db.leave_requests.find({"student_id": current_user["_id"]}).sort("created_at", -1)
    requests = await cursor.to_list(length=100)
    for r in requests:
        r["_id"] = str(r["_id"])
    return requests

@router.get("/all", response_model=List[LeaveRequestInDB])
async def get_all_leave_requests(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all leave requests")

    cursor = db_manager.db.leave_requests.find({}).sort("created_at", -1)
    requests = await cursor.to_list(length=1000)
    for r in requests:
        r["_id"] = str(r["_id"])
    return requests

@router.put("/{request_id}/status")
async def update_leave_status(request_id: str, status: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can approve/reject leave requests")
        
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    result = await db_manager.db.leave_requests.update_one(
        {"_id": request_id},
        {"$set": {"status": status, "reviewed_by": current_user["_id"]}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    return {"msg": f"Leave request {status}"}
