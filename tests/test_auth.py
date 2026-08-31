"""Automated test suite for StreamPulse User Authentication and Security."""

import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_register_and_login_flow():
    email = "test.analyst@streampulse.io"
    password = "SecurePassword123!"

    # 1. Registration
    reg_res = client.post("/api/auth/register", json={
        "first_name": "Test",
        "last_name": "Analyst",
        "email": email,
        "password": password,
        "role": "Analytics"
    })
    assert reg_res.status_code in [201, 400]

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password,
        "remember_me": True
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert data["success"] is True
    assert "access_token" in data
    assert data["user"]["email"] == email

    token = data["access_token"]

    # 3. Protected /me profile
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email


def test_invalid_login_credentials():
    res = client.post("/api/auth/login", json={
        "email": "nonexistent@streampulse.io",
        "password": "WrongPassword123!"
    })
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid email or password."


def test_forgot_and_reset_password():
    email = "reset.test@streampulse.io"
    # Register first
    client.post("/api/auth/register", json={
        "first_name": "Reset",
        "last_name": "User",
        "email": email,
        "password": "InitialPassword123!"
    })

    # Forgot password request
    fp_res = client.post("/api/auth/forgot-password", json={"email": email})
    assert fp_res.status_code == 200
    token = fp_res.json().get("reset_token")
    assert token is not None

    # Reset password
    new_pass = "NewSecurePassword456!"
    rp_res = client.post("/api/auth/reset-password", json={
        "token": token,
        "new_password": new_pass
    })
    assert rp_res.status_code == 200
    assert rp_res.json()["success"] is True

    # Login with new password
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": new_pass
    })
    assert login_res.status_code == 200


def test_sso_authentication_flow():
    # Google SSO
    google_res = client.post("/api/auth/sso", json={
        "provider": "google",
        "email": "alex.turner@gmail.com",
        "full_name": "Alex Turner",
    })
    assert google_res.status_code == 200
    assert google_res.json()["success"] is True
    assert "access_token" in google_res.json()
    assert google_res.json()["user"]["email"] == "alex.turner@gmail.com"

    # Microsoft SSO
    ms_res = client.post("/api/auth/sso", json={
        "provider": "microsoft",
        "email": "sarah.connor@microsoft.com",
        "full_name": "Sarah Connor",
        "organization": "Microsoft Streaming Media",
    })
    assert ms_res.status_code == 200
    assert ms_res.json()["success"] is True

    # Enterprise SAML / Okta SSO
    sso_res = client.post("/api/auth/sso", json={
        "provider": "sso",
        "email": "lead.data@netflix.corp",
        "full_name": "Elena Rostova",
        "organization": "Netflix Global",
    })
    assert sso_res.status_code == 200
    assert sso_res.json()["success"] is True
