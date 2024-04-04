from fastapi import APIRouter
from endpoints import dbvn

router = APIRouter()
router.include_router(dbvn.router)
