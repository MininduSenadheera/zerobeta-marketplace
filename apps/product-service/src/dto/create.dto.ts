import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, MaxLength, IsUUID } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  code: string;

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

  @ApiProperty()
  @IsUUID()
  sellerId: string;
}
