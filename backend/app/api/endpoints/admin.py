# backend/app/api/endpoints/admin.py
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, desc, and_
from typing import List, Optional
from datetime import datetime, timedelta
from app.config import settings
from app.core.database import get_db
from app.models.users import User, UserRole
from app.models.payment import Payment, PaymentStatus
from app.models.tenant import Tenant
from app.models.property import Property
from app.models.unit import Unit
from app.models.maintenance import MaintenanceRequest
from app.api.endpoints.auth import get_current_user
from app.api.endpoints.dependencies import get_current_admin, get_current_owner, get_current_caretaker
from pydantic import BaseModel, Field

router = APIRouter()

# ── Public (no auth) ────────────────────────────────────────────
@router.get("/public-stats")
async def get_public_stats(db: AsyncSession = Depends(get_db)):
    """Public stats for the landing page — no auth required"""
    try:
        result = await db.execute(select(func.count(User.id)).where(User.role == UserRole.TENANT))
        tenants = result.scalar() or 0

        result = await db.execute(select(func.count(Property.id)))
        properties = result.scalar() or 0

        result = await db.execute(select(func.count(Payment.id)).where(Payment.status == 'paid'))
        payments = result.scalar() or 0

        result = await db.execute(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == 'paid'))
        revenue = float(result.scalar() or 0)

        return {"properties": properties, "tenants": tenants, "payments": payments, "revenue": revenue}
    except Exception:
        return {"properties": 0, "tenants": 0, "payments": 0, "revenue": 0}

# Response Models
class SystemStatsResponse(BaseModel):
    total_revenue: str
    total_tax: str
    net_profit: str
    kra_details: str
    currency: str = "KES"
    timestamp: datetime = None

class DashboardMetrics(BaseModel):
    total_tenants: int
    total_properties: int
    total_units: int
    total_revenue: float
    monthly_revenue: float
    overdue_amount: float
    active_leases: int
    maintenance_requests: int
    occupancy_rate: float
    currency: str = "KES"

class RevenueChartData(BaseModel):
    labels: List[str]
    datasets: List[dict]

class PaymentSummary(BaseModel):
    total_payments: int
    total_amount: float
    completed_amount: float
    pending_amount: float
    overdue_amount: float
    average_payment: float

