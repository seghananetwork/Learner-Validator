import { sql } from "@vercel/postgres";

export type DbLearner = {
  id: number;
  hub_slug: string;
  sn: number | null;
  source: string;
  name: string;
  gender: string;
  population_segment: string;
  type_of_disability: string;
  dob: string;
  type_of_id: string;
  phone: string;
  guardian_contact: string;
  employment_status: string;
  v_name: string | null;
  v_gender: string | null;
  v_population_segment: string | null;
  v_type_of_disability: string | null;
  v_dob: string | null;
  v_type_of_id: string | null;
  v_phone: string | null;
  v_guardian_contact: string | null;
  v_employment_status: string | null;
  validated: boolean;
  validated_by: string | null;
  validated_at: string | null;
};

export async function getLearnersForHub(hubSlug: string): Promise<DbLearner[]> {
  const { rows } = await sql<DbLearner>`
    SELECT * FROM learners WHERE hub_slug = ${hubSlug} ORDER BY sn NULLS LAST, id ASC
  `;
  return rows;
}

export async function insertLearnersBulk(
  hubSlug: string,
  learners: {
    sn: number | null;
    name: string;
    gender: string;
    populationSegment: string;
    typeOfDisability: string;
    dob: string;
    typeOfId: string;
    phone: string;
    guardianContact: string;
    employmentStatus: string;
  }[],
  createdBy: string
): Promise<number> {
  let count = 0;
  for (const l of learners) {
    await sql`
      INSERT INTO learners (
        hub_slug, sn, source, name, gender, population_segment, type_of_disability,
        dob, type_of_id, phone, guardian_contact, employment_status, created_by
      ) VALUES (
        ${hubSlug}, ${l.sn}, 'imported', ${l.name}, ${l.gender}, ${l.populationSegment},
        ${l.typeOfDisability}, ${l.dob}, ${l.typeOfId}, ${l.phone}, ${l.guardianContact},
        ${l.employmentStatus}, ${createdBy}
      )
    `;
    count++;
  }
  return count;
}

export async function insertAddedLearner(
  hubSlug: string,
  l: {
    name: string;
    gender: string;
    populationSegment: string;
    typeOfDisability: string;
    dob: string;
    typeOfId: string;
    phone: string;
    guardianContact: string;
    employmentStatus: string;
  },
  createdBy: string
): Promise<number> {
  const { rows } = await sql<{ id: number }>`
    INSERT INTO learners (
      hub_slug, sn, source, name, gender, population_segment, type_of_disability,
      dob, type_of_id, phone, guardian_contact, employment_status, created_by
    ) VALUES (
      ${hubSlug}, NULL, 'added', ${l.name}, ${l.gender}, ${l.populationSegment},
      ${l.typeOfDisability}, ${l.dob}, ${l.typeOfId}, ${l.phone}, ${l.guardianContact},
      ${l.employmentStatus}, ${createdBy}
    ) RETURNING id
  `;
  return rows[0].id;
}

export async function saveValidation(
  id: number,
  v: {
    name: string;
    gender: string;
    populationSegment: string;
    typeOfDisability: string;
    dob: string;
    typeOfId: string;
    phone: string;
    guardianContact: string;
    employmentStatus: string;
  },
  validatedBy: string
): Promise<void> {
  await sql`
    UPDATE learners SET
      v_name = ${v.name},
      v_gender = ${v.gender},
      v_population_segment = ${v.populationSegment},
      v_type_of_disability = ${v.typeOfDisability},
      v_dob = ${v.dob},
      v_type_of_id = ${v.typeOfId},
      v_phone = ${v.phone},
      v_guardian_contact = ${v.guardianContact},
      v_employment_status = ${v.employmentStatus},
      validated = TRUE,
      validated_by = ${validatedBy},
      validated_at = now()
    WHERE id = ${id}
  `;
}

export async function getHubSummary(): Promise<{ hub_slug: string; total: number; validated: number }[]> {
  const { rows } = await sql<{ hub_slug: string; total: string; validated: string }>`
    SELECT hub_slug, COUNT(*) as total, COUNT(*) FILTER (WHERE validated) as validated
    FROM learners GROUP BY hub_slug
  `;
  return rows.map((r) => ({ hub_slug: r.hub_slug, total: Number(r.total), validated: Number(r.validated) }));
}
