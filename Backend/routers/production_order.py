from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import ProductionOrder
from database import get_session

router = APIRouter()

@router.post("/", response_model=ProductionOrder)
def create_productionOrder(item: ProductionOrder, session: Session = Depends(get_session)):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.get("/", response_model=list[ProductionOrder])
def read_all(session: Session = Depends(get_session)):
    return session.exec(select(ProductionOrder)).all()

@router.get("/{item_id}", response_model=ProductionOrder)
def read_one(item_id: int, session: Session = Depends(get_session)):
    item = session.get(ProductionOrder, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@router.put("/{item_id}", response_model=ProductionOrder)
def update(item_id: int, new_data: ProductionOrder, session: Session = Depends(get_session)):
    item = session.get(ProductionOrder, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in new_data.dict(exclude_unset=True).items():
        setattr(item, key, value)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.delete("/{item_id}")
def delete(item_id: int, session: Session = Depends(get_session)):
    item = session.get(ProductionOrder, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(item)
    session.commit()
    return {"ok": True}
