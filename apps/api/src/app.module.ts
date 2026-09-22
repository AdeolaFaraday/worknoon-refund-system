import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { RefundsModule } from './refunds/refunds.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [PrismaModule, CustomersModule, OrdersModule, RefundsModule, AuditModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
