from pydantic import BaseModel, Field
from datetime import datetime

class NoticeBase(BaseModel):
    title: str
    content: str
    author: str

class NoticeCreate(NoticeBase):
    pass

class NoticeInDB(NoticeBase):
    id: str = Field(alias="_id")
    created_at: datetime
