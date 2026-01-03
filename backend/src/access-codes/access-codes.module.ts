import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessCodesController } from './access-codes.controller';
import { AccessCodesService } from './access-codes.service';
import { AccessCode, AuditLog } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([AccessCode, AuditLog])],
  controllers: [AccessCodesController],
  providers: [AccessCodesService],
})
export class AccessCodesModule {}
