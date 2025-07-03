from sqlmodel import SQLModel, create_engine, Session, select
from models import User
from security import hash_password
import secrets  # per generare password sicura temporanea
from sqlalchemy import text

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

    # Creazione utente admin se non esiste
    with Session(engine) as session:
        result = session.exec(select(User).where(User.email == "admin@example.com"))
        admin_user = result.first()

        if not admin_user:
            temp_password = secrets.token_urlsafe(12)
            hashed_password = hash_password(temp_password)

            admin = User(
                email="admin@example.com",
                password=hashed_password,
                name="Admin",
                surname="User"
            )
            session.add(admin)
            session.commit()
            print("✅ Admin user created:")

            # Esegui payload.sql dopo la creazione dell'admin
            with engine.connect() as conn:
                with open("payload.sql", "r", encoding="utf-8") as f:
                    sql_payload = f.read()
                    for stmt in sql_payload.strip().split(";"):
                        if stmt.strip():  # ignora righe vuote
                            conn.execute(text(stmt))
                    conn.commit()
                print("📦 payload.sql eseguito.")

            print("================================================")
            print("Admin Crededential")
            print("================================================")
            print(f"Email: admin@example.com")
            print(f"Password: {temp_password}")
            print("================================================")
        else:
            print("ℹ️ Admin user already exists.")

def get_session():
    with Session(engine) as session:
        yield session
