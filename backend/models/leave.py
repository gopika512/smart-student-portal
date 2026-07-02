from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class LeaveRequestBase(BaseModel):
    student_id: str
    reason: str
    start_date: str
    end_date: str

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestInDB(LeaveRequestBase):
    id: str = Field(alias="_id")
    status: str = "pending" # 'pending', 'approved', 'rejected'
    created_at: datetime
    reviewed_by: Optional[str] = None
