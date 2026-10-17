from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartOut, CartItemOut
from app.schemas.product import ProductListItem
from app.api.deps import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])

def build_cart_out(items: list[CartItem]) -> CartOut:
    out_items = []
    subtotal = Decimal("0.00")
    for item in items:
        p = item.product
        line = Decimal(str(p.price)) * item.quantity
        subtotal += line
        out_items.append(CartItemOut(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            product=ProductListItem(
                id=p.id, name=p.name, slug=p.slug, price=p.price,
                compare_at_price=p.compare_at_price, stock=p.stock,
                image_url=p.image_url, is_featured=p.is_featured,
                category_id=p.category_id,
                category_name=p.category.name if p.category else None,
            ),
            line_total=line,
        ))
    return CartOut(items=out_items, subtotal=subtotal, item_count=sum(i.quantity for i in items))

@router.get("", response_model=CartOut)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .options(joinedload(CartItem.product).joinedload(Product.category))
        .all()
    )
    return build_cart_out(items)

@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == data.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < data.quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Only {product.stock} available.")
    
    existing = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == data.product_id,
    ).first()
    
    if existing:
        new_qty = existing.quantity + data.quantity
        if product.stock < new_qty:
            raise HTTPException(status_code=400, detail=f"Insufficient stock. Only {product.stock} available.")
        existing.quantity = new_qty
    else:
        existing = CartItem(user_id=current_user.id, product_id=data.product_id, quantity=data.quantity)
        db.add(existing)
    
    db.commit()
    items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .options(joinedload(CartItem.product).joinedload(Product.category))
        .all()
    )
    return build_cart_out(items)

@router.patch("/items/{item_id}", response_model=CartOut)
def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product or not product.is_active:
        raise HTTPException(status_code=400, detail="Product no longer available")
    if product.stock < data.quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Only {product.stock} available.")
    item.quantity = data.quantity
    db.commit()
    items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .options(joinedload(CartItem.product).joinedload(Product.category))
        .all()
    )
    return build_cart_out(items)

@router.delete("/items/{item_id}", response_model=CartOut)
def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .options(joinedload(CartItem.product).joinedload(Product.category))
        .all()
    )
    return build_cart_out(items)

@router.delete("", response_model=CartOut)
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return CartOut(items=[], subtotal=Decimal("0.00"), item_count=0)
