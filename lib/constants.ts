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
  sn: number;
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
  sn: number;
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
