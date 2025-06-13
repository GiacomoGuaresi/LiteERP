from fastapi import FastAPI
from routers import inventory, bom, production_order, production_order_details, users, logs
from fastapi.middleware.cors import CORSMiddleware

# Importa i modelli necessari per la configurazione OpenAPI/Swagger UI
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.openapi.models import SecurityScheme as SecuritySchemeModel
from fastapi.openapi.models import OAuthFlowPassword as OAuthFlowPasswordModel

from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import create_db_and_tables

app = FastAPI(
    title="Il mio API FastAPI",
    description="Una semplice API per la gestione dell'inventario e degli ordini di produzione.",
    version="1.0.0",
    # Qui aggiungiamo la configurazione di sicurezza per Swagger UI
    openapi_extra={
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "JWT Authorization header using the Bearer scheme. Enter your JWT token (e.g. `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsImV4cCI6MTY3ODkzMDYwN30.YOUR_TOKEN`)",
                }
            }
        },
        "security": [
            {"BearerAuth": []}
        ]
    }
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Questa parte viene eseguita all'avvio
    create_db_and_tables()
    yield
    # Questa parte viene eseguita alla chiusura (opzionale)

app = FastAPI(lifespan=lifespan)



app.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
app.include_router(bom.router, prefix="/bom", tags=["Bill of Materials"])
app.include_router(production_order.router, prefix="/orders", tags=["Production Orders"])
app.include_router(production_order_details.router, prefix="/details", tags=["Production Order Details"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://liteerp.local:8000/"],  # frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
