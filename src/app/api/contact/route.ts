import { NextResponse } from "next/server";
import { bySlug } from "@/lib/data";

// Contact relay (PRD §8.2). Raw practitioner emails are never exposed to the
// client; the server looks up the real address and relays the message. This
// endpoint is also where enquiry-volume data is recorded — the first such
// dataset the organisation has ever had.
//
// Production: persist to the `enquiry` table and send via a transactional
// email provider (e.g. Resend/Postmark) with the sender in Reply-To. The demo
// build validates and acknowledges without sending.

export async function POST(req: Request) {
  let body: {
    practitionerSlug?: string;
    senderName?: string;
    senderEmail?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { practitionerSlug, senderName, senderEmail, message } = body;
  if (!practitionerSlug || !senderName || !senderEmail || !message) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(senderEmail)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  const practitioner = bySlug(practitionerSlug);
  if (!practitioner) {
    return NextResponse.json({ error: "unknown practitioner" }, { status: 404 });
  }

  // Demo: log the enquiry server-side only. No real email is sent and no
  // practitioner address ever reaches the client.
  console.log(
    `[enquiry] to=${practitioner.slug} from=${senderName} <${senderEmail}> len=${message.length}`
  );

  return NextResponse.json({ ok: true });
}
