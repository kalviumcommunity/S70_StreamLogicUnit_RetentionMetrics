"""User and Password Reset models for StreamPulse Authentication."""

import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field
from typing import Optional

from src.api.database import Base


class User(Base):
    """Database model for registered StreamPulse users."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    first_name = Column(String(128), nullable=True)
    last_name = Column(String(128), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(64), default="Analytics", nullable=False)
    organization = Column(String(128), default="StreamPulse Media", nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")


class PasswordResetToken(Base):
    """Database model for cryptographically secure single-use password reset tokens."""

    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="reset_tokens")


# ==========================================
# Pydantic Schemas for Request & Response
# ==========================================

class RegisterRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    email: str
    password: str = Field(..., min_length=8)
    role: Optional[str] = "Analytics"
    organization: Optional[str] = "StreamPulse Media"


class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    organization: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime.datetime] = None


class AuthSuccessResponse(BaseModel):
    success: bool
    message: str
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserProfileResponse] = None
