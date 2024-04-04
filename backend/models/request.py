from typing import List, Any, Dict, Optional

from pydantic import BaseModel, Field


class ShowConnectionsRequest(BaseModel):
    from_date: str = Field(
        "", title="old_assignee_id Name", max_length=1000
    )
    to_date: str = Field(
        "", title="old_assignee_name Name", max_length=1000
    )
    page: int = 1
    search: Optional[str] = ""

