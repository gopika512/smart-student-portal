from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import db_manager
from models.user import UserCreate, UserInDB, Token, UserLogin, UserBase
from core.security import verify_password, get_password_hash, create_access_token
from datetime import datetime
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    from core.security import settings
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db_manager.db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    user["_id"] = str(user["_id"])
    return user

@router.post("/register", response_model=UserInDB)
async def register(user: UserCreate):
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot register as admin through this endpoint")
    
    existing_user = await db_manager.db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.roll_number:
        existing_roll = await db_manager.db.users.find_one({"roll_number": user.roll_number})
        if existing_roll:
            raise HTTPException(status_code=400, detail="Roll number already registered")

    user_dict = user.model_dump()
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["created_at"] = datetime.utcnow()
    user_dict["_id"] = str(uuid.uuid4())
    
    await db_manager.db.users.insert_one(user_dict)
    
    return user_dict

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await db_manager.db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"email": user["email"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserInDB)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
