import { NextResponse, type NextRequest } from "next/server";
import { processDueScheduleReminderEmails } from "@/lib/email/order-email-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const sentCount = await processDueScheduleReminderEmails();
    return NextResponse.json({ ok: true, sentCount });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to process order reminder emails." },
      { status: 500 }
    );
  }
}
