import hashlib
import hmac
import os
import json
import base64
import time
from typing import Optional, Dict, Any

# Secure random salt length
SALT_BYTES = 16
PBKDF2_ITERATIONS = 100_000

SECRET_KEY = os.getenv("SCREENWISE_SECRET_KEY", "screenwise-ai-secure-adphc-token-secret-2026")

def hash_password(password: str) -> str:
    """
    Hash password using PBKDF2-HMAC-SHA256 with a unique cryptographic salt.
    Format: iterations$salt_hex$hash_hex
    """
    salt = os.urandom(SALT_BYTES)
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS
    )
    return f"{PBKDF2_ITERATIONS}${salt.hex()}${derived.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against the stored PBKDF2 hash using constant-time comparison.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) != 3:
            return False
        iterations = int(parts[0])
        salt = bytes.fromhex(parts[1])
        expected_hash = bytes.fromhex(parts[2])

        derived = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt,
            iterations
        )
        return hmac.compare_digest(derived, expected_hash)
    except Exception:
        return False

def create_access_token(payload: Dict[str, Any], expires_in_seconds: int = 86400) -> str:
    """
    Create a signed session token containing claims and HMAC signature.
    """
    data = payload.copy()
    data["exp"] = int(time.time()) + expires_in_seconds
    data["iat"] = int(time.time())

    encoded_payload = base64.urlsafe_b64encode(json.dumps(data).encode("utf-8")).decode("utf-8").rstrip("=")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), encoded_payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{encoded_payload}.{signature}"

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a token's HMAC signature and expiration.
    """
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        encoded_payload, signature = parts[0], parts[1]

        # Verify signature in constant time
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), encoded_payload.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected_sig, signature):
            return None

        # Pad base64 if needed
        padding = 4 - (len(encoded_payload) % 4)
        if padding != 4:
            encoded_payload += "=" * padding

        data = json.loads(base64.urlsafe_b64decode(encoded_payload.encode("utf-8")).decode("utf-8"))
        if data.get("exp", 0) < time.time():
            return None # Expired

        return data
    except Exception:
        return None
