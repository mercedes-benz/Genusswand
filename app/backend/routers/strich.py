import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pydantic.v1 import UUID4

from backend.dependencies.db import get_db
from backend.data.Database import Person, Strich, Liste
from sqlalchemy.orm import Session

from backend.dependencies.authentification import get_current_user

from backend.data.Database import Foto
from starlette.responses import StreamingResponse

from backend.dependencies.image import get_image_from_minio

router = APIRouter(
    prefix="/strich",
    tags=["strich"]
)


class StrichCreate(BaseModel):
    getter_id: str
    list_id: uuid.UUID
    reason: str
    reason_image_id: str | None


#Erstellt einen Strich
@router.post("/create")
async def create_strich(strich: StrichCreate, person: Person = Depends(get_current_user), db=Depends(get_db)):

    getter = db.query(Person).filter(Person.uuid == strich.getter_id).first()
    if getter is None or person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    liste = db.query(Liste).filter(Liste.uuid == strich.list_id).first()
    if liste is None:
        raise HTTPException(status_code=404, detail="List not found")

    if strich.reason_image_id is not None:
        foto = db.query(Foto).filter(Foto.uuid == strich.reason_image_id).first()
        if foto is None:
            raise HTTPException(status_code=404, detail="Foto not found")

    new_strich = Strich(
        owner_id=getter.uuid,
        reporter_id=person.uuid,
        list_id=liste.uuid,
        creation_date=datetime.utcnow().date(),
        reason=strich.reason,
        reason_image_id=strich.reason_image_id,
        done=False,
        done_date=None,
        done_image_id=None,
    )
    db.add(new_strich)
    db.commit()
    db.refresh(new_strich)
    return new_strich


#Bekommt einen spezifischen Strich
@router.get("/get_strich/{strich_id}")
async def get_strich(strich_id: str, person: Person = Depends(get_current_user), db: Session = Depends(get_db)):
    strich = db.query(Strich).filter(Strich.uuid == strich_id).first()
    strich_validate = False
    for liste in person.listen:
        if liste.uuid == strich.list_id:
            strich_validate = True
            break

    if not strich_validate:
        raise HTTPException(status_code=403, detail="You are not allowed to see this Strich")

    if strich is None:
        raise HTTPException(status_code=404, detail="Strich not found")
    return strich


@router.get("/get_striche/{list_id}")
async def get_striche(list_id: str, person: Person = Depends(get_current_user), db: Session = Depends(get_db)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    liste = db.query(Liste).filter(Liste.uuid == list_id).first()
    if liste is None:
        raise HTTPException(status_code=404, detail="List not found")

    liste_validate = False
    for person_element in liste.personen:
        if person_element.uuid == person.uuid:
            liste_validate = True
            break

    if not liste_validate:
        raise HTTPException(status_code=403, detail="You are not allowed to see this List")

    striche = db.query(Strich).filter(Strich.list_id == list_id).all()

    #erstellt eine Liste mit mehreren Objekten, ein Objekt beinhaltet eine UserID und eine Liste von Strichen die diesem zugeordnet sind
    striche_list = []

    for person_element in liste.personen:
        striche_list.append({"person_id": person_element.uuid, "striche": []})

    for strich in striche:
        for person_element in striche_list:
            if person_element["person_id"] == strich.owner_id:
                person_element["striche"].append(strich)
                break

    #sortiere die Striche nach Datum

    for person_element in striche_list:
        person_element["striche"].sort(key=lambda x: x.creation_date, reverse=True)

    return striche_list


@router.get("/strich_image/{size}/{strich_id}")
async def get_strich_image(size: str, strich_id: str, person: Person = Depends(get_current_user),
                           db: Session = Depends(get_db)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    strich = db.query(Strich).filter(Strich.uuid == strich_id).first()
    if strich is None:
        raise HTTPException(status_code=404, detail="Strich not found")

    liste = db.query(Liste).filter(Liste.uuid == strich.list_id).first()

    if liste is None:
        raise HTTPException(status_code=404, detail="List not found")

    validated = False
    for person_element in liste.personen:
        if person_element.uuid == person.uuid:
            validated = True
            break

    if not validated:
        raise HTTPException(status_code=403, detail="You are not allowed to see this Image")

    foto = db.query(Foto).filter(Foto.uuid == strich.reason_image_id).first()

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


@router.post("/done/{strich_id}")
async def done_strich(strich_id: str, db: Session = Depends(get_db),
                      person: Person = Depends(get_current_user)):
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")

    strich = db.query(Strich).filter(Strich.uuid == strich_id).first()
    if not strich:
        raise HTTPException(status_code=404, detail="Strich not found")

    liste = db.query(Liste).filter(Liste.uuid == strich.list_id).first()
    if not liste:
        raise HTTPException(status_code=404, detail="List not found")

    validated = False
    for person_element in liste.personen:
        if person_element.uuid == person.uuid:
            validated = True
            break

    if not validated:
        raise HTTPException(status_code=403, detail="You are not allowed to do this")


    done_image_id = None
    strich.done = True
    strich.done_date = datetime.utcnow().date()
    if done_image_id is not None:
        strich.done_image_id = done_image_id

    db.commit()
    db.refresh(strich)
    db.commit()

    return strich
