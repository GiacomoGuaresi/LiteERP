from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import User
from database import get_session
from security import hash_password, verify_password
from auth import create_access_token, get_current_user
from database import engine
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post("/")
def register(
    user: User,
    current_user: User = Depends(get_current_user),
):
    with Session(engine) as session:
        user.password = hash_password(user.password)
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"msg": "User registered"}


@router.get("/", response_model=list[User])
def read_all(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return session.exec(select(User)).all()


@router.get("/me", response_model=User)
def read_current_user(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.get("/{item_id}", response_model=User)
def read_one(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(User, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    email = form_data.username  # sì, si chiama username anche se usi l'email
    password = form_data.password
    with Session(engine) as session:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        if not user or not verify_password(password, user.password):
            raise HTTPException(status_code=400, detail="Invalid credentials")
        token = create_access_token(data={"sub": user.email})
        return {"access_token": token, "token_type": "bearer"}


@router.put("/{item_id}", response_model=User)
def update(
    item_id: int,
    new_data: User,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(User, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="User not found")

    if item.ID != current_user.ID:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this user")

    update_data = new_data.dict(exclude_unset=True)

    if "password" in update_data and update_data["password"]:
        update_data["password"] = hash_password(update_data["password"])

    for key, value in update_data.items():
        setattr(item, key, value)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.delete("/{item_id}")
def delete(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(User, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(item)
    session.commit()
    return {"ok": True}
