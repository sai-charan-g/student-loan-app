import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApplicationStatus } from '../../common/enums/application.enums';

export class UpdateStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  changedBy?: string;
}
