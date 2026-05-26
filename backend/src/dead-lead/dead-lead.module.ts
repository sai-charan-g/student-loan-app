import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeadLeadService } from './dead-lead.service';
import { Application } from '../applications/entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  providers: [DeadLeadService],
  exports: [DeadLeadService],
})
export class DeadLeadModule {}
