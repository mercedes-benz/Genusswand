import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from minio import Minio
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.dependencies.authentification import get_current_user
from backend.dependencies.db import get_db
from backend.data.Database import Liste, Person
from backend.dependencies.image import get_minio_client
from PIL import Image as PILImage
from backend.dependencies.image import create_image, update_image

from backend.data.Database import Foto

router = APIRouter(
    prefix="/foto",
    tags=["foto"]
)


@router.post("/add_image/{bucket_name}")
async def upload_image(bucket_name: str, file: UploadFile = File(...), db: Session = Depends(get_db),
                       minio_client: Minio = Depends(get_minio_client)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid image format. Only JPEG or PNG allowed.")

    if bucket_name not in ["profile-pictures", "list-pictures", "reason-pictures", "done-pictures"]:
        raise HTTPException(status_code=400, detail="Invalid bucket name.")

    image = PILImage.open(file.file)

    foto = create_image(str(uuid.uuid4()), image, bucket_name, db, minio_client)

    return {
        "message": "Image uploaded successfully",
        "image_id": foto.uuid
    }


@router.post("/update_image/{foto_id}")
async def upload_update_image(foto_id: str, file: UploadFile = File(...), person: Person = Depends(get_current_user),
                       db: Session = Depends(get_db), minio_client: Minio = Depends(get_minio_client)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid image format. Only JPEG or PNG allowed.")

    if foto_id != "null":
        foto = db.query(Foto).filter(Foto.uuid == foto_id).first()
    else:
        foto = None
    if not foto:
        image = PILImage.open(file.file)

        foto = create_image(str(uuid.uuid4()), image, "profile-pictures", db, minio_client)

        person.profilbild_id = foto.uuid

        db.commit()
        db.refresh(person)
        db.commit()

        return {
            "message": "Image updated successfully",
            "image_id": foto.uuid
        }
    else:
        if foto.bucket_name not in ["profile-pictures", "list-pictures"]:
            raise HTTPException(status_code=400, detail="Image cant be updated.")

        if foto.bucket_name == "profile-pictures":
            persons = db.query(Person).filter(Person.profilbild_id == foto_id).all()
            validated = False
            for person_element in persons:
                if person_element.uuid == person.uuid:
                    validated = True
                    break

            if not validated:
                raise HTTPException(status_code=403, detail="You are not allowed to update this image")

        if foto.bucket_name == "list-pictures":
            listen = db.query(Liste).filter(Liste.profilbild_id == foto_id).all()
            validated = False
            for liste in listen:
                if liste.ersteller_id == person.uuid:
                    validated = True
                    break
                for person_element in liste.personen:
                    if person_element.uuid == person.uuid:
                        validated = True
                        break
                if validated:
                    break

            if not validated:
                raise HTTPException(status_code=403, detail="You are not allowed to update this image")

        image = PILImage.open(file.file)

        update_image(foto_id, image, foto.bucket_name, db, minio_client)

        return {
            "message": "Image updated successfully",
            "image_id": foto.uuid
        }
