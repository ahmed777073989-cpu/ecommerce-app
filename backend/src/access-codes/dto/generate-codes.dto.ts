import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsIn } from 'class-validator';

export class GenerateCodesDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['super_admin', 'admin', 'user'])
  role: string;

  @IsInt()
  @Min(1)
  @Max(3650)
  validDays: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  usesAllowed: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  count?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
