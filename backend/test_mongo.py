import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def test_connection():
    uri = os.getenv("MONGO_URI")
    print(f"Testing URI: {uri}")
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        # Attempt to fetch server info to force connection
        info = await client.server_info()
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print("FAILED TO CONNECT:")
        print(str(e))

if __name__ == "__main__":
    asyncio.run(test_connection())
