import asyncio
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import uuid

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    uri = os.getenv("MONGO_URI")
    client = AsyncIOMotorClient(uri)
    db = client.smart_student_portal
    
    admin_email = "admin@smartportal.com"
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin:
        print(f"Admin account already exists! Email: {admin_email}")
        return
        
    admin_data = {
        "_id": str(uuid.uuid4()),
        "email": admin_email,
        "full_name": "Portal Administrator",
        "role": "admin",
        "password": pwd_context.hash("admin123"),
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(admin_data)
    print("=========================================")
    print("SUCCESS: Admin account created!")
    print(f"Email: {admin_email}")
    print("Password: admin123")
    print("=========================================")

if __name__ == "__main__":
    asyncio.run(create_admin())
