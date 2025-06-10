from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import User, BillOfMaterials
from database import get_session
from auth import get_current_user
router = APIRouter()


@router.post("/", response_model=BillOfMaterials)
def create_billOfMaterials(
    item: BillOfMaterials,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=list[BillOfMaterials])
def read_all(session: Session = Depends(get_session)):
    return session.exec(select(BillOfMaterials)).all()


@router.get("/{item_id}", response_model=BillOfMaterials)
def read_one(item_id: int, session: Session = Depends(get_session)):
    item = session.get(BillOfMaterials, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.put("/{item_id}", response_model=BillOfMaterials)
def update(
    item_id: int,
    new_data: BillOfMaterials,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(BillOfMaterials, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in new_data.dict(exclude_unset=True).items():
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
    item = session.get(BillOfMaterials, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(item)
    session.commit()
    return {"ok": True}


@router.get("/{parent_id}/children", response_model=list[BillOfMaterials])
def get_bom_children(parent_id: int, db: Session = Depends(get_session)):
    results = db.query(BillOfMaterials).filter(
        BillOfMaterials.parentProductID == parent_id).all()
    return results
