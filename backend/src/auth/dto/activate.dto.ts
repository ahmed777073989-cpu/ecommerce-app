import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class ActivateDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'Access code must be exactly 8 characters' })
  @Matches(/^[A-Z0-9]{8}$/i, {
    message: 'Access code must contain only letters and numbers',
  })
  accessCode: string;
}
