import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApplicationStatus } from '../common/enums/application.enums';

@Controller('api')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * GET /api/health
   * Health check endpoint for deployment monitoring.
   */
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'EduFund API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * POST /api/applications
   * Submit a new loan application.
   */
  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateApplicationDto) {
    const application = await this.applicationsService.create(dto);
    return {
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        leadScore: application.leadScore,
        leadCategory: application.leadCategory,
      },
    };
  }

  /**
   * GET /api/applications/track/:appNumber
   * Track application status by human-readable number (student-facing).
   * Returns limited data — no internal scoring or dead lead flags.
   */
  @Get('applications/track/:appNumber')
  async track(@Param('appNumber') appNumber: string) {
    const application =
      await this.applicationsService.findByApplicationNumber(appNumber);

    // Return only what the student should see — no internal scoring details
    return {
      success: true,
      data: {
        applicationNumber: application.applicationNumber,
        fullName: application.fullName,
        status: application.status,
        targetCourse: application.targetCourse,
        targetUniversity: application.targetUniversity,
        loanAmountRequired: application.loanAmountRequired,
        submittedAt: application.createdAt,
        statusHistory: application.statusHistory?.map((h) => ({
          status: h.toStatus,
          date: h.createdAt,
          reason:
            h.changedBy === 'SYSTEM'
              ? this.getStudentFriendlyReason(h.toStatus)
              : h.reason,
        })),
      },
    };
  }

  /**
   * GET /api/applications/:id/score
   * Get detailed score breakdown for an application (admin-facing).
   */
  @Get('applications/:id/score')
  async getScore(@Param('id', ParseUUIDPipe) id: string) {
    const application = await this.applicationsService.findById(id);
    return {
      success: true,
      data: {
        leadScore: application.leadScore,
        leadCategory: application.leadCategory,
        scoreBreakdown: application.scoreBreakdown,
        isDeadLead: application.isDeadLead,
        deadLeadReasons: application.deadLeadReasons,
      },
    };
  }

  /**
   * GET /api/applications/:id
   * Get full application details by UUID.
   */
  @Get('applications/:id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const application = await this.applicationsService.findById(id);
    return { success: true, data: application };
  }

  /**
   * PATCH /api/applications/:id/status
   * Update application status (admin action).
   */
  @Patch('applications/:id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const application = await this.applicationsService.updateStatus(id, dto);
    return {
      success: true,
      message: `Status updated to ${dto.status}`,
      data: {
        id: application.id,
        status: application.status,
      },
    };
  }

  // ─── Admin Endpoints ───

  /**
   * GET /api/admin/applications
   * List all applications with pagination and filters.
   */
  @Get('admin/applications')
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ApplicationStatus,
    @Query('leadCategory') leadCategory?: string,
    @Query('isDeadLead') isDeadLead?: string,
    @Query('search') search?: string,
  ) {
    return this.applicationsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      leadCategory,
      isDeadLead: isDeadLead !== undefined ? isDeadLead === 'true' : undefined,
      search,
    });
  }

  /**
   * GET /api/admin/dashboard/stats
   * Dashboard overview statistics.
   */
  @Get('admin/dashboard/stats')
  async getDashboardStats() {
    const stats = await this.applicationsService.getDashboardStats();
    return { success: true, data: stats };
  }

  /**
   * GET /api/admin/dead-leads
   * List all flagged dead leads.
   */
  @Get('admin/dead-leads')
  async getDeadLeads(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.applicationsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      isDeadLead: true,
    });
  }

  /**
   * Translate internal status codes to student-friendly messages.
   * We never expose internal scoring language to students.
   */
  private getStudentFriendlyReason(status: string): string {
    const messages: Record<string, string> = {
      SUBMITTED: 'Your application has been received',
      UNDER_REVIEW: 'Your application is being reviewed by our team',
      SCORING_COMPLETE: 'Initial assessment complete — processing your application',
      NEEDS_INFO: 'We need some additional information from you',
      APPROVED: 'Congratulations! Your loan has been approved',
      REJECTED: 'We are unable to process your application at this time',
      DISBURSED: 'Your loan amount has been disbursed',
    };
    return messages[status] || 'Application status updated';
  }
}
