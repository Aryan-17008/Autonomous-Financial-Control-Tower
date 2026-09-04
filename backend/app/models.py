from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    account_id: Mapped[str] = mapped_column(String, index=True)

    counterparty_id: Mapped[str] = mapped_column(
        String,
        index=True,
    )

    amount: Mapped[float] = mapped_column(Float)

    currency: Mapped[str] = mapped_column(String(3))

    transaction_type: Mapped[str] = mapped_column(String)

    country: Mapped[str] = mapped_column(String(2))

    status: Mapped[str] = mapped_column(
        String,
        default="pending",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )