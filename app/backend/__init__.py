from datetime import timedelta

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

from starlette import status

from backend.routers.person import router as person_router
from backend.routers.strich import router as strich_router
from backend.routers.lists import router as list_router
from backend.routers.foto import router as foto_router
from backend.dependencies.db import get_db
from backend.dependencies.authentification import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES



app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Token(BaseModel):
    access_token: str
    token_type: str

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                                 db = Depends(get_db)):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.uuid)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


app.include_router(person_router)
app.include_router(strich_router)
app.include_router(list_router)
app.include_router(foto_router)

import uvicorn
uvicorn.run(app, host="0.0.0.0", port=8000)

