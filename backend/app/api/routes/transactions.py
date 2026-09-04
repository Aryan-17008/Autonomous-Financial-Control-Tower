import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models import Transaction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
)

router = APIRouter()


@router.post(
    "/",
    response_model=TransactionResponse,
)
async def create_transaction(
    transaction: TransactionCreate,
    db: AsyncSession = Depends(get_db),
):
    transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"

    new_transaction = Transaction(
        id=transaction_id,
        account_id=transaction.account_id,
        counterparty_id=transaction.counterparty_id,
        amount=transaction.amount,
        currency=transaction.currency.upper(),
        transaction_type=transaction.transaction_type,
        country=transaction.country.upper(),
    )

    db.add(new_transaction)

    await db.commit()
    await db.refresh(new_transaction)

    return new_transaction