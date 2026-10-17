from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from app.db.session import get_db
from app.models.product import Product, Category
from app.schemas.product import (
    ProductOut, ProductListItem, ProductListResponse,
    ProductCreate, ProductUpdate, CategoryOut, CategoryCreate, CategoryUpdate
)
from app.api.deps import get_current_admin_user, get_optional_current_user
from app.models.user import User
import re

router = APIRouter(prefix="/products", tags=["products"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text[:270]

@router.get("", response_model=ProductListResponse)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    q: Optional[str] = None,
    category: Optional[str] = None,
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    sort: Optional[str] = Query(None, pattern="^(price_asc|price_desc|name_asc|name_desc|newest)$"),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.is_active == True)
    
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Product.name.ilike(like), Product.description.ilike(like)))
    if category:
        query = query.join(Category).filter(Category.slug == category)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if featured is not None:
        query = query.filter(Product.is_featured == featured)
    
    total = query.count()
    
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "name_asc":
        query = query.order_by(Product.name.asc())
    elif sort == "name_desc":
        query = query.order_by(Product.name.desc())
    else:
        query = query.order_by(Product.created_at.desc())
    
    items = query.options(joinedload(Product.category)).offset((page - 1) * page_size).limit(page_size).all()
    
    result_items = []
    for p in items:
        item = ProductListItem(
            id=p.id,
            name=p.name,
            slug=p.slug,
            price=p.price,
            compare_at_price=p.compare_at_price,
            stock=p.stock,
            image_url=p.image_url,
            is_featured=p.is_featured,
            category_id=p.category_id,
            category_name=p.category.name if p.category else None,
        )
        result_items.append(item)
    
    return ProductListResponse(
        items=result_items,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if page_size else 0,
    )

@router.get("/featured", response_model=list[ProductListItem])
def featured_products(limit: int = Query(8, ge=1, le=20), db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .filter(Product.is_active == True, Product.is_featured == True)
        .options(joinedload(Product.category))
        .order_by(Product.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        ProductListItem(
            id=p.id, name=p.name, slug=p.slug, price=p.price,
            compare_at_price=p.compare_at_price, stock=p.stock,
            image_url=p.image_url, is_featured=p.is_featured,
            category_id=p.category_id,
            category_name=p.category.name if p.category else None,
        )
        for p in products
    ]

@router.get("/{slug_or_id}", response_model=ProductOut)
def get_product(slug_or_id: str, db: Session = Depends(get_db)):
    product = None
    if slug_or_id.isdigit():
        product = db.query(Product).options(joinedload(Product.category)).filter(Product.id == int(slug_or_id)).first()
    if not product:
        product = db.query(Product).options(joinedload(Product.category)).filter(Product.slug == slug_or_id).first()
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/{product_id}/related", response_model=list[ProductListItem])
def related_products(product_id: int, limit: int = 4, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    q = db.query(Product).filter(
        Product.is_active == True,
        Product.id != product_id,
    )
    if product.category_id:
        q = q.filter(Product.category_id == product.category_id)
    products = q.options(joinedload(Product.category)).limit(limit).all()
    return [
        ProductListItem(
            id=p.id, name=p.name, slug=p.slug, price=p.price,
            compare_at_price=p.compare_at_price, stock=p.stock,
            image_url=p.image_url, is_featured=p.is_featured,
            category_id=p.category_id,
            category_name=p.category.name if p.category else None,
        )
        for p in products
    ]

# Admin product routes are under /admin
