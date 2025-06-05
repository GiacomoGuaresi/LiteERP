from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from models import Inventory, ProductionOrder, ProductionOrderDetails
from routers import production_order
from database import get_session
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class QuantityPayload(BaseModel):
    quantity: int

@router.post("/", response_model=Inventory)
def create_inventory(item: Inventory, session: Session = Depends(get_session)):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.get("/", response_model=List[dict])  # ritorniamo dict invece che Inventory
def read_all(
    fields: Optional[str] = Query(None, description="Comma-separated list of fields to include"),
    session: Session = Depends(get_session)
):
    items = session.exec(select(Inventory)).all()
    
    if fields:
        requested_fields = set(fields.split(","))
        valid_fields = set(Inventory.__fields__.keys())
        
        if not requested_fields.issubset(valid_fields):
            raise HTTPException(status_code=400, detail=f"Invalid fields: {requested_fields - valid_fields}")
        
        result = [{field: getattr(item, field) for field in requested_fields} for item in items]
    else:
        result = [item.dict() for item in items]
    return result

@router.get("/{item_id}", response_model=Inventory)
def read_one(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Inventory, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item

@router.put("/{item_id}", response_model=Inventory)
def update(item_id: int, new_data: Inventory, session: Session = Depends(get_session)):
    item = session.get(Inventory, item_id)
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
    item = session.get(Inventory, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(item)
    session.commit()
    return {"ok": True}

@router.post("/{item_id}/add/")
def add_to_inventory(item_id: int, payload: QuantityPayload, session: Session = Depends(get_session)):
    item = session.get(Inventory, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    
    productionOrder = session.exec(
        select(ProductionOrder)
        .where(ProductionOrder.productID == item_id)
        .where(ProductionOrder.status.in_(["In Progress", "Planned"]))
        .order_by(ProductionOrder.date.desc())
    ).all()
    if productionOrder:
        copyOfquantity = payload.quantity
        for order in productionOrder:
            if copyOfquantity <= 0:
                break
            if order.quantityRequested > order.quantityProduced:
                quantity_just_produced = min(order.quantityRequested - order.quantityProduced, copyOfquantity)
                order.quantityProduced += quantity_just_produced
                copyOfquantity -= quantity_just_produced
                
                if(order.quantityProduced >= order.quantityRequested):
                    production_order.update_production_order_status_backend(order.ID, "Completed", session)

                session.add(order)

    productionOrderDetails = session.exec(
        select(ProductionOrderDetails)
        .where(ProductionOrderDetails.productID == item_id)
        .where(ProductionOrderDetails.quantityLocked < ProductionOrderDetails.quantityRequired)
        .join(ProductionOrder, ProductionOrder.ID == ProductionOrderDetails.productionOrderID)
        .where(ProductionOrder.status.in_(["In Progress", "Planned"]))
        .order_by(ProductionOrder.date.desc())
    ).all()
    if productionOrderDetails:
        for detail in productionOrderDetails:
            if payload.quantity <= 0:
                break
            quantity_just_produced = min(detail.quantityRequired - detail.quantityLocked, payload.quantity)
            detail.quantityLocked += quantity_just_produced
            payload.quantity -= quantity_just_produced
            item.quantity_locked += quantity_just_produced
            session.add(detail)
    
    item.quantity_on_hand += payload.quantity
    session.add(item)

    session.commit()
    session.refresh(item)
    return item

@router.post("/{item_id}/remove/")
def remove_from_inventory(item_id: int, payload: QuantityPayload, session: Session = Depends(get_session)):
    item = session.get(Inventory, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    if item.quantity_on_hand < payload.quantity:
        raise HTTPException(status_code=400, detail="Not enough items in inventory")
    item.quantity_on_hand -= payload.quantity
    session.add(item)
    session.commit()
    session.refresh(item)
    return item