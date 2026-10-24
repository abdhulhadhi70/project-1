import { NextResponse, type NextRequest } from "next/server";

// Only English is live, so every unprefixed path goes to /en. When Arabic or
// Malayalam is added, pick the locale from a cookie or Accept-Language here.
const LOCALES = ["en"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (LOCALES.includes(first)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Skip API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
