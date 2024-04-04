from datetime import datetime, timedelta
from typing import Dict, Optional

from fastapi.params import Body

from database.connection import database
from fastapi import APIRouter

from models.dbvn import UpdateConnection
from models.request import ShowConnectionsRequest
from models.response import Response


router = APIRouter(
    tags=["DBVN"],
    responses={404: {"description": "Not found"}},
)


@router.put("/update-connection")
async def update_connection(ID: str, req: Dict[str, str] = Body(...)):
    now = datetime.now()
    result = UpdateConnection(**req)
    update = {key: value for key, value in vars(result).items() if value != None}
    update["date_modified"] = now
    if "date_approved" in update.keys():
        try:
            date_approved = datetime.strptime(update["date_approved"], "%d-%m-%Y")
            update["date_approved"] = date_approved
        except ValueError:
            del(update["date_approved"])

    if "load_applied" in update.keys() and update["load_applied"] != "":
        try:
            int_load = int(update["load_applied"])
        except ValueError:
            del(update["load_applied"])
            int_load = 0
        if int_load > 200:
            update["load_applied"] = "200"
        elif int_load < 0:
            update["load_applied"] = "0"

    result = await database.connections.update_one({"ID": ID}, {'$set': update})
    if result:
        data = {}
        error = False
        code = 200
        message = "Connection updated!"
    else:
        data = {}
        error = True
        code = 400
        message = "Something went wrong."
    return Response(data, code, message, error)


@router.post("/show-connections")
async def show_connections(request: ShowConnectionsRequest):
    search = ""
    if request.search:
        search = request.search
    try:
        limit = 50
        offset = (int(request.page)-1)*50
    except ValueError:
        return "Invalid page"

    date_pipeline = []
    start_date = ""
    end_date = ""

    if request.from_date:
        try:
            start_date = datetime.strptime(request.from_date, "%Y-%m-%d")
        except ValueError:
            start_date = ""
    if request.to_date:
        try:
            end_date = datetime.strptime(request.to_date, "%Y-%m-%d") + timedelta(days=1)
        except ValueError:
            end_date = ""

    if start_date and end_date:
        date_pipeline = [
            {
                '$match': {
                    'date_created': {'$lt': end_date, '$gte': start_date}
                }
            }
        ]
    elif start_date:
        date_pipeline = [
            {
                '$match': {
                    'date_created': {'$gte': start_date}
                }
            }
        ]
    elif end_date:
        date_pipeline = [
            {
                '$match': {
                    'date_created': {'$lt': end_date}
                }
            }
        ]

    if search:
        filter_pipeline = [
            {
                "$match": {
                    '$and': [
                        {
                            '$or': [
                                {"ID": {'$regex': search, '$options': 'i'}},
                                {"name": {'$regex': search, '$options': 'i'}},
                                {"gender": {'$regex': search, '$options': 'i'}},
                                {"district": {'$regex': search, '$options': 'i'}},
                                {"state": {'$regex': search, '$options': 'i'}},
                                {"pincode": {'$regex': search, '$options': 'i'}},
                                {"ownership": {'$regex': search, '$options': 'i'}},
                                {"category": {'$regex': search, '$options': 'i'}},
                                {"status": {'$regex': search, '$options': 'i'}},
                                {"reviewer_name": {'$regex': search, '$options': 'i'}},
                                {"gov_id_type": {'$regex': search, '$options': 'i'}}
                            ],
                        }
                    ]
                }
            }
        ]
    else:
        filter_pipeline = []
    limit_pipeline = [
        {
            '$sort': {
                'ID': 1
            }
        },
        {
            '$project': {
                '_id': 0
            }
        },
        {
            '$addFields': {
                "date_created": {
                    "$dateToString": {
                        "format": "%d-%m-%Y",  # Define your desired date format
                        "date": "$date_created"  # Replace with the actual field name
                    }
                },
                "date_modified": {
                    "$dateToString": {
                        "format": "%d-%m-%Y",  # Define your desired date format
                        "date": "$date_modified"  # Replace with the actual field name
                    }
                },
                "date_approved": {
                    "$dateToString": {
                        "format": "%d-%m-%Y",  # Define your desired date format
                        "date": "$date_approved"  # Replace with the actual field name
                    }
                },
            }
        },
        {
            '$group': {
                '_id': None,  # Use None to count all documents without grouping
                'count': {'$sum': 1},  # Count the documents
                'documents': {'$push': '$$ROOT'}  # Accumulate documents in an array
            }
        },
        {
            '$project': {
                '_id': 0,
                'documents': {
                    '$slice': ['$documents', offset, limit]  # Apply limit and offset
                },
                'count': 1
            }
        }
    ]
    pipeline = date_pipeline + filter_pipeline + limit_pipeline
    result = await database.connections.aggregate(pipeline).to_list(None)

    if not result:
        result = {'count': 0, 'documents': []}
    else:
        result = result[0]
    data = result
    error = False
    code = 200
    message = "Connections displayed"
    return Response(data, code, message, error)


@router.get("/graph-connections")
async def graph_connections(from_date: str, to_date: str, search: Optional[str] = ""):
    try:
        start_date = datetime.strptime(from_date, "%Y-%m-%d")
        end_date = datetime.strptime(to_date, "%Y-%m-%d")
    except ValueError:
        return "Invalid dates"
    match_pipeline = []
    if search:
        match_pipeline = [
            {
                '$match': {
                    "status": {'$regex': search, '$options': 'i'}
                }
            }
        ]
    pipeline = [
        {
            '$match': {
                'date_created': {'$lte': end_date, '$gte': start_date}
            }
        },
        {
            '$project': {
                '_id': 0,
                "date_created_str": {
                    "$dateToString": {
                        "date": "$date_created",
                        "format": "%Y-%m-%d" + " 00:00:00"
                    }
                },
            }
        },
        {
            '$group': {
                '_id': '$date_created_str',
                'count': {'$sum': 1},
            }
        },
        {
            '$sort': {
                '_id': 1
            }
        },
    ]
    pipeline = match_pipeline + pipeline
    result = await database.connections.aggregate(pipeline).to_list(None)
    result_dict = {}
    for item in result:
        result_dict[item['_id']] = item["count"]

    final_result = []
    next_date = start_date
    while next_date <= end_date:
        count = 0
        str_date = str(next_date)
        if str_date in result_dict.keys():
            count = result_dict[str_date]
        final_result_dict = {
            'count': count,
            'date': next_date.strftime("%d-%m-%y")
        }
        final_result.append(final_result_dict)
        next_date = next_date + timedelta(days=1)
    return final_result