class TenantSummary(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    property_name: str
    unit_number: str
    monthly_rent: float
    status: str
    last_payment_date: Optional[datetime]
    arrears: float

class MaintenanceSummary(BaseModel):
    total_requests: int
    pending: int
    in_progress: int
    completed: int
    urgent_count: int

@router.get("/", status_code=status.HTTP_200_OK)
async def get_admin_dashboard(
    current_user: User = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard overview"""
    return {
        "message": "Admin Dashboard API",
        "status": "active",
        "user_role": current_user.role.value,
        "user_email": current_user.email,
        "server_time": datetime.utcnow().isoformat()
    }

async def _get_system_stats_internal(db: AsyncSession) -> SystemStatsResponse:
    """Internal helper to calculate system statistics"""
    # Calculate total revenue from completed payments
    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            Payment.status == 'paid'
        )
    )
    total_revenue = result.scalar() or 0.0
    
    # Calculate revenue for current year
    current_year = datetime.utcnow().year
    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            and_(
                Payment.status == 'completed',
                func.extract('year', Payment.payment_date) == current_year
            )
        )
    )
    yearly_revenue = result.scalar() or 0.0
    
    # Kenya corporate tax rate: 25% for rental income
    kra_tax_rate = 0.25
    
    # County rates (example: Nairobi County)
    county_rates = 25000  # KES annual
    
    # Calculate tax
    tax_due = (yearly_revenue * kra_tax_rate) + county_rates
    net_profit = total_revenue - tax_due
    
    return SystemStatsResponse(
        total_revenue=f"Ksh {total_revenue:,.2f}",
        total_tax=f"Ksh {tax_due:,.2f}",
        net_profit=f"Ksh {net_profit:,.2f}",
        kra_details="25% Corporate Tax + County Land Rates (Nairobi)",
        timestamp=datetime.utcnow()
    )

@router.get("/stats", response_model=SystemStatsResponse, status_code=status.HTTP_200_OK)
async def get_system_stats(
    current_user: User = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    """Get system financial statistics (Kenya/KRA specific)"""
    return await _get_system_stats_internal(db)

@router.get("/metrics", response_model=DashboardMetrics, status_code=status.HTTP_200_OK)
async def get_dashboard_metrics(
    current_user: User = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    """Get key dashboard metrics"""
    
    # Count total tenants — users with TENANT role (matches the tenant list endpoint)
    result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.TENANT)
    )
    total_tenants = result.scalar() or 0
    
    # Count total properties
    result = await db.execute(select(func.count(Property.id)))
    total_properties = result.scalar() or 0
    
    # Count total units
    result = await db.execute(select(func.count(Unit.id)))
    total_units = result.scalar() or 0
    
    # Calculate total revenue (all time)
    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            Payment.status == 'paid'
        )
    )
    total_revenue = result.scalar() or 0.0
    
    # Calculate monthly revenue (current month)
    current_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            and_(
                Payment.status == 'completed',
                Payment.payment_date >= current_month
            )
        )
    )
    monthly_revenue = result.scalar() or 0.0
    
    # Calculate overdue amount
    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            Payment.status == 'overdue'
        )
    )
    overdue_amount = result.scalar() or 0.0
    
    # Calculate active leases (tenants with active status)
    result = await db.execute(
        select(func.count(Tenant.id)).where(Tenant.status == 'active')
    )
    active_leases = result.scalar() or 0
    
    # Count maintenance requests
    result = await db.execute(select(func.count(MaintenanceRequest.id)))
    maintenance_requests = result.scalar() or 0
    
    # Calculate occupancy rate
    occupied_units = await db.execute(
        select(func.count(Unit.id)).where(Unit.is_occupied == True)
    )
    occupied = occupied_units.scalar() or 0
    occupancy_rate = (occupied / total_units * 100) if total_units > 0 else 0
    
    return DashboardMetrics(
        total_tenants=total_tenants,
        total_properties=total_properties,
        total_units=total_units,
        total_revenue=total_revenue,
        monthly_revenue=monthly_revenue,
        overdue_amount=overdue_amount,
        active_leases=active_leases,
        maintenance_requests=maintenance_requests,
        occupancy_rate=round(occupancy_rate, 2)
    )

@router.get("/revenue-chart", response_model=RevenueChartData)
async def get_revenue_chart(
    period: str = Query("6", description="Number of months to show"),
    current_user: User = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    """Get revenue data for charts"""
    
    months = int(period)
    labels = []
    revenues = []
    
    for i in range(months - 1, -1, -1):
        date = datetime.utcnow() - timedelta(days=30 * i)
        month_start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Calculate next month start
        if month_start.month == 12:
            next_month = month_start.replace(year=month_start.year + 1, month=1)
        else:
            next_month = month_start.replace(month=month_start.month + 1)
        
        result = await db.execute(
            select(func.sum(Payment.amount)).where(
                and_(
                    Payment.status == 'completed',
                    Payment.payment_date >= month_start,
                    Payment.payment_date < next_month
                )
            )
        )
        revenue = result.scalar() or 0.0
        
        labels.append(month_start.strftime("%b %Y"))
        revenues.append(revenue)
    
    return RevenueChartData(
        labels=labels,
        datasets=[{
            "label": "Revenue (KES)",
            "data": revenues,
            "borderColor": "#4f46e5",
            "backgroundColor": "rgba(79, 70, 229, 0.1)",
            "tension": 0.4,
            "fill": True
        }]
    )

@router.get("/payments/summary", response_model=PaymentSummary)
async def get_payment_summary(
    current_user: User = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    """Get payment summary statistics"""
    
    # Total payments count
    result = await db.execute(select(func.count(Payment.id)))
    total_payments = result.scalar() or 0
    
    # Total amount
    result = await db.execute(select(func.sum(Payment.amount)))
    total_amount = result.scalar() or 0.0
    
    # Completed payments
    result = await db.execute(
        select(func.sum(Payment.amount)).where(Payment.status == 'paid')
    )
    completed_amount = result.scalar() or 0.0
    
    # Pending payments
    result = await db.execute(
        select(func.sum(Payment.amount)).where(Payment.status == 'pending')
    )
    pending_amount = result.scalar() or 0.0
    
    # Overdue payments
    result = await db.execute(
        select(func.sum(Payment.amount)).where(Payment.status == 'overdue')
    )
    overdue_amount = result.scalar() or 0.0
    
    # Average payment
    average_payment = total_amount / total_payments if total_payments > 0 else 0
    
    return PaymentSummary(
        total_payments=total_payments,
        total_amount=total_amount,
        completed_amount=completed_amount,
        pending_amount=pending_amount,
        overdue_amount=overdue_amount,
        average_payment=average_payment
    )

@router.get("/tenants", response_model=List[TenantSummary])
async def get_all_tenants_summary(
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    """Get summary of all tenants"""
    try:
        query = select(
            User.id,
            User.first_name,
            User.last_name,
            User.email,
            User.phone,
            Property.name.label("property_name"),
            Unit.unit_number,
            Unit.monthly_rent,
            Tenant.status,
            Tenant.id.label("tenant_record_id"),
            func.max(Payment.payment_date).label("last_payment_date")
        ).select_from(User)\
         .outerjoin(Tenant, User.id == Tenant.user_id)\
         .outerjoin(Unit, Tenant.unit_id == Unit.id)\
         .outerjoin(Property, Unit.property_id == Property.id)\
         .outerjoin(Payment, Tenant.id == Payment.tenant_id)\
         .where(User.role == UserRole.TENANT)\
         .group_by(User.id, User.first_name, User.last_name, User.email, User.phone, Property.name, Unit.unit_number, Unit.monthly_rent, Tenant.status, Tenant.id)
        
        if status:
            query = query.where(Tenant.status == status)
        
        result = await db.execute(query)
        tenants_data = result.all()
        
        tenants_summary = []
        for tenant in tenants_data:
            arrears = 0.0
            if tenant.tenant_record_id:
                expected_rent = tenant.monthly_rent or 0
                arrears_result = await db.execute(
                    select(func.coalesce(func.sum(Payment.amount), 0)).where(
                        and_(
                            Payment.tenant_id == tenant.tenant_record_id,
                            Payment.status == 'paid'
                        )
                    )
                )
                total_paid = arrears_result.scalar() or 0
                arrears = max(0, expected_rent - total_paid)
            
            tenants_summary.append(TenantSummary(
                id=tenant.id,
                name=f"{tenant.first_name or ''} {tenant.last_name or ''}".strip() or "Unknown",
                email=tenant.email or "N/A",
                phone=tenant.phone or "N/A",
                property_name=tenant.property_name or "Unassigned",
                unit_number=tenant.unit_number or "N/A",
                monthly_rent=tenant.monthly_rent or 0.0,
                status=tenant.status or "active",
                last_payment_date=tenant.last_payment_date,
                arrears=arrears
            ))
        
        return tenants_summary
    except Exception as e:
        import logging
        logging.error(f"Error in get_all_tenants_summary: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to load tenants: {str(e)}")

@router.get("/tenants/{user_id}", response_model=TenantSummary)
async def get_tenant_by_user_id(
    user_id: int,
    current_user: User = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a specific tenant by user_id"""
    
    query = select(
        User.id,
        User.first_name,
        User.last_name,
        User.email,
        User.phone,
        Property.name.label("property_name"),
        Unit.unit_number,
        Unit.monthly_rent,
        Tenant.status,
        Tenant.id.label("tenant_record_id"),
        func.max(Payment.payment_date).label("last_payment_date")
    ).select_from(User)\
     .outerjoin(Tenant, User.id == Tenant.user_id)\
     .outerjoin(Unit, Tenant.unit_id == Unit.id)\
     .outerjoin(Property, Unit.property_id == Property.id)\
     .outerjoin(Payment, Tenant.id == Payment.tenant_id)\
     .where(and_(User.id == user_id, User.role == UserRole.TENANT))\
     .group_by(User.id, User.first_name, User.last_name, User.email, User.phone, Property.name, Unit.unit_number, Unit.monthly_rent, Tenant.status, Tenant.id)
    
    result = await db.execute(query)
    tenant = result.first()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Calculate arrears
    arrears = 0.0
    if tenant.tenant_record_id:
        expected_rent = tenant.monthly_rent or 0
        result = await db.execute(
            select(func.sum(Payment.amount)).where(
                and_(
                    Payment.tenant_id == tenant.tenant_record_id,
                    Payment.status == 'paid'
                )
            )
        )
        total_paid = result.scalar() or 0
        arrears = max(0, expected_rent - total_paid)
    
    return TenantSummary(
        id=tenant.id,
        name=f"{tenant.first_name} {tenant.last_name or ''}".strip(),
        email=tenant.email,
        phone=tenant.phone or "N/A",
        property_name=tenant.property_name or "Unassigned",
        unit_number=tenant.unit_number or "N/A",
        monthly_rent=tenant.monthly_rent or 0.0,
        status=tenant.status or "active",
        last_payment_date=tenant.last_payment_date,
        arrears=arrears
    )

@router.get("/maintenance/summary", response_model=MaintenanceSummary)
async def get_maintenance_summary(
    current_user: User = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    """Get maintenance request summary"""
    
    # Total requests
    result = await db.execute(select(func.count(MaintenanceRequest.id)))
    total = result.scalar() or 0
    
    # Pending
    result = await db.execute(
        select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.status == "pending"
        )
    )
    pending = result.scalar() or 0
    
    # In progress
    result = await db.execute(
        select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.status == "in_progress"
        )
    )
    in_progress = result.scalar() or 0
    
    # Completed
    result = await db.execute(
        select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.status == "completed"
        )
    )
    completed = result.scalar() or 0
    
    # Urgent (priority high or urgent)
    result = await db.execute(
        select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.priority.in_(["high", "urgent"])
        )
    )
    urgent = result.scalar() or 0
    
    return MaintenanceSummary(
        total_requests=total,
        pending=pending,
        in_progress=in_progress,
        completed=completed,
        urgent_count=urgent
    )

