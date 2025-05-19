import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, MaxLength } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @MaxLength(100)
  @IsString()
  description: string;

  @ApiProperty()
  @IsString({ each: true })
  images: string[];

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  stock: number;
}