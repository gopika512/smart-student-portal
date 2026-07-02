from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from database import db_manager
from models.user import UserInDB
from routers.auth import get_current_user
from models.assignment import AssignmentCreate, AssignmentInDB, Submission
import uuid
from datetime import datetime

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.post("/", response_model=AssignmentInDB)
async def create_assignment(assignment: AssignmentCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    assignment_data = assignment.model_dump()
    assignment_data["_id"] = str(uuid.uuid4())
    assignment_data["created_at"] = datetime.utcnow()
    assignment_data["submissions"] = []
    
    await db_manager.db.assignments.insert_one(assignment_data)
    return assignment_data

@router.get("/", response_model=List[AssignmentInDB])
async def get_assignments(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "student":
        # Students see assignments for their department, or if department is "All"
        department = current_user.get("department", "General")
        query = {"$or": [{"department": department}, {"department": "All"}]}
    else:
        # Admins see all assignments
        query = {}
        
    assignments = await db_manager.db.assignments.find(query).to_list(100)
    return assignments

@router.post("/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: str, 
    submission: dict, 
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can submit assignments")
        
    assignment = await db_manager.db.assignments.find_one({"_id": assignment_id})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    # Create submission
    new_sub = {
        "student_id": current_user["_id"],
        "student_name": current_user["full_name"],
        "submission_text": submission.get("submission_text"),
        "submission_url": submission.get("submission_url"),
        "submitted_at": datetime.utcnow()
    }
    
    # Check if student already submitted (optional, we allow overwrite for simplicity)
    await db_manager.db.assignments.update_one(
        {"_id": assignment_id},
        {"$push": {"submissions": new_sub}}
    )
    
    return {"msg": "Assignment submitted successfully"}
