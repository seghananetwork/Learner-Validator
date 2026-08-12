import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveValidation, insertAddedLearner } from "@/lib/server-db";
import { ValidatedLearner } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileBase64, fileName, submittedBy, hub, hubName, learners } = body as {
      fileBase64: string;
      fileName: string;
      submittedBy: string;
      hub: string;
      hubName: string;
      learners: ValidatedLearner[];
    };

    if (!fileBase64 || !fileName) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Persist validated values back to the shared database.
    if (Array.isArray(learners)) {
      for (const l of learners) {
        const values = {
          name: l.name.value,
          gender: l.gender.value,
          populationSegment: l.populationSegment.value,
          typeOfDisability: l.typeOfDisability.value,
          dob: l.dob.value,
          typeOfId: l.typeOfId.value,
          phone: l.phone.value,
          guardianContact: l.guardianContact.value,
          employmentStatus: l.employmentStatus.value,
        };
        if (l.id) {
          await saveValidation(l.id, values, submittedBy);
        } else if (hub) {
          const id = await insertAddedLearner(hub, values, submittedBy);
          await saveValidation(id, values, submittedBy);
        }
      }
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
      subject: `${hubName || hub} \u2013 Validated Learner Data (${learners?.length ?? 0} learners)`,
      text: `Attached is the validated learner list for ${hubName || hub}, submitted by ${submittedBy} on ${new Date().toLocaleString()}.\n\nLearners in this batch: ${learners?.length ?? 0}.`,
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
