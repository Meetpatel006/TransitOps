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
    allow_origins=["*"],
    allow_credentials=False,
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

@app.post("/api/seed")
async def seed_database(secret: str):
    import os
    from fastapi import HTTPException
    
    expected_secret = os.environ.get("SEED_SECRET", "transitops-seed")
    if secret != expected_secret:
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    from app.seed import seed
    try:
        seed()
        return {"status": "Database seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
