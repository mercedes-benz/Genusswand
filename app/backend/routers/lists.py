from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.dependencies.authentification import get_current_user
from backend.dependencies.db import get_db
from backend.data.Database import Liste, Person
from sqlalchemy.orm import Session

from backend.data.Database import Foto
from starlette.responses import StreamingResponse

from backend.dependencies.image import get_image_from_minio

router = APIRouter(
    prefix="/list",
    tags=["list"]
)

class ListeCreate(BaseModel):
    name: str
    profilbild_id: str | None

@router.post("/create")
async def create_liste(liste: ListeCreate, db = Depends(get_db), person: Person = Depends(get_current_user)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    new_liste = Liste(
        name=liste.name,
        ersteller_id=person.uuid,
        profilbild_id=liste.profilbild_id
    )
    new_liste.personen.append(person)
    db.add(new_liste)
    db.commit()
    db.refresh(new_liste)
    return new_liste

@router.post("/add_person/{liste_id}/{person_username}")
async def add_person_to_liste(liste_id: str, person_username: str, db = Depends(get_db), user = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=404, detail="Person not found")

    liste = db.query(Liste).filter(Liste.uuid == liste_id).first()


    person = db.query(Person).filter(Person.username == person_username).first()

    if not liste or not person:
        raise HTTPException(status_code=404, detail="Person or Liste not found")

    validated = False
    for list_element in user.listen:
        if str(list_element.uuid) == str(liste_id):
            print("Validated")
            validated = True
            break

    if not validated:
        raise HTTPException(status_code=403, detail="You are not allowed to add a Person to this List")

    liste.personen.append(person)
    db.commit()
    return {"message": f"Person {person_username} added to Liste {liste_id}"}


@router.get("/get_added_lists")
async def get_persons_lists(person: Person = Depends(get_current_user)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    ids = []
    for list_element in person.listen:
        ids.append(list_element.uuid)
    return ids


@router.get("/get_list/{list_id}")
async def get_list(list_id: str, person: Person = Depends(get_current_user), db: Session = Depends(get_db)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    liste = db.query(Liste).filter(Liste.uuid == list_id).first()
    if liste is None:
        raise HTTPException(status_code=404, detail="List not found")

    validated = False
    for person_element in liste.personen:
        if person_element.uuid == person.uuid:
            validated = True
            break

    if not validated:
        raise HTTPException(status_code=403, detail="You are not allowed to see this List")

    return liste

@router.get("/get_list_name/{list_id}")
async def get_list_name(list_id: str, person: Person = Depends(get_current_user), db: Session = Depends(get_db)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    liste = db.query(Liste).filter(Liste.uuid == list_id).first()
    if liste is None:
        raise HTTPException(status_code=404, detail="List not found")

    validated = False
    for person_element in liste.personen:
        if person_element.uuid == person.uuid:
            validated = True
            break

    if not validated:
        raise HTTPException(status_code=403, detail="You are not allowed to see this List")

    return {"name": liste.name}


@router.get("/get_created_lists")
async def get_my_lists(db: Session = Depends(get_db), person: Person = Depends(get_current_user)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    lists = db.query(Liste).filter(Liste.ersteller_id == person.uuid).all()
    ids = []
    for list_element in lists:
        ids.append(list_element.uuid)
    return ids


@router.get("/list_image/{size}/{list_id}")
async def get_small_list_image(size: str, list_id: str, person: Person = Depends(get_current_user), db: Session = Depends(get_db)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    liste = db.query(Liste).filter(Liste.uuid == list_id).first()
    if liste is None:
        raise HTTPException(status_code=404, detail="List not found")

    validated = False
    for person_element in liste.personen:
        if person_element.uuid == person.uuid:
            validated = True
            break

    if not validated:
        raise HTTPException(status_code=403, detail="You are not allowed to see this Image")

    if liste.profilbild_id is None:
        raise HTTPException(status_code=404, detail="No Image found")

    foto = db.query(Foto).filter(Foto.uuid == liste.profilbild_id).first()

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

