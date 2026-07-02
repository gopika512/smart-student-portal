from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Submission(BaseModel):
    student_id: str
    student_name: str
    submission_text: Optional[str] = None
    submission_url: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

class AssignmentBase(BaseModel):
    title: str
    description: str
    due_date: datetime
    department: str

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentInDB(AssignmentBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    submissions: List[Submission] = []

    class Config:
        populate_by_name = True
