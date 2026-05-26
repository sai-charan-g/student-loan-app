// ─── Shared Types ───
// These mirror the backend enums for type safety across the stack

export enum AdmissionStatus {
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  APPLIED = 'APPLIED',
  PLANNING = 'PLANNING',
}

export enum EmploymentType {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  BUSINESS = 'BUSINESS',
  RETIRED = 'RETIRED',
  OTHER = 'OTHER',
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SCORING_COMPLETE = 'SCORING_COMPLETE',
  NEEDS_INFO = 'NEEDS_INFO',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
}

export interface ApplicationFormData {
  // Personal
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  panNumber: string;
  city: string;
  state: string;

  // Academic
  highestEducation: string;
  currentInstitution: string;
  lastGpaPercentage: number | '';
  targetCourse: string;
  targetUniversity: string;
  admissionStatus: AdmissionStatus | '';
  entranceExam: string;
  entranceScore: string;
  courseDurationYears: number | '';
  annualCourseFee: number | '';

  // Financial
  annualFamilyIncome: number | '';
  earnerEmploymentType: EmploymentType | '';
  existingEmiAmount: number | '';
  hasCoapplicant: boolean;
  coapplicantRelation: string;
  loanAmountRequired: number | '';
  hasCollateral: boolean;
}

export interface ApplicationResponse {
  id: string;
  applicationNumber: string;
  status: ApplicationStatus;
  leadScore: number;
  leadCategory: string;
}

export interface TrackingResponse {
  applicationNumber: string;
  fullName: string;
  status: ApplicationStatus;
  targetCourse: string;
  targetUniversity: string;
  loanAmountRequired: number;
  submittedAt: string;
  statusHistory: {
    status: string;
    date: string;
    reason: string;
  }[];
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

export const EDUCATION_LEVELS = [
  '10th / SSC',
  '12th / HSC',
  'Diploma',
  'Undergraduate (B.Tech, B.Sc, BA, etc.)',
  'Postgraduate (M.Tech, MBA, MSc, etc.)',
  'Doctorate (PhD)',
];
