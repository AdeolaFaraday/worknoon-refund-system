import { Controller, Post, Body } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';

@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  create(@Body() createRefundRequestDto: CreateRefundRequestDto) {
    return this.refundsService.createRefundRequest(createRefundRequestDto);
  }
}
