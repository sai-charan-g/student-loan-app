import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { StatusHistory } from './entities/status-history.entity';
import { ApplicationDocument } from './entities/document.entity';
import { ScoringModule } from '../scoring/scoring.module';
import { DeadLeadModule } from '../dead-lead/dead-lead.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, StatusHistory, ApplicationDocument]),
    ScoringModule,
    DeadLeadModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
