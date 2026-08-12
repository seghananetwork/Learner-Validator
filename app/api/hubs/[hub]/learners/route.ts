import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isValidHub } from "@/lib/hubs";
import { getLearnersForHub, insertAddedLearner, DbLearner } from "@/lib/server-db";
import { ValidatedLearner } from "@/lib/constants";

export const runtime = "nodejs";

function toValidated(row: DbLearner): ValidatedLearner {
  const field = (orig: string, v: string | null) => ({
    original: orig,
    value: v ?? orig,
    confirmed: row.validated,
  });
  return {
    id: row.id,
    sn: row.sn,
    isNew: row.source === "added",
    name: field(row.name, row.v_name),
    gender: field(row.gender, row.v_gender),
    populationSegment: field(row.population_segment, row.v_population_segment),
    typeOfDisability: field(row.type_of_disability, row.v_type_of_disability),
    dob: field(row.dob, row.v_dob),
    typeOfId: field(row.type_of_id, row.v_type_of_id),
    phone: field(row.phone, row.v_phone),
    guardianContact: field(row.guardian_contact, row.v_guardian_contact),
    employmentStatus: field(row.employment_status, row.v_employment_status),
    status: row.validated ? "done" : "pending",
    submitted: row.validated,
  };
}

export async function GET(req: NextRequest, { params }: { params: { hub: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isValidHub(params.hub)) return NextResponse.json({ error: "Unknown hub" }, { status: 404 });

  const rows = await getLearnersForHub(params.hub);
  return NextResponse.json({ learners: rows.map(toValidated) });
}

export async function POST(req: NextRequest, { params }: { params: { hub: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isValidHub(params.hub)) return NextResponse.json({ error: "Unknown hub" }, { status: 404 });

  const body = await req.json();
  const id = await insertAddedLearner(
    params.hub,
    {
      name: body.name,
      gender: body.gender,
      populationSegment: body.populationSegment,
      typeOfDisability: body.typeOfDisability,
      dob: body.dob,
      typeOfId: body.typeOfId,
      phone: body.phone,
      guardianContact: body.guardianContact,
      employmentStatus: body.employmentStatus,
    },
    session.user.email
  );
  return NextResponse.json({ id });
}
