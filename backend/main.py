from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connect_to_mongo, close_mongo_connection
from routers import auth, students, attendance, notices, dashboard, marks, leave, assignments

app = FastAPI(title="Smart Student Management Portal API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(notices.router, prefix="/api/notices", tags=["Notices"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(marks.router, prefix="/api/marks", tags=["Marks"])
app.include_router(leave.router, prefix="/api/leave", tags=["Leave"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])

@app.get("/")
async def root():
    return {"message": "Welcome to Smart Student Management Portal API"}
