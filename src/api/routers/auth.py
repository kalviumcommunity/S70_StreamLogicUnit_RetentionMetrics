"""Authentication and user session router for StreamPulse."""

import os
import re
import secrets
import hashlib
import datetime
import logging
from typing import Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from src.api.database import get_db, Base, engine
from src.api.auth_models import (
    User,
    PasswordResetToken,
    RegisterRequest,
    LoginRequest,
    SSOAuthRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserProfileResponse,
    AuthSuccessResponse,
)

logger = logging.getLogger("StreamPulse.Auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Auto-create tables on import/startup
try:
    if engine is not None:
        Base.metadata.create_all(bind=engine)
except Exception as exc:
    logger.warning("Could not auto-create tables: %s", exc)

JWT_SECRET = os.getenv("JWT_SECRET", "streampulse-retention-secret-key-2026-secure")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
JWT_REMEMBER_ME_DAYS = 30
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"


# ==========================================
# Security & Helper Utilities
# ==========================================

def is_valid_email(email: str) -> bool:
    """Check if string is a valid email format."""
    if not email or not isinstance(email, str):
        return False
    return bool(re.match(EMAIL_REGEX, email.strip()))


def hash_password(password: str) -> str:
    """Hash plaintext password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password meets security criteria: 8+ chars, uppercase, lowercase, number."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number."
    return True, "Password is secure."


def create_access_token(email: str, user_id: int, remember_me: bool = False) -> str:
    """Generate signed JWT token for authenticated user."""
    if remember_me:
        duration = datetime.timedelta(days=JWT_REMEMBER_ME_DAYS)
    else:
        duration = datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    expire = datetime.datetime.now(datetime.timezone.utc) + duration
    payload = {
        "sub": email,
        "user_id": user_id,
        "exp": int(expire.timestamp()),
        "iat": int(datetime.datetime.now(datetime.timezone.utc).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user_from_token(token: str, db: Session) -> Optional[User]:
    """Extract and verify user from JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return db.query(User).filter(User.email == email, User.is_active.is_(True)).first()
    except Exception:
        return None


def get_token_from_request(request: Request) -> Optional[str]:
    """Extract JWT token from Authorization header or HttpOnly cookie."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return request.cookies.get("streampulse_token")


# ==========================================
# Authentication Endpoints
# ==========================================

@router.post("/register", response_model=AuthSuccessResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    """Register a new StreamPulse user account."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    if not is_valid_email(req.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please enter a valid email address.")

    # Validate password rules
    is_valid, msg = validate_password_strength(req.password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Construct full name
    full_name = req.full_name
    if not full_name:
        first = req.first_name.strip() if req.first_name else ""
        last = req.last_name.strip() if req.last_name else ""
        full_name = f"{first} {last}".strip() or req.email.split("@")[0].title()

    new_user = User(
        email=req.email.lower().strip(),
        full_name=full_name,
        first_name=req.first_name,
        last_name=req.last_name,
        password_hash=hash_password(req.password),
        role=req.role or "Analytics",
        organization=req.organization or "StreamPulse Media",
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = create_access_token(new_user.email, new_user.id)
    response.set_cookie(
        key="streampulse_token",
        value=token,
        httponly=True,
        max_age=86400 * 30,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
    )

    user_profile = UserProfileResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        role=new_user.role,
        organization=new_user.organization,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
    )

    return AuthSuccessResponse(
        success=True,
        message="Account created successfully.",
        access_token=token,
        user=user_profile,
    )


@router.post("/login", response_model=AuthSuccessResponse)
def login_user(req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    if not is_valid_email(req.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please enter a valid email address.")

    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        # Generic error message avoids disclosing email existence
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Please contact support.",
        )

    token = create_access_token(user.email, user.id, remember_me=bool(req.remember_me))
    max_age = 86400 * 30 if req.remember_me else 86400

    response.set_cookie(
        key="streampulse_token",
        value=token,
        httponly=True,
        max_age=max_age,
        samesite="lax",
        secure=False,
    )

    user_profile = UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        organization=user.organization,
        is_active=user.is_active,
        created_at=user.created_at,
    )

    return AuthSuccessResponse(
        success=True,
        message="Signed in successfully.",
        access_token=token,
        user=user_profile,
    )


@router.post("/sso", response_model=AuthSuccessResponse)
def sso_auth(req: SSOAuthRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate or auto-provision user via Google, Microsoft, or Enterprise SAML/SSO."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    email_clean = req.email.lower().strip()
    if not is_valid_email(email_clean):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format.")

    provider_name = (req.provider or "SSO").capitalize()

    # Look up existing user
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        # Auto-provision SSO user
        full_name = req.full_name or email_clean.split("@")[0].replace(".", " ").title()
        first_name = req.first_name or full_name.split(" ")[0]
        last_name = req.last_name or (full_name.split(" ")[1] if len(full_name.split(" ")) > 1 else "")
        random_hash = hash_password(secrets.token_urlsafe(32))

        org = req.organization or f"{email_clean.split('@')[-1].split('.')[0].capitalize()} Media"

        user = User(
            email=email_clean,
            full_name=full_name,
            first_name=first_name,
            last_name=last_name,
            password_hash=random_hash,
            role="Retention Specialist",
            organization=org,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Auto-provisioned new SSO user: %s via %s", email_clean, provider_name)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Please contact support.",
        )

    token = create_access_token(user.email, user.id, remember_me=True)
    response.set_cookie(
        key="streampulse_token",
        value=token,
        httponly=True,
        max_age=86400 * 30,
        samesite="lax",
        secure=False,
    )

    user_profile = UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        organization=user.organization,
        is_active=user.is_active,
        created_at=user.created_at,
    )

    return AuthSuccessResponse(
        success=True,
        message=f"Signed in via {provider_name}.",
        access_token=token,
        user=user_profile,
    )


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate password reset process with single-use cryptographic token."""
    generic_msg = "If an account exists for this email, you'll receive a password reset link shortly."
    if db is None:
        return {"success": True, "message": generic_msg}

    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    reset_token_str = None

    if user and user.is_active:
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)

        token_record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False,
        )
        db.add(token_record)
        db.commit()
        reset_token_str = raw_token
        logger.info("Generated password reset link for user %s: /reset-password?token=%s", user.email, raw_token)

    return {
        "success": True,
        "message": generic_msg,
        "reset_token": reset_token_str,  # Helpful for direct testing & showcase demo
        "reset_url": f"/reset-password?token={reset_token_str}" if reset_token_str else None,
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset user password using valid, unexpired reset token."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    is_valid, msg = validate_password_strength(req.new_password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    token_hash = hashlib.sha256(req.token.encode()).hexdigest()
    now = datetime.datetime.now(datetime.timezone.utc)

    # SQLite returns naive datetimes, make sure comparison is safe
    all_tokens = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.is_used.is_(False),
    ).all()

    token_record = None
    for t in all_tokens:
        exp = t.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=datetime.timezone.utc)
        if exp > now:
            token_record = t
            break

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset link is invalid or has expired.",
        )

    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")

    user.password_hash = hash_password(req.new_password)
    token_record.is_used = True
    db.commit()

    return {
        "success": True,
        "message": "Password updated successfully. You can now sign in with your new password.",
    }


@router.post("/logout")
def logout_user(response: Response):
    """Log out authenticated user by clearing session cookie."""
    response.delete_cookie(key="streampulse_token")
    return {"success": True, "message": "Logged out successfully."}


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(request: Request, db: Session = Depends(get_db)):
    """Get authenticated user profile."""
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")

    token = get_token_from_request(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user = get_current_user_from_token(token, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        organization=user.organization,
        is_active=user.is_active,
        created_at=user.created_at,
    )
