import { Module } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { RefundAdminController } from './refund-admin.controller';
import { RefundAdminService } from './refund-admin.service';
import { PolicyModule } from '../policy/policy.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PolicyModule, AiModule],
  controllers: [RefundsController, RefundAdminController],
  providers: [RefundsService, RefundAdminService],
})
export class RefundsModule { }
