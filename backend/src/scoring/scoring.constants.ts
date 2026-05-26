/**
 * Lead Scoring Constants
 *
 * These weights determine how each factor contributes to the overall lead quality score.
 * The total maximum score is 100 points across all dimensions.
 *
 * Why these weights?
 * - Admission status (25 pts): The #1 real-world conversion predictor.
 *   A student with a confirmed admission letter is ~5x more likely to actually take the loan.
 * - University tier (15 pts): Higher-tier institutions indicate better loan repayment outcomes
 *   and the loan company can partner with these institutions for faster processing.
 * - Academic performance (15 pts): Correlates with course completion rate and career prospects.
 * - Income eligibility (15 pts): Directly determines repayment capacity.
 * - Co-applicant (10 pts): Most lenders require a co-applicant; having one speeds up approval.
 * - Document completeness (10 pts): Complete docs = faster processing = higher conversion.
 * - Loan reasonableness (5 pts): Loan amount vs fee sanity check.
 * - Profile completeness (5 pts): More data = better risk assessment.
 */

// ─── Admission Status Scores ───
export const ADMISSION_SCORES: Record<string, number> = {
  CONFIRMED: 25,
  ACCEPTED: 20,
  APPLIED: 12,
  PLANNING: 5,
};

// ─── University Tier Scores ───
export const UNIVERSITY_TIER_SCORES: Record<number, number> = {
  1: 15, // IITs, IIMs, AIIMS, top global universities
  2: 10, // NITs, IIITs, well-known state universities
  3: 5, // Average private/state universities
  4: 2, // Unrecognized or new institutions
};

// ─── Academic Performance Thresholds ───
export const ACADEMIC_SCORE_BRACKETS = [
  { min: 80, max: 100, score: 15 },
  { min: 70, max: 79.99, score: 12 },
  { min: 60, max: 69.99, score: 8 },
  { min: 0, max: 59.99, score: 4 },
];

// ─── Income-to-Loan Ratio Brackets ───
// Ratio = loanAmountRequired / annualFamilyIncome
// Lower ratio = family can more easily support repayment
export const INCOME_RATIO_BRACKETS = [
  { maxRatio: 3, score: 15 }, // Loan is less than 3x income — very comfortable
  { maxRatio: 5, score: 10 }, // Moderate stretch
  { maxRatio: 8, score: 6 }, // Significant stretch
  { maxRatio: Infinity, score: 2 }, // High risk
];

// ─── Co-applicant Scores ───
export const COAPPLICANT_SCORES = {
  available: 10,
  unavailable: 3,
};

// ─── Document Completeness ───
export const DOCUMENT_SCORES = {
  all: 10, // All document types uploaded
  partial: 5, // At least one document
  none: 1, // No documents at all
};

// ─── Loan-to-Fee Reasonableness ───
// Ratio = loanAmountRequired / (annualCourseFee * courseDurationYears)
export const LOAN_FEE_RATIO_BRACKETS = [
  { maxRatio: 1.2, score: 5 }, // Loan covers fees with small buffer — reasonable
  { maxRatio: 1.5, score: 3 }, // Loan covers fees + living expenses
  { maxRatio: Infinity, score: 1 }, // Loan significantly exceeds fees — suspicious
];

// ─── Profile Completeness ───
export const PROFILE_COMPLETENESS_BRACKETS = [
  { minPercentage: 100, score: 5 },
  { minPercentage: 80, score: 3 },
  { minPercentage: 0, score: 1 },
];

// ─── Lead Category Thresholds ───
export const CATEGORY_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
  LOW: 20,
  // Anything below 20 is DEAD
};

// ─── Tier-1 University Keywords ───
// Used for auto-detection when universityTier is not explicitly provided
export const TIER_1_KEYWORDS = [
  'iit',
  'iim',
  'aiims',
  'nlu',
  'isi',
  'bits pilani',
  'harvard',
  'stanford',
  'mit',
  'oxford',
  'cambridge',
  'caltech',
  'princeton',
  'yale',
  'columbia',
  'chicago',
  'upenn',
  'duke',
  'johns hopkins',
  'cornell',
  'nyu',
  'ucl',
  'imperial college',
  'eth zurich',
  'university of toronto',
  'melbourne',
  'nus',
  'ntu singapore',
];

export const TIER_2_KEYWORDS = [
  'nit',
  'iiit',
  'iisc',
  'vit',
  'srm',
  'manipal',
  'thapar',
  'delhi university',
  'jadavpur',
  'bhu',
  'anna university',
  'psg',
  'coep',
  'nsit',
  'dtu',
  'rvce',
  'pesit',
  'bmsce',
  'msrit',
  'mit manipal',
];
