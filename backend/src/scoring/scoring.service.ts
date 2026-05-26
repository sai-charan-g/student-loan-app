import { Injectable } from '@nestjs/common';
import { Application } from '../applications/entities/application.entity';
import { LeadCategory } from '../common/enums/application.enums';
import {
  ADMISSION_SCORES,
  UNIVERSITY_TIER_SCORES,
  ACADEMIC_SCORE_BRACKETS,
  INCOME_RATIO_BRACKETS,
  COAPPLICANT_SCORES,
  DOCUMENT_SCORES,
  LOAN_FEE_RATIO_BRACKETS,
  PROFILE_COMPLETENESS_BRACKETS,
  CATEGORY_THRESHOLDS,
  TIER_1_KEYWORDS,
  TIER_2_KEYWORDS,
} from './scoring.constants';

export interface ScoreBreakdownItem {
  factor: string;
  score: number;
  maxScore: number;
  explanation: string;
  status: 'positive' | 'neutral' | 'negative';
}

export interface ScoringResult {
  totalScore: number;
  category: LeadCategory;
  breakdown: ScoreBreakdownItem[];
  recommendation: string;
}

@Injectable()
export class ScoringService {
  /**
   * Calculate the lead quality score for a given application.
   * Returns a total score (0–100), a category, and a human-readable breakdown
   * explaining why the lead was scored this way.
   */
  calculateScore(application: Application, documentCount: number): ScoringResult {
    const breakdown: ScoreBreakdownItem[] = [];

    // 1. Admission Status (25 pts max)
    const admissionScore =
      ADMISSION_SCORES[application.admissionStatus] || 0;
    breakdown.push({
      factor: 'Admission Status',
      score: admissionScore,
      maxScore: 25,
      explanation: this.getAdmissionExplanation(
        application.admissionStatus,
        admissionScore,
      ),
      status: admissionScore >= 20 ? 'positive' : admissionScore >= 12 ? 'neutral' : 'negative',
    });

    // 2. University Tier (15 pts max)
    const tier = application.universityTier || this.detectUniversityTier(application.targetUniversity);
    const universityScore = UNIVERSITY_TIER_SCORES[tier] || 2;
    breakdown.push({
      factor: 'University Quality',
      score: universityScore,
      maxScore: 15,
      explanation: `${application.targetUniversity} classified as Tier-${tier} institution`,
      status: universityScore >= 10 ? 'positive' : universityScore >= 5 ? 'neutral' : 'negative',
    });

    // 3. Academic Performance (15 pts max)
    const gpa = application.lastGpaPercentage || 0;
    const academicBracket = ACADEMIC_SCORE_BRACKETS.find(
      (b) => gpa >= b.min && gpa <= b.max,
    );
    const academicScore = academicBracket?.score || 4;
    breakdown.push({
      factor: 'Academic Performance',
      score: academicScore,
      maxScore: 15,
      explanation: gpa > 0
        ? `Academic score of ${gpa}% — ${gpa >= 80 ? 'excellent' : gpa >= 70 ? 'good' : gpa >= 60 ? 'average' : 'below average'}`
        : 'No academic score provided',
      status: academicScore >= 12 ? 'positive' : academicScore >= 8 ? 'neutral' : 'negative',
    });

    // 4. Income Eligibility (15 pts max)
    const income = Number(application.annualFamilyIncome) || 0;
    const loanAmount = Number(application.loanAmountRequired) || 1;
    const incomeRatio = income > 0 ? loanAmount / income : Infinity;
    const incomeBracket = INCOME_RATIO_BRACKETS.find(
      (b) => incomeRatio <= b.maxRatio,
    );
    const incomeScore = incomeBracket?.score || 2;
    breakdown.push({
      factor: 'Income Eligibility',
      score: incomeScore,
      maxScore: 15,
      explanation: income > 0
        ? `Loan-to-income ratio: ${incomeRatio.toFixed(1)}x — ${incomeRatio <= 3 ? 'very comfortable' : incomeRatio <= 5 ? 'manageable' : incomeRatio <= 8 ? 'stretched' : 'high risk'}`
        : 'No income information provided',
      status: incomeScore >= 10 ? 'positive' : incomeScore >= 6 ? 'neutral' : 'negative',
    });

    // 5. Co-applicant Availability (10 pts max)
    const coapplicantScore = application.hasCoapplicant
      ? COAPPLICANT_SCORES.available
      : COAPPLICANT_SCORES.unavailable;
    breakdown.push({
      factor: 'Co-applicant',
      score: coapplicantScore,
      maxScore: 10,
      explanation: application.hasCoapplicant
        ? `Co-applicant available (${application.coapplicantRelation || 'relationship not specified'})`
        : 'No co-applicant — most lenders require one for education loans',
      status: application.hasCoapplicant ? 'positive' : 'negative',
    });

    // 6. Document Completeness (10 pts max)
    let docScore: number;
    if (documentCount >= 4) {
      docScore = DOCUMENT_SCORES.all;
    } else if (documentCount >= 1) {
      docScore = DOCUMENT_SCORES.partial;
    } else {
      docScore = DOCUMENT_SCORES.none;
    }
    breakdown.push({
      factor: 'Document Completeness',
      score: docScore,
      maxScore: 10,
      explanation:
        documentCount >= 4
          ? 'All required documents uploaded'
          : documentCount >= 1
            ? `${documentCount} of 4 documents uploaded — application will need more docs for processing`
            : 'No documents uploaded yet',
      status: documentCount >= 4 ? 'positive' : documentCount >= 1 ? 'neutral' : 'negative',
    });

    // 7. Loan-to-Fee Reasonableness (5 pts max)
    const totalFee =
      Number(application.annualCourseFee) * application.courseDurationYears;
    const loanFeeRatio = totalFee > 0 ? loanAmount / totalFee : Infinity;
    const loanFeeBracket = LOAN_FEE_RATIO_BRACKETS.find(
      (b) => loanFeeRatio <= b.maxRatio,
    );
    const loanFeeScore = loanFeeBracket?.score || 1;
    breakdown.push({
      factor: 'Loan Amount Reasonableness',
      score: loanFeeScore,
      maxScore: 5,
      explanation: `Requesting ₹${loanAmount.toLocaleString('en-IN')} against total fee of ₹${totalFee.toLocaleString('en-IN')} (${(loanFeeRatio * 100).toFixed(0)}% of fee)`,
      status: loanFeeScore >= 5 ? 'positive' : loanFeeScore >= 3 ? 'neutral' : 'negative',
    });

    // 8. Profile Completeness (5 pts max)
    const completeness = this.calculateProfileCompleteness(application);
    const completeBracket = PROFILE_COMPLETENESS_BRACKETS.find(
      (b) => completeness >= b.minPercentage,
    );
    const profileScore = completeBracket?.score || 1;
    breakdown.push({
      factor: 'Profile Completeness',
      score: profileScore,
      maxScore: 5,
      explanation: `${completeness}% of optional fields filled`,
      status: completeness >= 100 ? 'positive' : completeness >= 80 ? 'neutral' : 'negative',
    });

    // ─── Calculate Total & Category ───
    const totalScore = breakdown.reduce((sum, item) => sum + item.score, 0);
    const category = this.determineCategory(totalScore);
    const recommendation = this.generateRecommendation(category, breakdown);

    return {
      totalScore,
      category,
      breakdown,
      recommendation,
    };
  }

