from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AttendanceRecord(BaseModel):
    date: str # YYYY-MM-DD
    status: str # 'present', 'absent', 'late'

class AttendanceBase(BaseModel):
    student_id: str
    student_name: str
    roll_number: str
    records: List[AttendanceRecord] = []

class AttendanceInDB(AttendanceBase):
    id: str = Field(alias="_id")

class MarkAttendance(BaseModel):
    student_id: str
    date: str
    status: str
