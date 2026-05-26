import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { ApplicationsModule } from './applications/applications.module';
import { ScoringModule } from './scoring/scoring.module';
import { DeadLeadModule } from './dead-lead/dead-lead.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    ApplicationsModule,
    ScoringModule,
    DeadLeadModule,
  ],
})
export class AppModule {}
