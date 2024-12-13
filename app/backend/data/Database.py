from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Date, ForeignKey, Table, UUID, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import uuid

import os

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "user")
DB_PASS = os.getenv("DB_PASS", "password")
DB_DATABASE = os.getenv("DB_DATABASE", "digital_strichliste")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_DATABASE}"


Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


person_liste_table = Table('person_liste', Base.metadata,
                           Column('person_id', UUID(as_uuid=True), ForeignKey('persons.uuid')),
                           Column('liste_id', UUID(as_uuid=True), ForeignKey('listen.uuid'))
                           )


class Person(Base):
    __tablename__ = "persons"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)
    vorname = Column(String, nullable=False)
    nachname = Column(String, nullable=False)
    geburtstag = Column(Date)
    profilbild_id = Column(UUID(as_uuid=True), ForeignKey('fotos.uuid'), nullable=True)

    listen = relationship('Liste', secondary=person_liste_table, back_populates='personen')


class Liste(Base):
    __tablename__ = "listen"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    ersteller_id = Column(UUID(as_uuid=True), ForeignKey('persons.uuid'))
    profilbild_id = Column(UUID(as_uuid=True), ForeignKey('fotos.uuid'), nullable=True)

    personen = relationship('Person', secondary=person_liste_table, back_populates='listen')


class Strich(Base):
    __tablename__ = "striche"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('persons.uuid'))
    reporter_id = Column(UUID(as_uuid=True), ForeignKey('persons.uuid'), nullable=True)
    list_id = Column(UUID(as_uuid=True), ForeignKey('listen.uuid'))
    creation_date = Column(Date)
    reason = Column(String, nullable=False)
    reason_image_id = Column(UUID(as_uuid=True), ForeignKey('fotos.uuid'), nullable=True)
    done = Column(Boolean, default=False)
    done_date = Column(Date, nullable=True)
    done_image_id = Column(UUID(as_uuid=True), ForeignKey('fotos.uuid'), nullable=True)


class Foto(Base):
    __tablename__ = "fotos"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creation_date = Column(Date, nullable=False)
    bucket_name = Column(String, nullable=False)
    small = Column(String, nullable=False)
    medium = Column(String, nullable=False)
    large = Column(String, nullable=False)


Base.metadata.create_all(bind=engine)
