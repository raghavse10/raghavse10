from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes.api import router as api_router
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

import uvicorn
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(api_router)
origins = ['http://localhost:3000', '*', 'http://0.0.0.0:3000']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