@router.post("/shutdown", status_code=status.HTTP_200_OK)
async def shutdown_system(
    confirm: str = Query(..., description="Confirmation code"),
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only: Request system shutdown (requires confirmation)"""
    
    if confirm != "SHUTDOWN_CONFIRM":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid confirmation code. Please use 'SHUTDOWN_CONFIRM'"
        )
    
    return {
        "message": "Shutdown request received - shutting down in 5 seconds",
        "requires_confirmation": True,
        "shutdown_initiated_by": current_user.email,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/system-info")
async def get_system_info(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get system information (admin only)"""
    
    # Get database size (approximate)
    result = await db.execute(select(func.count(User.id)))
    user_count = result.scalar() or 0
    
    result = await db.execute(select(func.count(Property.id)))
    property_count = result.scalar() or 0
    
    result = await db.execute(select(func.count(Payment.id)))
    payment_count = result.scalar() or 0
    
    return {
        "system_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "production",
        "statistics": {
            "total_users": user_count,
            "total_properties": property_count,
            "total_payments": payment_count
        },
        "server_time": datetime.utcnow().isoformat(),
        "timezone": "Africa/Nairobi"
    }

@router.delete("/tenants/{user_id}", status_code=status.HTTP_200_OK)
async def delete_tenant(
    user_id: int,
    current_user: User = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    """Admin/Owner only: Delete a tenant account and associated records"""
    
    # 1. Find the user
    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target_user.role != UserRole.TENANT:
        raise HTTPException(status_code=400, detail="Only tenant accounts can be deleted from here")

    # 2. Delete Tenant record first (if exists)
    from sqlalchemy import delete
    await db.execute(delete(Tenant).where(Tenant.user_id == user_id))
    
    # 3. Delete the User
    await db.execute(delete(User).where(User.id == user_id))
    
    await db.commit()
    return {"message": "Tenant account and associated records deleted successfully"}


# ═══════════════════════════════════════════════════════════════════════
# CARETAKER / PROPERTY MANAGER ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@router.get("/caretaker/dashboard", response_model=DashboardMetrics)
async def get_caretaker_dashboard(
    current_user: User = Depends(get_current_caretaker),
    db: AsyncSession = Depends(get_db)
):
    """Get caretaker/dashboard metrics - property manager view"""
    
    # Count total tenants
    result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.TENANT)
    )
    total_tenants = result.scalar() or 0
    
    # Count total properties
    result = await db.execute(select(func.count(Property.id)))
    total_properties = result.scalar() or 0
    
    # Count total units
    result = await db.execute(select(func.count(Unit.id)))
    total_units = result.scalar() or 0
    
    # Calculate total revenue (all time)
    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            Payment.status == 'paid'
        )
    )
    total_revenue = float(result.scalar() or 0.0)
    
    # Monthly revenue (current month)
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year
    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            and_(
                Payment.status == 'paid',
                func.extract('month', Payment.payment_date) == current_month,
                func.extract('year', Payment.payment_date) == current_year
            )
        )
    )
    monthly_revenue = float(result.scalar() or 0.0)
    
    # Overdue amount
    result = await db.execute(
        select(func.sum(Payment.amount)).where(
            and_(
                Payment.status.in_(['pending', 'overdue']),
                Payment.due_date < datetime.utcnow()
            )
        )
    )
    overdue_amount = float(result.scalar() or 0.0)
    
    # Active leases (tenants with active status and unit assigned)
    result = await db.execute(
        select(func.count(Tenant.id)).where(
            and_(
                Tenant.status == 'active',
                Tenant.unit_id.isnot(None)
            )
        )
    )
    active_leases = result.scalar() or 0
    
    # Maintenance requests
    result = await db.execute(select(func.count(MaintenanceRequest.id)))
    maintenance_requests = result.scalar() or 0
    
    # Occupancy rate
    occupancy_rate = (total_units > 0) and (active_leases / total_units * 100) or 0.0
    
    return DashboardMetrics(
        total_tenants=total_tenants,
        total_properties=total_properties,
        total_units=total_units,
        total_revenue=total_revenue,
        monthly_revenue=monthly_revenue,
        overdue_amount=overdue_amount,
        active_leases=active_leases,
        maintenance_requests=maintenance_requests,
        occupancy_rate=round(occupancy_rate, 2),
        currency="KES"
    )


