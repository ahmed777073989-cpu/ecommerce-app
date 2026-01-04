import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  nameEn: string;

  @IsString()
  nameAr: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
