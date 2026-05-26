import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Application } from '../applications/entities/application.entity';
import {
  DISPOSABLE_EMAIL_DOMAINS,
  MIN_FORM_COMPLETION_SECONDS,
  MAX_LOAN_THRESHOLDS,
  MIN_AGE,
  MAX_AGE,
} from './dead-lead.constants';

export interface DeadLeadFlag {
  rule: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface DeadLeadResult {
  isDead: boolean;
  flags: DeadLeadFlag[];
  flagCount: number;
  highConfidenceCount: number;
}

@Injectable()
export class DeadLeadService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
  ) {}

  /**
   * Run all dead lead detection rules against an application.
   * An application is considered "dead" if it has at least one HIGH confidence flag
   * or three or more MEDIUM confidence flags.
   */
  async detectDeadLead(
    application: Application,
    dto: { email: string; phone: string; panNumber: string; formStartTime?: string; formSubmitTime?: string },
  ): Promise<DeadLeadResult> {
    const flags: DeadLeadFlag[] = [];

    // ─── Rule 1: Disposable Email Domain ───
    const emailDomain = dto.email.split('@')[1]?.toLowerCase();
    if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
      flags.push({
        rule: 'DISPOSABLE_EMAIL',
        confidence: 'HIGH',
        description: `Email domain '${emailDomain}' is a known disposable email provider`,
      });
    }

    // ─── Rule 2: Invalid Email Pattern ───
    // Check for gibberish patterns like "asdfjkl@" or all-numeric local parts
    const emailLocal = dto.email.split('@')[0];
    if (this.isGibberishString(emailLocal)) {
      flags.push({
        rule: 'GIBBERISH_EMAIL',
        confidence: 'MEDIUM',
        description: 'Email local part appears to be random/gibberish characters',
      });
    }

    // ─── Rule 3: Invalid Phone Pattern ───
    // All same digits (e.g., 9999999999) or sequential (1234567890)
    if (this.isRepeatingDigits(dto.phone)) {
      flags.push({
        rule: 'INVALID_PHONE_PATTERN',
        confidence: 'HIGH',
        description: 'Phone number contains all repeating digits',
      });
    }

    // ─── Rule 4: Duplicate PAN Number ───
    const existingByPan = await this.applicationRepo.count({
      where: {
        panNumber: dto.panNumber,
        ...(application.id ? { id: Not(application.id) } : {}),
      },
    });
    if (existingByPan > 0) {
      flags.push({
        rule: 'DUPLICATE_PAN',
        confidence: 'HIGH',
        description: `PAN ${dto.panNumber} already exists in the system — possible duplicate submission`,
      });
    }

    // ─── Rule 5: Duplicate Email + Phone Combination ───
    const existingByContact = await this.applicationRepo.count({
      where: {
        email: dto.email,
        phone: dto.phone,
        ...(application.id ? { id: Not(application.id) } : {}),
      },
    });
    if (existingByContact > 0) {
      flags.push({
        rule: 'DUPLICATE_CONTACT',
        confidence: 'HIGH',
        description: 'An application with the same email and phone already exists',
      });
    }

    // ─── Rule 6: Age Ineligible ───
    const age = this.calculateAge(application.dateOfBirth);
    if (age < MIN_AGE) {
      flags.push({
        rule: 'UNDERAGE',
        confidence: 'HIGH',
        description: `Applicant is ${age} years old — minimum age is ${MIN_AGE}`,
      });
    }
    if (age > MAX_AGE) {
      flags.push({
        rule: 'OVERAGE',
        confidence: 'MEDIUM',
        description: `Applicant is ${age} years old — unusually old for an education loan`,
      });
    }

    // ─── Rule 7: Impossible Financial Data ───
    if (Number(application.annualFamilyIncome) <= 0) {
      flags.push({
        rule: 'ZERO_INCOME',
        confidence: 'MEDIUM',
        description: 'Annual family income reported as zero or negative',
      });
    }
    if (Number(application.loanAmountRequired) <= 0) {
      flags.push({
        rule: 'ZERO_LOAN',
        confidence: 'HIGH',
        description: 'Loan amount is zero or negative',
      });
    }

    // ─── Rule 8: Unreasonably High Loan Amount ───
    const educLevel = application.highestEducation?.toLowerCase() || 'default';
    const maxLoan =
      MAX_LOAN_THRESHOLDS[educLevel] || MAX_LOAN_THRESHOLDS['default'];
    if (Number(application.loanAmountRequired) > maxLoan) {
      flags.push({
        rule: 'EXCESSIVE_LOAN_AMOUNT',
        confidence: 'MEDIUM',
        description: `Loan amount ₹${Number(application.loanAmountRequired).toLocaleString('en-IN')} exceeds maximum threshold of ₹${maxLoan.toLocaleString('en-IN')} for ${application.highestEducation}`,
      });
    }

    // ─── Rule 9: Bot Detection (Form Speed) ───
    if (dto.formStartTime && dto.formSubmitTime) {
      const startTime = new Date(dto.formStartTime).getTime();
      const submitTime = new Date(dto.formSubmitTime).getTime();
      const durationSeconds = (submitTime - startTime) / 1000;
      if (durationSeconds < MIN_FORM_COMPLETION_SECONDS && durationSeconds > 0) {
        flags.push({
          rule: 'SUSPICIOUS_SPEED',
          confidence: 'MEDIUM',
          description: `Form completed in ${durationSeconds.toFixed(0)} seconds — minimum expected is ${MIN_FORM_COMPLETION_SECONDS}s`,
        });
      }
    }

    // ─── Rule 10: Gibberish Name ───
    if (this.isGibberishName(application.fullName)) {
      flags.push({
        rule: 'GIBBERISH_NAME',
        confidence: 'MEDIUM',
        description: 'Full name appears to contain gibberish or invalid characters',
      });
    }

    // ─── Rule 11: Mismatch Signals ───
    if (
      application.admissionStatus === 'CONFIRMED' &&
      (!application.targetUniversity || application.targetUniversity.length < 3)
    ) {
      flags.push({
        rule: 'ADMISSION_MISMATCH',
        confidence: 'MEDIUM',
        description:
          'Claims confirmed admission but no valid university name provided',
      });
    }

    // ─── Determine Overall Verdict ───
    const highConfidenceCount = flags.filter(
      (f) => f.confidence === 'HIGH',
    ).length;
    const mediumConfidenceCount = flags.filter(
      (f) => f.confidence === 'MEDIUM',
    ).length;
    const isDead = highConfidenceCount >= 1 || mediumConfidenceCount >= 3;

    return {
      isDead,
      flags,
      flagCount: flags.length,
      highConfidenceCount,
    };
  }

  // ─── Helper: Check for repeating digits like 9999999999 ───
  private isRepeatingDigits(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return /^(.)\1+$/.test(digits);
  }

  // ─── Helper: Detect gibberish strings ───
  private isGibberishString(str: string): boolean {
    if (!str || str.length < 3) return true;
    // Check for excessive consonant clusters (no vowels in 5+ chars)
    const vowelRatio =
      (str.match(/[aeiou]/gi)?.length || 0) / str.length;
    // Normal English/Hindi names have >15% vowels
    return vowelRatio < 0.1 && str.length > 5;
  }

  // ─── Helper: Detect gibberish names ───
  private isGibberishName(name: string): boolean {
    if (!name || name.length < 2) return true;
    // Name contains numbers
    if (/\d/.test(name)) return true;
    // Name is all special characters
    if (/^[^a-zA-Z\s]+$/.test(name)) return true;
    // Excessive special characters (more than 20% non-alpha)
    const nonAlpha = name.replace(/[a-zA-Z\s]/g, '').length;
    return nonAlpha / name.length > 0.2;
  }

  // ─── Helper: Calculate age from date of birth ───
  private calculateAge(dob: Date): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
