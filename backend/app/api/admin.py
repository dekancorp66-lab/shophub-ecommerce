from math import ceil
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.db.session import get_db
from app.models.product import Product, Category
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductOut, ProductListItem, ProductListResponse,
    CategoryCreate, CategoryUpdate, CategoryOut
)
from app.schemas.order import OrderOut, OrderListResponse, OrderStatusUpdate
from app.api.deps import get_current_admin_user
from app.core.config import settings
import re
import os
import uuid
import shutil

router = APIRouter(prefix="/admin", tags=["admin"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text[:270]

# ---------- Categories ----------
@router.get("/categories", response_model=list[CategoryOut])
def admin_list_categories(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(Category).order_by(Category.name).all()

@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def admin_create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    slug = slugify(data.name)
    if db.query(Category).filter(Category.slug == slug).first():
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    cat = Category(name=data.name, slug=slug, description=data.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.patch("/categories/{cat_id}", response_model=CategoryOut)
def admin_update_category(
    cat_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if data.name is not None:
        cat.name = data.name
        cat.slug = slugify(data.name)
    if data.description is not None:
        cat.description = data.description
    if data.is_active is not None:
        cat.is_active = data.is_active
    db.commit()
    db.refresh(cat)
    return cat

# ---------- Products ----------
@router.get("/products", response_model=ProductListResponse)
def admin_list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: str | None = None,
    include_inactive: bool = True,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    query = db.query(Product)
    if not include_inactive:
        query = query.filter(Product.is_active == True)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Product.name.ilike(like), Product.sku.ilike(like)))
    total = query.count()
    items = (
        query.options(joinedload(Product.category))
        .order_by(Product.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    result = [
        ProductListItem(
            id=p.id, name=p.name, slug=p.slug, price=p.price,
            compare_at_price=p.compare_at_price, stock=p.stock,
            image_url=p.image_url, is_featured=p.is_featured,
            category_id=p.category_id,
            category_name=p.category.name if p.category else None,
        )
        for p in items
    ]
    return ProductListResponse(items=result, total=total, page=page, page_size=page_size,
                               pages=ceil(total / page_size) if page_size else 0)

@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def admin_create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    base_slug = slugify(data.name)
    slug = base_slug
    counter = 1
    while db.query(Product).filter(Product.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    product = Product(
        name=data.name,
        slug=slug,
        description=data.description,
        price=data.price,
        compare_at_price=data.compare_at_price,
        stock=data.stock,
        sku=data.sku,
        image_url=data.image_url,
        is_featured=data.is_featured,
        category_id=data.category_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("/products/{product_id}", response_model=ProductOut)
def admin_get_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    product = db.query(Product).options(joinedload(Product.category)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.patch("/products/{product_id}", response_model=ProductOut)
def admin_update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data:
        product.name = update_data["name"]
        # optionally update slug
    for field in ["description", "price", "compare_at_price", "stock", "sku",
                  "image_url", "is_active", "is_featured", "category_id"]:
        if field in update_data:
            setattr(product, field, update_data[field])
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Soft delete
    product.is_active = False
    db.commit()
    return None

@router.post("/products/{product_id}/image")
async def admin_upload_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read size
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    ext = os.path.splitext(file.filename or "img.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(content)
    
    # In production serve via CDN / static. For demo store relative path.
    product.image_url = f"/uploads/{filename}"
    db.commit()
    return {"image_url": product.image_url}

# ---------- Orders ----------
@router.get("/orders", response_model=OrderListResponse)
def admin_list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    q: str | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Order.order_number.ilike(like), Order.contact_email.ilike(like)))
    total = query.count()
    orders = (
        query.options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return OrderListResponse(
        items=orders, total=total, page=page, page_size=page_size,
        pages=ceil(total / page_size) if page_size else 0,
    )

@router.get("/orders/{order_id}", response_model=OrderOut)
def admin_get_order(
    order_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def admin_update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    db.commit()
    db.refresh(order)
    return order