@router.get("/caretaker/properties")
async def get_caretaker_properties(
    current_user: User = Depends(get_current_caretaker),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get all properties for caretaker management"""
    result = await db.execute(
        select(Property)
        .offset(skip)
        .limit(limit)
        .order_by(Property.created_at.desc())
    )
    properties = result.scalars().all()
    
    return [{
        "id": p.id,
        "name": p.name,
        "property_type": p.property_type,
        "address_line1": p.address_line1,
        "city": p.city,
        "state": p.state,
        "total_units": p.total_units,
        "total_rental_income": p.total_rental_income,
        "occupancy_rate": p.occupancy_rate,
        "status": p.status,
    } for p in properties]


@router.get("/caretaker/maintenance")
async def get_caretaker_maintenance(
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_caretaker),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get all maintenance requests for caretaker"""
    query = select(MaintenanceRequest, Tenant, User, Unit, Property)\
        .join(Tenant, MaintenanceRequest.tenant_id == Tenant.id)\
        .join(User, Tenant.user_id == User.id)\
        .join(Unit, Tenant.unit_id == Unit.id)\
        .join(Property, Unit.property_id == Property.id)
    
    if status:
        query = query.where(MaintenanceRequest.status == status)
    
    query = query.order_by(MaintenanceRequest.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    results = result.all()
    
    return [{
        "id": mr.id,
        "title": mr.title,
        "description": mr.description,
        "status": mr.status,
        "priority": mr.priority,
        "created_at": mr.created_at,
        "tenant_name": f"{tenant.first_name} {tenant.last_name}",
        "tenant_email": user.email,
        "tenant_phone": user.phone,
        "unit_number": unit.unit_number,
        "property_name": prop.name,
    } for mr, tenant, user, unit, prop in results]


@router.put("/caretaker/maintenance/{request_id}/status")
async def update_maintenance_status_caretaker(
    request_id: int,
    new_status: str = Query(..., description="New status"),
    current_user: User = Depends(get_current_caretaker),
    db: AsyncSession = Depends(get_db)
):
    """Update maintenance request status (caretaker)"""
    valid_statuses = ['pending', 'in_progress', 'completed', 'cancelled']
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.execute(select(MaintenanceRequest).where(MaintenanceRequest.id == request_id))
    request = result.scalars().first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    request.status = new_status
    await db.commit()
    
    return {"message": "Maintenance request status updated", "status": new_status}


@router.get("/caretaker/tenants")
async def get_caretaker_tenants(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_caretaker),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get all tenants for caretaker"""
    query = select(
        User.id,
        User.first_name,
        User.last_name,
        User.email,
        User.phone,
        Property.name.label("property_name"),
        Unit.unit_number,
        Unit.monthly_rent,
        Tenant.status,
        Tenant.id.label("tenant_record_id"),
        func.max(Payment.payment_date).label("last_payment_date")
    ).select_from(User)\
        .outerjoin(Tenant, User.id == Tenant.user_id)\
        .outerjoin(Unit, Tenant.unit_id == Unit.id)\
        .outerjoin(Property, Unit.property_id == Property.id)\
        .outerjoin(Payment, Tenant.id == Payment.tenant_id)\
        .where(User.role == UserRole.TENANT)\
        .group_by(User.id, User.first_name, User.last_name, User.email, User.phone,
                  Property.name, Unit.unit_number, Unit.monthly_rent, Tenant.status, Tenant.id)\
        .order_by(User.last_name, User.first_name)\
        .offset(skip).limit(limit)
    
    if status_filter:
        query = query.where(Tenant.status == status_filter)
    
    result = await db.execute(query)
    rows = result.all()
    
    return [{
        "id": row.id,
        "first_name": row.first_name,
        "last_name": row.last_name,
        "email": row.email,
        "phone": row.phone,
        "property_name": row.property_name,
        "unit_number": row.unit_number,
        "monthly_rent": float(row.monthly_rent) if row.monthly_rent else 0,
        "status": row.status,
        "tenant_record_id": row.tenant_record_id,
        "last_payment_date": row.last_payment_date.isoformat() if row.last_payment_date else None,
    } for row in rows]