from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "student" # 'student' or 'admin'

class UserCreate(UserBase):
    password: str
    roll_number: Optional[str] = None
    department: Optional[str] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    roll_number: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime
    profile_photo: Optional[str] = None

    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