  /**
   * Auto-detect university tier from name using keyword matching.
   * This is a heuristic — in production, you'd use a curated university database.
   */
  private detectUniversityTier(universityName: string): number {
    const lower = universityName.toLowerCase();
    if (TIER_1_KEYWORDS.some((kw) => lower.includes(kw))) return 1;
    if (TIER_2_KEYWORDS.some((kw) => lower.includes(kw))) return 2;
    return 3; // Default to Tier 3 for unknown
  }

  private getAdmissionExplanation(
    status: string,
    score: number,
  ): string {
    const messages: Record<string, string> = {
      CONFIRMED: 'Admission confirmed — highest conversion probability',
      ACCEPTED: 'Offer accepted but not yet confirmed — strong lead',
      APPLIED: 'Application submitted to university — moderate probability',
      PLANNING: 'Still planning — early stage, lower conversion likelihood',
    };
    return messages[status] || `Admission status: ${status} (score: ${score})`;
  }

  private determineCategory(totalScore: number): LeadCategory {
    if (totalScore >= CATEGORY_THRESHOLDS.HIGH) return LeadCategory.HIGH;
    if (totalScore >= CATEGORY_THRESHOLDS.MEDIUM) return LeadCategory.MEDIUM;
    if (totalScore >= CATEGORY_THRESHOLDS.LOW) return LeadCategory.LOW;
    return LeadCategory.DEAD;
  }

  private generateRecommendation(
    category: LeadCategory,
    breakdown: ScoreBreakdownItem[],
  ): string {
    const negatives = breakdown.filter((b) => b.status === 'negative');
    const positives = breakdown.filter((b) => b.status === 'positive');

    switch (category) {
      case LeadCategory.HIGH:
        return `Strong application. ${positives.length} of ${breakdown.length} factors are positive. Recommend immediate processing and loan officer assignment.`;
      case LeadCategory.MEDIUM:
        return `Decent application with improvement areas. ${negatives.length > 0 ? `Follow up on: ${negatives.map((n) => n.factor).join(', ')}.` : 'Consider for standard processing queue.'}`;
      case LeadCategory.LOW:
        return `Weak application. Key concerns: ${negatives.map((n) => n.factor).join(', ')}. Place in nurture queue with automated follow-up.`;
      case LeadCategory.DEAD:
        return `Very low quality or potentially invalid application. Review manually before investing processing time.`;
    }
  }

  /**
   * Calculate what percentage of optional profile fields are filled.
   */
  private calculateProfileCompleteness(application: Application): number {
    const optionalFields = [
      application.city,
      application.state,
      application.currentInstitution,
      application.lastGpaPercentage,
      application.entranceExam,
      application.entranceScore,
      application.coapplicantRelation,
    ];
    const filled = optionalFields.filter(
      (f) => f !== null && f !== undefined && f !== '',
    ).length;
    return Math.round((filled / optionalFields.length) * 100);
  }
}
