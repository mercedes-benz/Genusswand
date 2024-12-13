# Create Minio client
import uuid
from datetime import datetime
from io import BytesIO

from fastapi import HTTPException
from minio import Minio, S3Error
from sqlalchemy.orm import Session
from PIL import Image as PILImage
from backend.data.Database import Foto

import os

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minio_access_key")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minio_secret_key")
MINIO_SECURE = os.getenv("MINIO_SECURE", "False")

MINIO_SECURE_BOOL = MINIO_SECURE.lower() == "true"
print(MINIO_SECURE_BOOL)
minio_client = Minio(
    endpoint=MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE_BOOL
)

BUCKET_NAME = "foto-bucket"


def get_image_from_minio(image_path: str, bucket_name: str):
    try:
        response = minio_client.get_object(bucket_name, image_path)
        return BytesIO(response.read())
    except S3Error as e:
        raise HTTPException(status_code=404, detail="Image not found in Storage Service")


def get_minio_client():
    return minio_client


def remove_image_from_minio(image_path: str, bucket_name: str):
    try:
        minio_client.remove_object(bucket_name, image_path)
    except S3Error as e:
        raise HTTPException(status_code=404, detail="Image not found in Minio")


def save_to_minio(image_data, image_name, folder, minio_client: Minio, bucket_name):

    image_bytes = BytesIO()
    image_data.save(image_bytes, format="JPEG")  # Save as JPEG
    image_bytes.seek(0)  # Reset buffer position

    file_path = f"{folder}/{image_name}.jpg"

    minio_client.put_object(
        bucket_name=bucket_name,
        object_name=file_path,
        data=image_bytes,
        length=len(image_bytes.getvalue()),
        content_type="image/jpeg"
    )
    return f"{file_path}"




def process_image(image: PILImage, size: tuple):
    # Crop image to the center and resize it
    width, height = image.size
    min_dimension = min(width, height)

    # Calculate cropping box
    left = (width - min_dimension) / 2
    top = (height - min_dimension) / 2
    right = (width + min_dimension) / 2
    bottom = (height + min_dimension) / 2
    im = image.convert('RGB')
    # Crop the image and resize
    image_cropped = im.crop((left, top, right, bottom))
    image_resized = image_cropped.resize(size, PILImage.Resampling.LANCZOS)

    return image_resized



def create_image(image_uuid: str, image: PILImage, bucket_name: str, db: Session, local_minio: Minio):


    # Process image to create three versions (1024x1024, 512x512, 128x128)
    image_1024 = process_image(image, (1024, 1024))
    image_512 = process_image(image, (512, 512))
    image_128 = process_image(image, (128, 128))

    # Save the images to Minio and get the URLs
    small_url = save_to_minio(image_128, f"{image_uuid}_small", "images", local_minio, bucket_name)
    medium_url = save_to_minio(image_512, f"{image_uuid}_medium", "images", local_minio, bucket_name)
    large_url = save_to_minio(image_1024, f"{image_uuid}_large", "images", local_minio, bucket_name)

    new_foto = Foto(
        uuid=image_uuid,
        creation_date=datetime.utcnow().date(),
        bucket_name=bucket_name,
        small=small_url,
        medium=medium_url,
        large=large_url
    )

    db.add(new_foto)
    db.commit()
    db.refresh(new_foto)

    return new_foto


def update_image(image_uuid: str, image: PILImage, bucket_name: str, db: Session, local_minio: Minio):
    # Process image to create three versions (1024x1024, 512x512, 128x128)
    image_1024 = process_image(image, (1024, 1024))
    image_512 = process_image(image, (512, 512))
    image_128 = process_image(image, (128, 128))

    foto = db.query(Foto).filter(Foto.uuid == image_uuid).first()
    if not foto:
        raise HTTPException(status_code=404, detail="Image not found")
    remove_image_from_minio(foto.small, bucket_name)
    remove_image_from_minio(foto.medium, bucket_name)
    remove_image_from_minio(foto.large, bucket_name)

    # Save the images to Minio and get the URLs
    small_url = save_to_minio(image_128, f"{image_uuid}_small", "images", local_minio, bucket_name)
    medium_url = save_to_minio(image_512, f"{image_uuid}_medium", "images", local_minio, bucket_name)
    large_url = save_to_minio(image_1024, f"{image_uuid}_large", "images", local_minio, bucket_name)

    foto = db.query(Foto).filter(Foto.uuid == image_uuid).first()
    if not foto:
        raise HTTPException(status_code=404, detail="Image not found")

    foto.small = small_url
    foto.medium = medium_url
    foto.large = large_url

    db.commit()
    db.refresh(foto)
    db.commit()

    return foto
