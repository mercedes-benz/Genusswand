from datetime import timedelta, datetime

from bcrypt import hashpw
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from starlette import status
from backend.data.Database import Person
from backend.dependencies.db import get_db

from pydantic import BaseModel

import os

SECRET_KEY = os.getenv("SECRET_HASH_KEY", "default_secret_key")




class TokenData(BaseModel):
    person_id: str | None = None

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(db = Depends(get_db),
                           token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        person_id: str = payload.get("sub")
        if person_id is None:
            raise credentials_exception
        token_data = TokenData(person_id=person_id)
    except JWTError:
        raise credentials_exception
    user = db.query(Person).filter(Person.uuid == token_data.person_id).first()
    if user is None:
        raise credentials_exception
    return user


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(username: str, plain_password: str, db):
    user: Person = db.query(Person).filter(Person.username == username).first()
    if not user:
        return False
    if not verify_password(plain_password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def hash_password(password):
    return pwd_context.hash(password)
