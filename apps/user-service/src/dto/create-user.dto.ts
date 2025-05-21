import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  country: string;

  @ApiProperty()
  @IsString()
  userRole: string;
}