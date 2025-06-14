from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from models import User, ProductionOrderDetails, ProductionOrder
from database import get_session
from typing import Optional
from auth import get_current_user

router = APIRouter()


@router.post("/", response_model=ProductionOrderDetails)
def create_productionOrderDetails(
    item: ProductionOrderDetails,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.get("/", response_model=list[ProductionOrderDetails])
def read_all(
    status: Optional[str] = Query(default=None),
    session: Session = Depends(get_session)
):
    query = select(ProductionOrderDetails).join(
        ProductionOrder,
        ProductionOrder.ID == ProductionOrderDetails.productionOrderID
    )

    if status:
        query = query.where(ProductionOrder.status == status)

    return session.exec(query).all()


@router.get("/{item_id}", response_model=ProductionOrderDetails)
def read_one(item_id: int, session: Session = Depends(get_session)):
    item = session.get(ProductionOrderDetails, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.put("/{item_id}", response_model=ProductionOrderDetails)
def update(
        item_id: int,
        new_data: ProductionOrderDetails,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
):
    item = session.get(ProductionOrderDetails, item_id)
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
    item = session.get(ProductionOrderDetails, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(item)
    session.commit()
    return {"ok": True}
