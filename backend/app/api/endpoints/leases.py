from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import date
from typing import Optional

from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models.users import User
from app.models.tenant import Tenant
from app.models.lease import Lease

router = APIRouter()

class LeaseOut(BaseModel):
    id: int
    start_date: date
    end_date: date
    monthly_rent: float
    security_deposit: Optional[float] = None
    status: str

    class Config:
        from_attributes = True

@router.get("/my", response_model=LeaseOut)
async def get_my_lease(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Tenant).filter(Tenant.user_id == current_user.id))
    tenant = result.scalars().first()
    if tenant is None:
        raise HTTPException(status_code=404, detail="No tenant profile found")

    result = await db.execute(
        select(Lease)
        .filter(Lease.tenant_id == tenant.id, Lease.status == "active")
        .order_by(Lease.start_date.desc())
    )
    lease = result.scalars().first()
    if lease is None:
        raise HTTPException(status_code=404, detail="No active lease found")

    return lease