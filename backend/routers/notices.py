from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database import db_manager
from models.notice import NoticeCreate, NoticeInDB
from routers.auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/", response_model=NoticeInDB)
async def create_notice(notice: NoticeCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create notices")

    notice_dict = notice.model_dump()
    notice_dict["_id"] = str(uuid.uuid4())
    notice_dict["created_at"] = datetime.utcnow()

    await db_manager.db.notices.insert_one(notice_dict)
    return notice_dict

@router.get("/", response_model=List[NoticeInDB])
async def get_notices(current_user: dict = Depends(get_current_user)):
    cursor = db_manager.db.notices.find({}).sort("created_at", -1)
    notices = await cursor.to_list(length=50)
    for n in notices:
        n["_id"] = str(n["_id"])
    return notices

@router.delete("/{notice_id}")
async def delete_notice(notice_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete notices")

    result = await db_manager.db.notices.delete_one({"_id": notice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    return {"msg": "Notice deleted successfully"}
