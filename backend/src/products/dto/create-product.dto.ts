import { IsString, IsNumber, IsArray, IsBoolean, IsDateString, IsOptional, Min, Max, ArrayNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  fullDescription?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  categoryId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsNumber()
  @Min(0)
  stockCount: number;

  @IsBoolean()
  available: boolean;

  @IsDateString()
  @IsOptional()
  expiryTimer?: string;
}
