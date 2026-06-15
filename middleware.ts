import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname !== "www.tracyhouseplants.com") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.hostname = "tracyhouseplants.com";

  return NextResponse.redirect(url, 308);
}

