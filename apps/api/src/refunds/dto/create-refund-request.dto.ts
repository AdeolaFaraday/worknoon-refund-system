import { IsUUID, IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateRefundRequestDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @IsNumber()
  @Min(0.01)
  requestedAmount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
