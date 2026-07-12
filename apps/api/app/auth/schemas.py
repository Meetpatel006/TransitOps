from pydantic import BaseModel, EmailStr


class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str | None = None


class AuthOut(BaseModel):
    token: str
    user: UserOut
