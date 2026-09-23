import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefundAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const statuses = await this.prisma.refundRequest.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const counts = statuses.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    const total = await this.prisma.refundRequest.count();

    return {
      APPROVED: counts['APPROVED'] || 0,
      DENIED: counts['DENIED'] || 0,
      ESCALATED: counts['ESCALATED'] || 0,
      PENDING: counts['PENDING'] || 0,
      total,
    };
  }

  async findAll(page: number, limit: number, search?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      const q = { contains: search, mode: 'insensitive' };
      where.OR = [
        { customer: { name: q } },
        { customer: { email: q } },
        { order: { orderNumber: q } },
        { reason: q },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.refundRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          order: { select: { id: true, orderNumber: true, totalAmount: true, status: true } },
        },
      }),
      this.prisma.refundRequest.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
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
