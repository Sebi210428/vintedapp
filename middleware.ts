import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) return NextResponse.next();

  const isProd = process.env.NODE_ENV === "production";
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret && isProd) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }
  if (secret) {
    const token = await getToken({ req: request, secret });
    if (token) return NextResponse.next();
  } else {
    const cookie =
      request.cookies.get("__Secure-next-auth.session-token")?.value ??
      request.cookies.get("next-auth.session-token")?.value ??
      request.cookies.get("__Secure-next-auth.session-token.0")?.value ??
      request.cookies.get("next-auth.session-token.0")?.value;
    if (cookie) return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
