from pydantic import BaseModel


class VehicleOut(BaseModel):
    id: int
    registration_number: str
    name_model: str
    type: str
    maximum_load_capacity: float
    odometer: float
    acquisition_cost: float
    status: str


class VehicleCreate(BaseModel):
    registration_number: str
    name_model: str
    type: str
    maximum_load_capacity: float
    odometer: float = 0.0
    acquisition_cost: float = 0.0


class VehicleUpdate(BaseModel):
    registration_number: str | None = None
    name_model: str | None = None
    type: str | None = None
    maximum_load_capacity: float | None = None
    odometer: float | None = None
    acquisition_cost: float | None = None
    status: str | None = None
