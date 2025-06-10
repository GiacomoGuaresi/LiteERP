from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.orm import Session
from models import User, ProductionOrder, BillOfMaterials, ProductionOrderDetails, Inventory
from database import get_session
from pydantic import BaseModel
from auth import get_current_user

router = APIRouter()


class StatusUpdateRequest(BaseModel):
    new_status: str


def update_production_order_status_backend(item_id: int, new_status: str, session: Session):
    return update_status(item_id, StatusUpdateRequest(new_status=new_status), session)


@router.post("/", response_model=ProductionOrder)
def create_productionOrder(
    item: ProductionOrder,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    session.add(item)

    boms = session.query(BillOfMaterials).filter(
        BillOfMaterials.parentProductID == item.productID).all()
    for bom in boms:
        inventory_item = session.get(Inventory, bom.childProductID)
        quantityRequired = bom.quantity * item.quantityRequested
        quantityLocked = min(inventory_item.quantity_on_hand, quantityRequired)

        detail = ProductionOrderDetails(
            productionOrderID=item.ID,
            productID=bom.childProductID,
            quantityRequired=quantityRequired,
            quantityLocked=quantityLocked
        )
        session.add(detail)
        # Blocca i pezzi in magazzino
        inventory_item.quantity_locked += quantityLocked
        inventory_item.quantity_on_hand -= quantityLocked
        session.add(inventory_item)

        if (inventory_item.category == "Subassembly"):
            if quantityLocked < quantityRequired:
                # call create_productionOrder
                sub_order = ProductionOrder(
                    date=item.date,
                    productID=bom.childProductID,
                    quantityRequested=quantityRequired - quantityLocked,
                    quantityProduced=0,
                    status=item.status,
                    parentProductionOrderDetailsID=item.ID,
                    userIDs=item.userIDs,
                    notes=item.notes
                )
                create_productionOrder(sub_order, session)

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
def update(
    item_id: int,
    new_data: ProductionOrder,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
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
def delete(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    item = session.get(ProductionOrder, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    sub_orders = session.query(ProductionOrder).filter(
        ProductionOrder.parentProductionOrderDetailsID == item_id).all()
    for sub_order in sub_orders:
        delete(sub_order.ID, session)

    details = session.query(ProductionOrderDetails).filter(
        ProductionOrderDetails.productionOrderID == item_id).all()
    for detail in details:
        # Libero Pezzi bloccati
        inventory_item = session.get(Inventory, detail.productID)
        inventory_item.quantity_locked -= detail.quantityLocked
        inventory_item.quantity_on_hand += detail.quantityLocked
        session.add(inventory_item)

        session.delete(detail)

    session.delete(item)
    session.commit()
    return {"ok": True}


@router.post("/{item_id}/updateStatus", response_model=ProductionOrder)
def update_status(
    item_id: int,
    payload: StatusUpdateRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    valid_statuses = ["Planned", "In Progress", "Completed"]
    if payload.new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status: {payload.new_status}. Valid statuses are: {valid_statuses}"
        )

    item = session.get(ProductionOrder, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    # check if status can be updated Planned -> In Progress -> Completed
    if item.status == "Completed":
        raise HTTPException(
            status_code=400, detail="Production order is already completed")
    if item.status == "In Progress" and payload.new_status == "Planned":
        raise HTTPException(
            status_code=400, detail="Cannot revert status from In Progress to Planned")
    if item.status == "Planned" and payload.new_status == "Completed":
        raise HTTPException(
            status_code=400, detail="Cannot complete a production order that is still planned")
    if item.status == payload.new_status:
        raise HTTPException(
            status_code=400, detail=f"Production order is already in status: {payload.new_status}")

    # update sub-orders
    sub_orders = session.query(ProductionOrder).filter(
        ProductionOrder.parentProductionOrderDetailsID == item_id).all()
    for sub_order in sub_orders:
        update_production_order_status_backend(
            sub_order.ID, payload.new_status, session)

    item.status = payload.new_status
    session.add(item)
    session.commit()
    session.refresh(item)

    return item


@router.get("/{item_id}/details", response_model=list[ProductionOrderDetails])
def read_details(item_id: int, session: Session = Depends(get_session)):
    statement = select(ProductionOrderDetails).where(
        ProductionOrderDetails.productionOrderID == item_id)
    results = session.exec(statement).all()
    return results
