from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict, field_validator
import re

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None
    is_active: bool | None = None

class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    is_active: bool
    created_at: datetime

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str
    price: Decimal = Field(..., gt=0, decimal_places=2)
    compare_at_price: Decimal | None = Field(None, gt=0, decimal_places=2)
    stock: int = Field(..., ge=0)
    sku: str | None = None
    image_url: str | None = None
    is_featured: bool = False
    category_id: int | None = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(None, gt=0, decimal_places=2)
    compare_at_price: Decimal | None = Field(None, gt=0, decimal_places=2)
    stock: int | None = Field(None, ge=0)
    sku: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    category_id: int | None = None

class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    category: CategoryOut | None = None

class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    price: Decimal
    compare_at_price: Decimal | None
    stock: int
    image_url: str | None
    is_featured: bool
    category_id: int | None
    category_name: str | None = None

class ProductListResponse(BaseModel):
    items: list[ProductListItem]
    total: int
    page: int
    page_size: int
    pages: int
