import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as XLSX from "xlsx";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { isValidHub } from "@/lib/hubs";
import { insertLearnersBulk } from "@/lib/server-db";

export const runtime = "nodejs";

const HEADER_MAP: Record<string, string> = {
  name: "name",
  gender: "gender",
  "population segment": "populationSegment",
  "type of disability": "typeOfDisability",
  "date of birth": "dob",
  "date of birth (dd/mm/yyyy)": "dob",
  "type of id": "typeOfId",
  "phone number": "phone",
  "guardian contact": "guardianContact",
  "employment status": "employmentStatus",
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const form = await req.formData();
  const hub = form.get("hub") as string | null;
  const file = form.get("file") as File | null;

  if (!hub || !isValidHub(hub)) {
    return NextResponse.json({ error: "Missing or unknown hub" }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rows.length === 0) {
    return NextResponse.json({ error: "The sheet has no data rows" }, { status: 400 });
  }

  // Build a header-key lookup from whatever the actual column names are.
  const sampleRow = rows[0];
  const keyLookup: Record<string, string> = {};
  for (const rawKey of Object.keys(sampleRow)) {
    const mapped = HEADER_MAP[normalizeHeader(rawKey)];
    if (mapped) keyLookup[mapped] = rawKey;
  }
  if (!keyLookup.name) {
    return NextResponse.json(
      { error: "Couldn't find a 'Name' column. Please use the provided template." },
      { status: 400 }
    );
  }

  const learners = rows
    .filter((r) => String(r[keyLookup.name] ?? "").trim().length > 0)
    .map((r, i) => ({
      sn: i + 1,
      name: String(r[keyLookup.name] ?? "").trim(),
      gender: String(r[keyLookup.gender] ?? "").trim(),
      populationSegment: String(r[keyLookup.populationSegment] ?? "N/A").trim() || "N/A",
      typeOfDisability: String(r[keyLookup.typeOfDisability] ?? "N/A").trim() || "N/A",
      dob: String(r[keyLookup.dob] ?? "").trim(),
      typeOfId: String(r[keyLookup.typeOfId] ?? "").trim(),
      phone: String(r[keyLookup.phone] ?? "").trim(),
      guardianContact: String(r[keyLookup.guardianContact] ?? "").trim(),
      employmentStatus: String(r[keyLookup.employmentStatus] ?? "Not employed").trim() || "Not employed",
    }));

  const count = await insertLearnersBulk(hub, learners, session.user.email);

  return NextResponse.json({ ok: true, count });
}
