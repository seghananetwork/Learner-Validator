import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileBase64, fileName, submittedBy, hub, learnerCount } = body as {
      fileBase64: string;
      fileName: string;
      submittedBy: string;
      hub: string;
      learnerCount: number;
    };

    if (!fileBase64 || !fileName) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || "noreply@seghana.net",
      to: process.env.MAIL_TO || "merl@seghana.net",
      subject: `${hub} \u2013 Validated Learner Data (${learnerCount} learners)`,
      text: `Attached is the validated learner list for ${hub}, submitted by ${submittedBy} on ${new Date().toLocaleString()}.\n\nLearners in this batch: ${learnerCount}.`,
      attachments: [
        {
          filename: fileName,
          content: fileBase64,
          encoding: "base64",
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("submit error", err);
    return NextResponse.json({ error: err?.message || "Send failed" }, { status: 500 });
  }
}
