from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Literal
import re

class AddressCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=5)
    address_line1: str = Field(..., min_length=5)
    address_line2: str | None = None
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    postal_code: str = Field(..., min_length=3)
    country: str = "United States"
    is_default: bool = False

class AddressOut(AddressCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int

class CheckoutRequest(BaseModel):
    contact_email: str
    contact_phone: str = Field(..., min_length=5)
    shipping_full_name: str = Field(..., min_length=2)
    shipping_address_line1: str = Field(..., min_length=5)
    shipping_address_line2: str | None = None
    shipping_city: str = Field(..., min_length=2)
    shipping_state: str = Field(..., min_length=2)
    shipping_postal_code: str = Field(..., min_length=3)
    shipping_country: str = "United States"
    notes: str | None = None

    @field_validator("contact_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", v):
            raise ValueError("Invalid email format")
        return v.lower()

class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int | None
    product_name: str
    product_sku: str | None
    unit_price: Decimal
    quantity: int
    line_total: Decimal

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    status: str
    contact_email: str
    contact_phone: str
    shipping_full_name: str
    shipping_address_line1: str
    shipping_address_line2: str | None
    shipping_city: str
    shipping_state: str
    shipping_postal_code: str
    shipping_country: str
    subtotal: Decimal
    shipping_cost: Decimal
    tax: Decimal
    total: Decimal
    notes: str | None
    payment_method: str
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemOut] = []

class OrderStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

class OrderListResponse(BaseModel):
    items: list[OrderOut]
    total: int
    page: int
    page_size: int
    pages: int
