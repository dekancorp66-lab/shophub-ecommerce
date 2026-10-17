from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.product import ProductListItem

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1, le=100)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=100)

class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    quantity: int
    product: ProductListItem
    line_total: Decimal

class CartOut(BaseModel):
    items: list[CartItemOut]
    subtotal: Decimal
    item_count: int
