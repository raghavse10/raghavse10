from datetime import datetime
from database.connection import database
from fastapi import APIRouter

router = APIRouter(
    tags=["Helper"],
    responses={404: {"description": "Not found"}},
)


@router.post("/convert-id-to-string")
async def id_to_string():
    pointer = database.connections.find()
    async for item in pointer:
        str_var = str(int(item['id_number']))
        await database.connections.update_one({'_id': item['_id']}, {'$set': {'id_number': str_var}})
    return "done"


@router.put("/convert-string-to-date")
async def string_to_date():
    pointer = database.connections.find()
    count = 0
    async for item in pointer:
        try:
            date_created = datetime.strptime(item['date_created'], "%d-%m-%Y")
        except (ValueError, KeyError):
            date_created = ""
        try:
            date_approved = datetime.strptime(item['date_approved'], "%d-%m-%Y")
        except (ValueError, KeyError):
            date_approved = ""
        try:
            date_modified = datetime.strptime(item['date_modified'], "%d-%m-%Y")
        except (ValueError, KeyError):
            date_modified = ""

        update_dict = {}
        if date_created:
            update_dict["date_created"] = date_created
        if date_approved:
            update_dict["date_approved"] = date_approved
        if date_modified:
            update_dict["date_modified"] = date_modified
        if update_dict:
            await database.connections.update_one({'_id': item['_id']}, {'$set': update_dict})
            count += 1
    return count
