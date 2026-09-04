from datetime import datetime

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    account_id: str
    counterparty_id: str
    amount: float = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    transaction_type: str
    country: str = Field(min_length=2, max_length=2)


class TransactionResponse(BaseModel):
    id: str
    account_id: str
    counterparty_id: str
    amount: float
    currency: str
    transaction_type: str
    country: str
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }