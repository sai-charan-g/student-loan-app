import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { StatusHistory } from './entities/status-history.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ScoringService } from '../scoring/scoring.service';
import { DeadLeadService } from '../dead-lead/dead-lead.service';
import { ApplicationStatus } from '../common/enums/application.enums';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(StatusHistory)
    private readonly statusHistoryRepo: Repository<StatusHistory>,
    private readonly scoringService: ScoringService,
    private readonly deadLeadService: DeadLeadService,
  ) {}

  /**
   * Submit a new loan application.
   *
   * Flow:
   * 1. Generate a human-readable application number
   * 2. Save the application
   * 3. Run dead lead detection
   * 4. Run lead scoring
   * 5. Update application with score and flags
   * 6. Record status history
   */
  async create(dto: CreateApplicationDto): Promise<Application> {
    // Generate application number: EL-2026-XXXXX
    const applicationNumber = await this.generateApplicationNumber();

    // Create the application entity
    const application = this.applicationRepo.create({
      ...dto,
      applicationNumber,
      status: ApplicationStatus.SUBMITTED,
      formStartTime: dto.formStartTime ? new Date(dto.formStartTime) : undefined,
      formSubmitTime: dto.formSubmitTime
        ? new Date(dto.formSubmitTime)
        : new Date(),
    });

    // Save first (we need the ID, and dead lead service checks for duplicates)
    const saved = await this.applicationRepo.save(application);

    // Run dead lead detection
    const deadLeadResult = await this.deadLeadService.detectDeadLead(saved, {
      email: dto.email,
      phone: dto.phone,
      panNumber: dto.panNumber,
      formStartTime: dto.formStartTime,
      formSubmitTime: dto.formSubmitTime,
    });

    // Run lead scoring
    const scoringResult = this.scoringService.calculateScore(saved, 0);

    // Update with scoring and dead lead results
    saved.leadScore = scoringResult.totalScore;
    saved.leadCategory = scoringResult.category;
    saved.scoreBreakdown = {
      breakdown: scoringResult.breakdown,
      recommendation: scoringResult.recommendation,
    };
    saved.isDeadLead = deadLeadResult.isDead;
    saved.deadLeadReasons = deadLeadResult.flags.map(
      (f) => `[${f.confidence}] ${f.rule}: ${f.description}`,
    );

    // If dead lead, set status to UNDER_REVIEW instead of showing rejection
    if (deadLeadResult.isDead) {
      saved.status = ApplicationStatus.UNDER_REVIEW;
    } else {
      saved.status = ApplicationStatus.SCORING_COMPLETE;
    }

    await this.applicationRepo.save(saved);

    // Record initial status history
    await this.statusHistoryRepo.save({
      applicationId: saved.id,
      fromStatus: undefined,
      toStatus: ApplicationStatus.SUBMITTED,
      changedBy: 'SYSTEM',
      reason: 'Application submitted',
    });

    // Record scoring status
    await this.statusHistoryRepo.save({
      applicationId: saved.id,
      fromStatus: ApplicationStatus.SUBMITTED,
      toStatus: saved.status,
      changedBy: 'SYSTEM',
      reason: deadLeadResult.isDead
        ? `Flagged for review: ${deadLeadResult.flagCount} issues detected`
        : `Lead scored: ${scoringResult.totalScore}/100 (${scoringResult.category})`,
    });

    return saved;
  }

  /**
   * Get a single application by UUID.
   */
  async findById(id: string): Promise<Application> {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: { statusHistory: true, documents: true },
    });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  /**
   * Track application by human-readable application number.
   * This is what the student sees and uses to check their status.
   */
  async findByApplicationNumber(appNumber: string): Promise<Application> {
    const application = await this.applicationRepo.findOne({
      where: { applicationNumber: appNumber },
      relations: { statusHistory: true },
    });
    if (!application) {
      throw new NotFoundException(
        `Application ${appNumber} not found. Please check the number and try again.`,
      );
    }
    return application;
  }

  /**
   * Update application status (admin action).
   * Records the change in status history for audit trail.
   */
  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
  ): Promise<Application> {
    const application = await this.findById(id);
    const previousStatus = application.status;

    application.status = dto.status;
    await this.applicationRepo.save(application);

    // Record status change
    await this.statusHistoryRepo.save({
      applicationId: id,
      fromStatus: previousStatus,
      toStatus: dto.status,
      changedBy: dto.changedBy || 'ADMIN',
      reason: dto.reason || `Status changed from ${previousStatus} to ${dto.status}`,
    });

    return this.findById(id);
  }

  /**
   * List all applications with pagination and optional filters.
   */
  async findAll(options: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
    leadCategory?: string;
    isDeadLead?: boolean;
    search?: string;
  }): Promise<{ data: Application[]; total: number; page: number; limit: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;

    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .orderBy('app.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (options.status) {
      qb.andWhere('app.status = :status', { status: options.status });
    }
    if (options.leadCategory) {
      qb.andWhere('app.leadCategory = :category', {
        category: options.leadCategory,
      });
    }
    if (options.isDeadLead !== undefined) {
      qb.andWhere('app.isDeadLead = :isDead', {
        isDead: options.isDeadLead,
      });
    }
    if (options.search) {
      qb.andWhere(
        '(app.fullName ILIKE :search OR app.email ILIKE :search OR app.applicationNumber ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * Get dashboard statistics for the admin panel.
   */
  async getDashboardStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    deadLeads: number;
    avgScore: number;
    recentApplications: Application[];
  }> {
    const total = await this.applicationRepo.count();
    const deadLeads = await this.applicationRepo.count({
      where: { isDeadLead: true },
    });

    // Count by status
    const statusCounts = await this.applicationRepo
      .createQueryBuilder('app')
      .select('app.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.status')
      .getRawMany();

    const byStatus: Record<string, number> = {};
    statusCounts.forEach(
      (row: { status: string; count: string }) =>
        (byStatus[row.status] = parseInt(row.count)),
    );

    // Count by lead category
    const categoryCounts = await this.applicationRepo
      .createQueryBuilder('app')
      .select('app.leadCategory', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('app.leadCategory')
      .getRawMany();

    const byCategory: Record<string, number> = {};
    categoryCounts.forEach(
      (row: { category: string; count: string }) =>
        (byCategory[row.category] = parseInt(row.count)),
    );

    // Average score
    const avgResult = await this.applicationRepo
      .createQueryBuilder('app')
      .select('AVG(app.leadScore)', 'avg')
      .where('app.leadScore IS NOT NULL')
      .getRawOne();

    const avgScore = Math.round(parseFloat(avgResult?.avg || '0'));

    // Recent applications
    const recentApplications = await this.applicationRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      total,
      byStatus,
      byCategory,
      deadLeads,
      avgScore,
      recentApplications,
    };
  }

  /**
   * Generate a unique, human-readable application number.
   * Format: EL-YYYY-XXXXX (e.g., EL-2026-00042)
   */
  private async generateApplicationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `EL-${year}-`;

    // Find the latest application number for this year
    const latest = await this.applicationRepo
      .createQueryBuilder('app')
      .where('app.applicationNumber LIKE :prefix', {
        prefix: `${prefix}%`,
      })
      .orderBy('app.applicationNumber', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (latest) {
      const currentNumber = parseInt(
        latest.applicationNumber.replace(prefix, ''),
        10,
      );
      nextNumber = currentNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }
}
