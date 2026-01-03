import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { AccessCodesService } from './access-codes.service';
import { GenerateCodesDto } from './dto/generate-codes.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/admin/access-codes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccessCodesController {
  constructor(private accessCodesService: AccessCodesService) {}

  @Post('generate')
  @Roles('super_admin', 'admin')
  generateCodes(@CurrentUser() user: any, @Body() generateCodesDto: GenerateCodesDto) {
    return this.accessCodesService.generateCodes(user.id, generateCodesDto);
  }

  @Get()
  @Roles('super_admin', 'admin')
  listCodes(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.accessCodesService.listCodes(page, limit);
  }
}
