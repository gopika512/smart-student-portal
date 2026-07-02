from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SubjectMark(BaseModel):
    subject: str
    marks_obtained: float
    total_marks: float

class MarksBase(BaseModel):
    student_id: str
    semester: str
    subjects: List[SubjectMark]
    total_percentage: Optional[float] = None

class MarksCreate(MarksBase):
    pass

class MarksInDB(MarksBase):
    id: str = Field(alias="_id")
    created_at: datetime
