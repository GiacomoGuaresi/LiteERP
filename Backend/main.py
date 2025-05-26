from fastapi import FastAPI
from routers import inventory, bom, production_order, production_order_details, users, logs
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
app.include_router(bom.router, prefix="/bom", tags=["Bill of Materials"])
app.include_router(production_order.router, prefix="/orders", tags=["Production Orders"])
app.include_router(production_order_details.router, prefix="/details", tags=["Production Order Details"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)