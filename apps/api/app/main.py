from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.analytics import router as analytics_router
from app.auth import router as auth_router
from app.drivers import router as drivers_router
from app.expenses import router as expenses_router
from app.fuel_logs import router as fuel_logs_router
from app.maintenance import router as maintenance_router
from app.trips import router as trips_router
from app.vehicles import router as vehicles_router

app = FastAPI(title="TransitOps API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(analytics_router)
app.include_router(vehicles_router)
app.include_router(drivers_router)
app.include_router(trips_router)
app.include_router(maintenance_router)
app.include_router(fuel_logs_router)
app.include_router(expenses_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
