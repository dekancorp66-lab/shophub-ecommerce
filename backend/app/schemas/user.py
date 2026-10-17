from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
import re

class UserBase(BaseModel):
    email: str
    full_name: str
    phone: str | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", v):
            raise ValueError("Invalid email format")
        return v.lower()

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    password: str | None = Field(None, min_length=8)

class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

class UserProfile(UserOut):
    pass
