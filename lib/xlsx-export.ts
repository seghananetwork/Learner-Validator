import * as XLSX from "xlsx";
import { ValidatedLearner } from "./constants";

const HEADERS = [
  "Name (validated)",
  "Gender (validated)",
  "Population Segment (validated)",
  "Type of Disability (validated)",
  "Date of Birth (validated)",
  "Type of ID (validated)",
  "Phone Number (validated)",
  "Guardian Contact (validated)",
  "Employment Status (validated)",
];

export function buildWorkbookBase64(learners: ValidatedLearner[]): string {
  const rows = learners.map((l) => [
    l.name.value,
    l.gender.value,
    l.populationSegment.value,
    l.typeOfDisability.value,
    l.dob.value,
    l.typeOfId.value,
    l.phone.value,
    l.guardianContact.value,
    l.employmentStatus.value,
  ]);
  const sheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  sheet["!cols"] = HEADERS.map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Validated Learners");
  const out = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  return out as string;
}
