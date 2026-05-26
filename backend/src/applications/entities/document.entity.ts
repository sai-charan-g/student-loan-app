import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { DocumentType } from '../../common/enums/application.enums';

@Entity('application_documents')
export class ApplicationDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  applicationId: string;

  @Column({ type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ length: 255 })
  fileName: string;

  @Column({ length: 500 })
  filePath: string;

  @Column({ type: 'int', nullable: true })
  fileSizeBytes: number;

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => Application, (app) => app.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'applicationId' })
  application: Application;
}
