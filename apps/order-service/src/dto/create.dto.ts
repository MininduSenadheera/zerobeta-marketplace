import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, IsArray, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { ShippingMethodTypes } from 'src/enums/order.enums';

export class OrderProductDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  buyerId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty({ type: [OrderProductDto] })
  @IsArray()
  productQuantities: OrderProductDto[];

  @ApiProperty()
  @IsEnum(ShippingMethodTypes)
  shipping: ShippingMethodTypes;

  @ApiProperty()
  @IsNumber()
  shippingCost: number;
}