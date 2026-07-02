from fastapi import APIRouter, Depends, HTTPException
from database import db_manager
from routers.auth import get_current_user

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    total_students = await db_manager.db.users.count_documents({"role": "student"})
    
    # Calculate overall attendance roughly
    attendance_records = await db_manager.db.attendance.find({}).to_list(length=1000)
    total_present = 0
    total_records = 0
    for record in attendance_records:
        for r in record.get("records", []):
            total_records += 1
            if r["status"] == "present":
                total_present += 1
                
    overall_attendance = (total_present / total_records * 100) if total_records > 0 else 0
    
    recent_notices = await db_manager.db.notices.find({}).sort("created_at", -1).limit(5).to_list(length=5)
    for n in recent_notices:
        n["_id"] = str(n["_id"])
        
    return {
        "total_students": total_students,
        "overall_attendance_percentage": round(overall_attendance, 2),
        "recent_notices": recent_notices
    }
