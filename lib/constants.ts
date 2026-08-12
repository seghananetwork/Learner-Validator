export const HUB = "Agritech";
export const COHORT = "Year 3, Cohort 1";

export const POPULATION_SEGMENTS = [
  "N/A",
  "Refugee",
  "Internally Displaced",
  "Person with Disability",
  "Refugee with Disability",
  "Internally Displaced with Disability",
] as const;

export const DISABILITY_TYPES = [
  "N/A",
  "Albinism",
  "Epilepsy",
  "Hearing Impairment",
  "Intellectual Disability",
  "Little Person",
  "Mental Disability",
  "Physical Impairment",
  "Speech Impairment",
  "Visual Impairment",
] as const;

export const ID_TYPES = [
  "Ecowas Card",
  "Passport",
  "Voters ID",
  "NHIS",
  "Birth Certificate",
  "Refugee ID",
  "Other",
] as const;

export const GENDERS = ["Female", "Male"] as const;

export const EMPLOYMENT_STATUSES = ["Employed", "Not employed"] as const;

export const FIELD_LABELS = [
  "Name",
  "Gender",
  "Population Segment",
  "Type of Disability",
  "Date of Birth",
  "Type of ID",
  "Phone Number",
  "Guardian Contact",
  "Employment Status",
] as const;

export type Learner = {
  id?: number; // present once this learner exists in the shared database
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
};

export type ValidatedField<T> = {
  original: T;
  value: T;
  confirmed: boolean;
};

export type ValidatedLearner = {
  id?: number;
  sn: number | null;
  isNew?: boolean; // added in the field by an enumerator, not from the original sheet
  name: ValidatedField<string>;
  gender: ValidatedField<string>;
  populationSegment: ValidatedField<string>;
  typeOfDisability: ValidatedField<string>;
  dob: ValidatedField<string>;
  typeOfId: ValidatedField<string>;
  phone: ValidatedField<string>;
  guardianContact: ValidatedField<string>;
  employmentStatus: ValidatedField<string>;
  status: "pending" | "done";
  submitted: boolean;
};

export function toValidatedLearner(l: Learner): ValidatedLearner {
  const f = <T,>(v: T): ValidatedField<T> => ({ original: v, value: v, confirmed: false });
  return {
    id: l.id,
    sn: l.sn,
    name: f(l.name),
    gender: f(l.gender),
    populationSegment: f(l.populationSegment),
    typeOfDisability: f(l.typeOfDisability),
    dob: f(l.dob),
    typeOfId: f(l.typeOfId),
    phone: f(l.phone),
    guardianContact: f(l.guardianContact),
    employmentStatus: f(l.employmentStatus),
    status: "pending",
    submitted: false,
  };
}

export function isComplete(l: ValidatedLearner): boolean {
  return FIELD_KEYS.every((k) => (l[k] as ValidatedField<string>).confirmed);
}

export function blankNewLearner(nextSn: number): ValidatedLearner {
  const base = toValidatedLearner({
    sn: null,
    name: "",
    gender: "Female",
    populationSegment: "N/A",
    typeOfDisability: "N/A",
    dob: "",
    typeOfId: "Ecowas Card",
    phone: "",
    guardianContact: "",
    employmentStatus: "Not employed",
  });
  base.isNew = true;
  // negative sn used only as a temporary local list-ordering key, not sent anywhere meaningful
  base.sn = -nextSn;
  return base;
}

export const FIELD_KEYS = [
  "name",
  "gender",
  "populationSegment",
  "typeOfDisability",
  "dob",
  "typeOfId",
  "phone",
  "guardianContact",
  "employmentStatus",
] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];
