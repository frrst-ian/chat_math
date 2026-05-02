import os
import jwt
import requests
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

SUPABASE_URL = os.getenv("SUPABASE_URL")
_jwks_cache = None

def get_public_key():
    global _jwks_cache
    if _jwks_cache is None:
        res = requests.get(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json")
        _jwks_cache = res.json()["keys"]
    return _jwks_cache

def verify_token(credentials=Depends(security)):
    token = credentials.credentials
    try:
        keys = get_public_key()
        header = jwt.get_unverified_header(token)
        
        key = next((k for k in keys if k["kid"] == header["kid"]), None)
        if not key:
            raise HTTPException(status_code=401, detail="Key not found")
        
        public_key = jwt.algorithms.ECAlgorithm.from_jwk(key)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["ES256"],
            options={"verify_exp": True},
            audience="authenticated"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")