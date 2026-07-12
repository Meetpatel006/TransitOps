import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || "http://localhost:3001";
    return NextResponse.redirect(new URL(`${marketingUrl}/login`));
  }

  const response = NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  response.cookies.set("token", token, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
