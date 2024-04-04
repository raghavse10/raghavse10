from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class Connection(BaseModel):
    ID: str
    name: str
    gender: str
    district: str
    state: str
    pincode: str
    ownership: str
    gov_id_type: str
    id_number: str
    category: str
    load_applied: str
    date_created: datetime
    date_approved: datetime
    date_modified: datetime
    status: str
    review_id: str
    reviewer_name: str
    remarks: str


class UpdateConnection(BaseModel):
    name: Optional[str]
    gender: Optional[str]
    district: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    ownership: Optional[str]
    category: Optional[str]
    load_applied: Optional[str]
    date_approved: Optional[str]
    status: Optional[str]
    review_id: Optional[str]
    reviewer_name: Optional[str]
    remarks: Optional[str]
