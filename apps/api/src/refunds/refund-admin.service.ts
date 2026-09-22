import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefundAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.refundRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, orderNumber: true, totalAmount: true, status: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.refundRequest.findUnique({
      where: { id },
      include: {
        customer: true,
        order: {
          include: { orderItems: true },
        },
        auditLogs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
