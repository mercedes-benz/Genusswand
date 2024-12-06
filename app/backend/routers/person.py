import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from minio import Minio
from pydantic import BaseModel
from pydantic.v1 import UUID4
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse
from PIL import Image as PILImage
from backend.dependencies.authentification import hash_password, authenticate_user, create_access_token, \
    get_current_user
from backend.dependencies.db import get_db
from backend.data.Database import Person, Strich, Liste, Foto
from backend.dependencies.image import get_image_from_minio, get_minio_client, create_image

router = APIRouter(
    prefix="/person",
    tags=["person"]
)


class PersonCreate(BaseModel):
    username: str
    email: str
    password: str
    vorname: str
    nachname: str
    geburtstag: str
    profilbild_id: str | None


class PersonUpdate(BaseModel):
    username: str
    vorname: str
    nachname: str
    geburtstag: str

@router.post("/create")
async def create_person(person: PersonCreate, db=Depends(get_db)):
    empty_person = db.query(Person).filter(Person.username == person.username).first()
    if empty_person is not None:
        raise HTTPException(status_code=400, detail="Username already taken")

    if person.profilbild_id == '':
        person.profilbild_id = None

    if person.username == '':
        raise HTTPException(status_code=400, detail="Username is empty")
    if person.email == '':
        raise HTTPException(status_code=400, detail="Email is empty")
    if person.password == '':
        raise HTTPException(status_code=400, detail="Password is empty")
    if person.vorname == '':
        raise HTTPException(status_code=400, detail="Vorname is empty")
    if person.nachname == '':
        raise HTTPException(status_code=400, detail="Nachname is empty")
    if person.geburtstag == '':
        raise HTTPException(status_code=400, detail="Geburtstag is empty")

    new_person = Person(
        username=person.username,
        email=person.email,
        password=hash_password(person.password),
        vorname=person.vorname,
        nachname=person.nachname,
        geburtstag=person.geburtstag,
        profilbild_id=person.profilbild_id
    )
    db.add(new_person)
    db.commit()
    db.refresh(new_person)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content="Registered")


@router.get("/me")
async def get_person(person: Person = Depends(get_current_user)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    tmp_person = {
        "uuid": person.uuid,
        "username": person.username,
        "email": person.email,
        "vorname": person.vorname,
        "nachname": person.nachname,
        "geburtstag": person.geburtstag,
        "profilbild_id": person.profilbild_id
    }
    return tmp_person


@router.post("/update")
async def update_person(person_update: PersonUpdate, person: Person = Depends(get_current_user), db=Depends(get_db)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    if person_update.username == '':
        raise HTTPException(status_code=400, detail="Username is empty")

    if person.username != person_update.username:
        empty_person = db.query(Person).filter(Person.username == person_update.username).first()
        if empty_person is not None:
            raise HTTPException(status_code=400, detail="Username already taken")

    if person_update.vorname == '':
        raise HTTPException(status_code=400, detail="Vorname is empty")
    if person_update.nachname == '':
        raise HTTPException(status_code=400, detail="Nachname is empty")
    if person_update.geburtstag == '':
        raise HTTPException(status_code=400, detail="Geburtstag is empty")

    person.username = person_update.username
    person.vorname = person_update.vorname
    person.nachname = person_update.nachname
    person.geburtstag = person_update.geburtstag

    db.commit()
    db.refresh(person)
    db.commit()
    return JSONResponse(status_code=status.HTTP_200_OK, content="Updated")


@router.get("/get_person/{person_id}")
async def get_person_by_id(person_id: str, person: Person = Depends(get_current_user), db: Session = Depends(get_db)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    getting_person = db.query(Person).filter(Person.uuid == person_id).first()
    if getting_person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    validated = False
    for list_element in getting_person.listen:
        for inner_list_element in person.listen:
            if list_element.uuid == inner_list_element.uuid:
                validated = True
                break
        if validated:
            break

    if not validated:
        raise HTTPException(status_code=403, detail="You are not allowed to see this Person")

    response = {
        "uuid": getting_person.uuid,
        "name": getting_person.vorname + " " + getting_person.nachname,
    }

    return response

@router.get("/profile_image/{size}")
async def get_profile_image(size: str, person: Person = Depends(get_current_user), db: Session = Depends(get_db)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    foto = db.query(Foto).filter(Foto.uuid == person.profilbild_id).first()

    if not foto:
        raise HTTPException(status_code=404, detail="Foto not found")

    image_stream = None

    if size == "small":
        image_stream = get_image_from_minio(foto.small, foto.bucket_name)
    elif size == "medium":
        image_stream = get_image_from_minio(foto.medium, foto.bucket_name)
    elif size == "large":
        image_stream = get_image_from_minio(foto.large, foto.bucket_name)
    if not image_stream:
        raise HTTPException(status_code=404, detail="Size not found")
    return StreamingResponse(image_stream, media_type="image/jpeg")

@router.get("/profile_image/{size}/{person_id}")
async def get_profile_image_by_id(size: str, person_id: str, person: Person = Depends(get_current_user), db: Session = Depends(get_db)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    foto_person = db.query(Person).filter(Person.uuid == person_id).first()

    if not foto_person:
        raise HTTPException(status_code=404, detail="Foto not found")

    validated = False
    for list_element in foto_person.listen:
        for inner_list_element in person.listen:
            if list_element.uuid == inner_list_element.uuid:
                validated = True
                break
        if validated:
            break

    if not validated:
        raise HTTPException(status_code=403, detail="You are not allowed to see this Image")

    foto = db.query(Foto).filter(Foto.uuid == foto_person.profilbild_id).first()


    if not foto:
        raise HTTPException(status_code=404, detail="Foto not found")

    image_stream = None

    if size == "small":
        image_stream = get_image_from_minio(foto.small, foto.bucket_name)
    elif size == "medium":
        image_stream = get_image_from_minio(foto.medium, foto.bucket_name)
    elif size == "large":
        image_stream = get_image_from_minio(foto.large, foto.bucket_name)
    if not image_stream:
        raise HTTPException(status_code=404, detail="Size not found")
    return StreamingResponse(image_stream, media_type="image/jpeg")

