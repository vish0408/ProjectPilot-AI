export interface GenerateProposalRequest {
  researchArea: string;
  keywords: string;
  difficulty: string;
  duration: string;
  additionalContext?: string;
}

export interface ImproveProposalRequest {
  sectionName: string;
  sectionContent: string;
  improvementType: string;
  researchArea: string;
}

export interface RegenerateSectionRequest {
  proposalId: string;
  sectionName: string;
  researchArea: string;
  keywords: string;
}

export interface SaveProposalRequest {
  title: string;
  researchArea: string;
  keywords: string;
  difficulty: string;
  duration: string;
  abstract: string;
  objectives: string;
  problemStatement: string;
  scope: string;
  literatureReview: string;
  methodology: string;
  expectedOutcome: string;
  timeline: string;
  requiredTools: string;
  expectedResult: string;
  futureScope: string;
  references: string;
}

export interface ProposalResponse {
  id: string;
  studentId: string;
  title: string;
  researchArea: string;
  keywords: string;
  difficulty: string;
  duration: string;
  abstract: string;
  objectives: string;
  problemStatement: string;
  scope: string;
  literatureReview: string;
  methodology: string;
  expectedOutcome: string;
  timeline: string;
  requiredTools: string;
  expectedResult: string;
  futureScope: string;
  references: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProposalTemplate {
  name: string;
  description: string;
  researchArea: string;
  difficulty: string;
  duration: string;
  keywords: string;
}

export const DEPARTMENTS = [
  "Engineering", "Computer Science", "IT", "ECE", "EEE",
  "Mechanical", "Civil", "MBA", "Medical", "Dental",
  "Nursing", "Law", "Arts",
];

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export const DURATIONS = ["3 Months", "4 Months", "6 Months", "12 Months", "18 Months", "24 Months"];

export const PROPOSAL_SECTIONS = [
  { key: "title", label: "Research Title" },
  { key: "abstract", label: "Abstract" },
  { key: "objectives", label: "Objectives" },
  { key: "problemStatement", label: "Problem Statement" },
  { key: "scope", label: "Scope" },
  { key: "literatureReview", label: "Literature Review" },
  { key: "methodology", label: "Methodology" },
  { key: "expectedOutcome", label: "Expected Outcome" },
  { key: "timeline", label: "Timeline" },
  { key: "requiredTools", label: "Required Tools" },
  { key: "expectedResult", label: "Expected Result" },
  { key: "futureScope", label: "Future Scope" },
  { key: "references", label: "References" },
] as const;
