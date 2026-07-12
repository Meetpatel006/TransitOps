from pydantic import BaseModel, EmailStr


class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    role: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str
    role: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str | None = None
    role_name: str | None = None


class AuthOut(BaseModel):
    token: str
    user: UserOut
