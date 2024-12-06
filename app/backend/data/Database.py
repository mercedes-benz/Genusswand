from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Date, ForeignKey, Table, UUID, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import uuid

DATABASE_URL = "postgresql://user:password@db/digital_strichliste"

# Create a new FastAPI instance


# Initialize SQLAlchemy base and engine
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Many-to-Many relationship table
person_liste_table = Table('person_liste', Base.metadata,
                           Column('person_id', UUID(as_uuid=True), ForeignKey('persons.uuid')),
                           Column('liste_id', UUID(as_uuid=True), ForeignKey('listen.uuid'))
                           )


# Define the Person model
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


# Define the Liste model
class Liste(Base):
    __tablename__ = "listen"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    ersteller_id = Column(UUID(as_uuid=True), ForeignKey('persons.uuid'))
    profilbild_id = Column(UUID(as_uuid=True), ForeignKey('fotos.uuid'), nullable=True)

    personen = relationship('Person', secondary=person_liste_table, back_populates='listen')


# Define the Strich model
class Strich(Base):
    __tablename__ = "striche"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('persons.uuid'))
    reporter_id = Column(UUID(as_uuid=True), ForeignKey('persons.uuid'))
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


# Create all tables in the database
Base.metadata.create_all(bind=engine)
