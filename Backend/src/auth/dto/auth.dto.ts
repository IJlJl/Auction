import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некоректний email' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль мінімум 6 символів' })
  @MaxLength(64)
  password!: string;

  @IsString()
  @MinLength(2, { message: 'Нікнейм мінімум 2 символи' })
  @MaxLength(30, { message: 'Нікнейм максимум 30 символів' })
  nickname!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Некоректний email' })
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

