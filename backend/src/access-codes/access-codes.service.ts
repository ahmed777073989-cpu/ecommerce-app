import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessCode, AuditLog } from '../database/entities';
import { GenerateCodesDto } from './dto/generate-codes.dto';

@Injectable()
export class AccessCodesService {
  constructor(
    @InjectRepository(AccessCode)
    private accessCodeRepository: Repository<AccessCode>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async generateCodes(adminId: string, generateCodesDto: GenerateCodesDto) {
    const { role, validDays, usesAllowed, count = 1, note } = generateCodesDto;

    const codes = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const code = this.generateUniqueCode();
      const validFrom = now;
      const validUntil = new Date(now);
      validUntil.setDate(validUntil.getDate() + validDays);

      const accessCode = this.accessCodeRepository.create({
        code,
        role,
        validFrom,
        validUntil,
        usesAllowed,
        usesCount: 0,
        isUsed: false,
        issuedBy: adminId,
        note: note || `${role} access code`,
      });

      codes.push(accessCode);
    }

    await this.accessCodeRepository.save(codes);

    await this.auditLogRepository.save({
      adminId,
      action: 'GENERATE_ACCESS_CODES',
      resourceType: 'access_code',
      resourceId: null,
      oldValue: null,
      newValue: {
        count: codes.length,
        role,
        validDays,
        usesAllowed,
      },
    });

    return {
      success: true,
      message: `Generated ${codes.length} access code(s)`,
      data: codes.map(code => ({
        id: code.id,
        code: code.code,
        role: code.role,
        validFrom: code.validFrom,
        validUntil: code.validUntil,
        usesAllowed: code.usesAllowed,
        note: code.note,
      })),
    };
  }

  async listCodes(page: number = 1, limit: number = 50) {
    const [codes, total] = await this.accessCodeRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: codes.map(code => ({
        id: code.id,
        code: code.code,
        role: code.role,
        validFrom: code.validFrom,
        validUntil: code.validUntil,
        usesAllowed: code.usesAllowed,
        usesCount: code.usesCount,
        isUsed: code.isUsed,
        note: code.note,
        createdAt: code.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
