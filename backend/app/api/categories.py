from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Category
from app.schemas.product import CategoryOut, CategoryCreate, CategoryUpdate
from app.api.deps import get_current_admin_user
from app.models.user import User
import re

router = APIRouter(prefix="/categories", tags=["categories"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text[:110]

@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_active == True).order_by(Category.name).all()

@router.get("/{slug}", response_model=CategoryOut)
def get_category(slug: str, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat or not cat.is_active:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat
