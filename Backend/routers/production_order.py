from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import ProductionOrder, BillOfMaterials, ProductionOrderDetails, Inventory
from database import get_session

router = APIRouter()

@router.post("/", response_model=ProductionOrder)
def create_productionOrder(item: ProductionOrder, session: Session = Depends(get_session)):
    session.add(item)
    
    boms = session.query(BillOfMaterials).filter(BillOfMaterials.parentProductID == item.productID).all()
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

        if(inventory_item.category == "Subassembly"):
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

    sub_orders = session.query(ProductionOrder).filter(ProductionOrder.parentProductionOrderDetailsID == item_id).all()
    for sub_order in sub_orders:
        delete(sub_order.ID, session)

    details = session.query(ProductionOrderDetails).filter(ProductionOrderDetails.productionOrderID == item_id).all()
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

@router.post("/{item_id}/start")
def start_production_order(item_id: int, session: Session = Depends(get_session)):
    item = session.get(ProductionOrder, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    
    if item.status != "Planned":
        raise HTTPException(status_code=400, detail="Production order is not in a valid state to start")

    # update sub-orders
    sub_orders = session.query(ProductionOrder).filter(ProductionOrder.parentProductionOrderDetailsID == item_id).all()
    for sub_order in sub_orders:
        start_production_order(sub_order.ID, session)

    item.status = "In Progress"
    session.add(item)
    session.commit()
    session.refresh(item)
    
    return item