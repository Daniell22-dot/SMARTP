from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.core.database import get_db
from app.models.property import Property
from app.models.tenant import Tenant
from app.models.unit import Unit
from app.models.users import User, UserRole
from app.api.endpoints.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class UnitSchema(BaseModel):
    id: int
    unit_number: str
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    monthly_rent: float
    is_occupied: bool

    class Config:
        from_attributes = True

class PropertySchema(BaseModel):
    id: int
    name: str
    address_line1: str
    city: str
    status: str
    monthly_rent: float = 0.0
    units: List[UnitSchema] = []

    class Config:
        from_attributes = True

class PropertyCreate(BaseModel):
    name: str
    address_line1: str
    city: str
    state: str = ""
    zip_code: str = ""
    property_type: str = "apartment"

class UnitCreate(BaseModel):
    unit_number: str
    monthly_rent: float
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None

def _to_schema(prop: Property) -> PropertySchema:
    rent = min((u.monthly_rent for u in prop.units), default=0.0) if prop.units else 0.0
    return PropertySchema(
        id=prop.id,
        name=prop.name,
        address_line1=prop.address_line1,
        city=prop.city,
        status=prop.status,
        monthly_rent=rent,
        units=[UnitSchema.model_validate(u) for u in prop.units],
    )

@router.get("/", response_model=List[PropertySchema])
async def get_properties(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Property).options(selectinload(Property.units)))
    return [_to_schema(p) for p in result.scalars().all()]

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=PropertySchema)
async def create_property(
    data: PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in (UserRole.LANDLORD, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only landlords can create properties")
    prop = Property(
        name=data.name,
        address_line1=data.address_line1,
        city=data.city,
        state=data.state,
        zip_code=data.zip_code,
        property_type=data.property_type,
        owner_id=current_user.id,
        total_units=0,
    )
    db.add(prop)
    await db.commit()
    result = await db.execute(
        select(Property).options(selectinload(Property.units)).where(Property.id == prop.id)
    )
    prop = result.scalar_one()
    return _to_schema(prop)

@router.post("/{property_id}/units", status_code=status.HTTP_201_CREATED, response_model=UnitSchema)
async def create_unit(
    property_id: int,
    data: UnitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in (UserRole.LANDLORD, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only landlords can add rooms")
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    unit = Unit(
        property_id=property_id,
        unit_number=data.unit_number,
        monthly_rent=data.monthly_rent,
        bedrooms=data.bedrooms,
        bathrooms=data.bathrooms,
    )
    db.add(unit)
    prop.total_units = (prop.total_units or 0) + 1
    await db.commit()
    await db.refresh(unit)
    return unit

@router.get("/my", response_model=List[PropertySchema])
async def get_my_properties(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Tenant)
        .options(selectinload(Tenant.unit))
        .where(Tenant.user_id == current_user.id)
    )
    tenant = result.scalars().first()
    if not tenant or not tenant.unit:
        return []

    result = await db.execute(
        select(Property)
        .options(selectinload(Property.units))
        .where(Property.id == tenant.unit.property_id)
    )
    prop = result.scalars().first()
    if not prop:
        return []

    return [_to_schema(prop)]
