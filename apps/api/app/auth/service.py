import base64
import hashlib

import bcrypt as _bcrypt


def _pw_key(password: str) -> bytes:
    # SHA-256 first, then bcrypt — Django/Dropbox pattern.
    # Avoids bcrypt's 72-byte limit entirely.
    return base64.b64encode(hashlib.sha256(password.encode()).digest())


def hash_password(password: str) -> str:
    return _bcrypt.hashpw(_pw_key(password), _bcrypt.gensalt()).decode()


def check_password(password: str, hashed: str) -> bool:
    return _bcrypt.checkpw(_pw_key(password), hashed.encode())
