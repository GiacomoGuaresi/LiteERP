from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field

class Inventory(SQLModel, table=True):
    ID: Optional[int] = Field(default=None, primary_key=True)
    code: str
    quantity_on_hand: int
    quantity_locked: int
    category: str
    image: Optional[str] = None  # oppure blob, ma come string base64
    datas: Optional[str] = None

class BillOfMaterials(SQLModel, table=True):
    ID: Optional[int] = Field(default=None, primary_key=True)
    parentProductID: int
    childProductID: int
    quantity: int

class ProductionOrder(SQLModel, table=True):
    ID: Optional[int] = Field(default=None, primary_key=True)
    date: str
    productID: int
    quantityRequested: int
    quantityProduced: int
    status: str
    parentProductionOrderDetailsID: Optional[int] = None
    userIDs: Optional[str] = None
    notes: Optional[str] = None

class ProductionOrderDetails(SQLModel, table=True):
    ID: Optional[int] = Field(default=None, primary_key=True)
    productionOrderID: int
    productID: int
    quantityRequired: int
    quantityLocked: int

class User(SQLModel, table=True):
    ID: Optional[int] = Field(default=None, primary_key=True)
    email: str
    password: str
    name: str
    surname: str

class Logs (SQLModel, table=True):
    ID: Optional[int] = Field(default=None, primary_key=True)
    timestamp: str
    message: str
    executed_by: Optional[str] = None