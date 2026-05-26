import {
  IsString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  Matches,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import {
  AdmissionStatus,
  EmploymentType,
} from '../../common/enums/application.enums';

export class CreateApplicationDto {
  // ─── Personal Details ───
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100)
  fullName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone must be a valid 10-digit Indian mobile number starting with 6-9',
  })
  phone: string;

  @IsDateString()
  dateOfBirth: string;

  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message:
      'PAN must be in valid format (e.g., ABCDE1234F). Use uppercase letters.',
  })
  panNumber: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  // ─── Academic Details ───
  @IsString()
  @MinLength(2)
  highestEducation: string;

  @IsString()
  @IsOptional()
  currentInstitution?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  lastGpaPercentage?: number;

  @IsString()
  @MinLength(2)
  targetCourse: string;

  @IsString()
  @MinLength(2)
  targetUniversity: string;

  @IsEnum(AdmissionStatus, {
    message:
      'Admission status must be one of: CONFIRMED, ACCEPTED, APPLIED, PLANNING',
  })
  admissionStatus: AdmissionStatus;

  @IsString()
  @IsOptional()
  entranceExam?: string;

  @IsString()
  @IsOptional()
  entranceScore?: string;

  @IsNumber()
  @Min(1)
  @Max(8)
  courseDurationYears: number;

  @IsNumber()
  @Min(10000, { message: 'Annual course fee must be at least ₹10,000' })
  @Max(10000000)
  annualCourseFee: number;

  // ─── Financial Details ───
  @IsNumber()
  @Min(0)
  annualFamilyIncome: number;

  @IsEnum(EmploymentType, {
    message:
      'Employment type must be one of: SALARIED, SELF_EMPLOYED, BUSINESS, RETIRED, OTHER',
  })
  earnerEmploymentType: EmploymentType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  existingEmiAmount?: number;

  @IsBoolean()
  hasCoapplicant: boolean;

  @IsString()
  @IsOptional()
  coapplicantRelation?: string;

  @IsNumber()
  @Min(50000, { message: 'Loan amount must be at least ₹50,000' })
  @Max(30000000, { message: 'Loan amount cannot exceed ₹3,00,00,000' })
  loanAmountRequired: number;

  @IsBoolean()
  @IsOptional()
  hasCollateral?: boolean;

  // ─── Meta (for bot detection) ───
  @IsOptional()
  @IsDateString()
  formStartTime?: string;

  @IsOptional()
  @IsDateString()
  formSubmitTime?: string;
}
