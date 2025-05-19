import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString, IsUUID } from "class-validator";

export class ProductQuantityDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class updateStockDto {
  @ApiProperty()
  @IsString()
  type: 'decrease' | 'increase';

  @ApiProperty({ type: [ProductQuantityDto] })
  @IsArray()
  items: ProductQuantityDto[];
}