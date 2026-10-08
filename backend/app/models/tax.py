from sqlalchemy import Column, Float, Text
from app.models.base import BaseModel


class TaxSetting(BaseModel):
    """Manual KRA / county tax configuration entered by the landlord or admin.

    No values are hardcoded — the user knows what they owe and enters:
      - kra_tax_rate:  KRA corporate/rental tax rate as a percentage
      - county_rates:  annual county land rates in KES
      - tax_override:  an explicit tax amount in KES that overrides the estimate
      - notes:         free-text description shown on reports
    """
    __tablename__ = 'tax_settings'

    kra_tax_rate = Column(Float, default=0.0, nullable=False)
    county_rates = Column(Float, default=0.0, nullable=False)
    tax_override = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, default="")