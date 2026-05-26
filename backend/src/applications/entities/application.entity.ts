import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  ApplicationStatus,
  AdmissionStatus,
  EmploymentType,
  LeadCategory,
} from '../../common/enums/application.enums';
import { StatusHistory } from './status-history.entity';
import { ApplicationDocument } from './document.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ─── Personal Details ───
  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 15 })
  phone: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 10 })
  panNumber: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  // ─── Academic Details ───
  @Column({ length: 50 })
  highestEducation: string;

  @Column({ length: 200, nullable: true })
  currentInstitution: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  lastGpaPercentage: number;

  @Column({ length: 200 })
  targetCourse: string;

  @Column({ length: 200 })
  targetUniversity: string;

  @Column({ type: 'smallint', nullable: true })
  universityTier: number;

  @Column({ type: 'enum', enum: AdmissionStatus })
  admissionStatus: AdmissionStatus;

  @Column({ length: 50, nullable: true })
  entranceExam: string;

  @Column({ length: 20, nullable: true })
  entranceScore: string;

  @Column({ type: 'smallint' })
  courseDurationYears: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  annualCourseFee: number;

  // ─── Financial Details ───
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  annualFamilyIncome: number;

  @Column({ type: 'enum', enum: EmploymentType })
  earnerEmploymentType: EmploymentType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  existingEmiAmount: number;

  @Column({ default: false })
  hasCoapplicant: boolean;

  @Column({ length: 30, nullable: true })
  coapplicantRelation: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  loanAmountRequired: number;

  @Column({ default: false })
  hasCollateral: boolean;

  // ─── Lead Scoring ───
  @Column({ type: 'smallint', nullable: true })
  leadScore: number;

  @Column({ type: 'enum', enum: LeadCategory, nullable: true })
  leadCategory: LeadCategory;

  @Column({ type: 'jsonb', nullable: true })
  scoreBreakdown: Record<string, unknown>;

  // ─── Dead Lead Detection ───
  @Column({ default: false })
  isDeadLead: boolean;

  @Column({ type: 'jsonb', nullable: true })
  deadLeadReasons: string[];

  // ─── Status & Meta ───
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @Column({ length: 20, unique: true })
  applicationNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  formStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  formSubmitTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Relations ───
  @OneToMany(() => StatusHistory, (history) => history.application, {
    cascade: true,
  })
  statusHistory: StatusHistory[];

  @OneToMany(() => ApplicationDocument, (doc) => doc.application, {
    cascade: true,
  })
  documents: ApplicationDocument[];
}
