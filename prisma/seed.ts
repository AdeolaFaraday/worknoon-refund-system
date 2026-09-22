import { PrismaClient, OrderStatus, RefundStatus, ActorType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create a customer for each scenario to keep them isolated
  const customerA = await prisma.customer.create({
    data: { name: 'Alice Smith', email: 'alice@example.com' },
  });
  const customerB = await prisma.customer.create({
    data: { name: 'Bob Jones', email: 'bob@example.com' },
  });
  const customerC = await prisma.customer.create({
    data: { name: 'Charlie Brown', email: 'charlie@example.com' },
  });
  const customerD = await prisma.customer.create({
    data: { name: 'Diana Prince', email: 'diana@example.com' },
  });
  const customerE = await prisma.customer.create({
    data: { name: 'Eve Adams', email: 'eve@example.com' },
  });
  const customerF = await prisma.customer.create({
    data: { name: 'Frank White', email: 'frank@example.com' },
  });

  // Scenario A: Valid damaged item (Recent, not final sale, < $500)
  const orderA = await prisma.order.create({
    data: {
      orderNumber: 'ORD-A-1001',
      customerId: customerA.id,
      orderDate: new Date(), // recent
      totalAmount: 120.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [
          { productName: 'Wireless Mouse', quantity: 1, unitPrice: 120.0, isFinalSale: false },
        ],
      },
    },
  });

  // Scenario B: Final sale (Recent, but final sale)
  const orderB = await prisma.order.create({
    data: {
      orderNumber: 'ORD-B-1002',
      customerId: customerB.id,
      orderDate: new Date(),
      totalAmount: 50.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [
          { productName: 'Clearance T-Shirt', quantity: 2, unitPrice: 25.0, isFinalSale: true },
        ],
      },
    },
  });

  // Scenario C: Old order (> 30 days old)
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 45);
  const orderC = await prisma.order.create({
    data: {
      orderNumber: 'ORD-C-1003',
      customerId: customerC.id,
      orderDate: oldDate,
      totalAmount: 75.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [
          { productName: 'Coffee Mug', quantity: 3, unitPrice: 25.0, isFinalSale: false },
        ],
      },
    },
  });

  // Scenario D: High-value refund (> $500)
  const orderD = await prisma.order.create({
    data: {
      orderNumber: 'ORD-D-1004',
      customerId: customerD.id,
      orderDate: new Date(),
      totalAmount: 1500.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [
          { productName: 'Laptop', quantity: 1, unitPrice: 1500.0, isFinalSale: false },
        ],
      },
    },
  });

  // Scenario E: Incorrect item
  const orderE = await prisma.order.create({
    data: {
      orderNumber: 'ORD-E-1005',
      customerId: customerE.id,
      orderDate: new Date(),
      totalAmount: 85.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [
          { productName: 'Mechanical Keyboard', quantity: 1, unitPrice: 85.0, isFinalSale: false },
        ],
      },
    },
  });

  // Scenario F: Suspicious/conflicting request
  const orderF = await prisma.order.create({
    data: {
      orderNumber: 'ORD-F-1006',
      customerId: customerF.id,
      orderDate: new Date(),
      totalAmount: 200.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [
          { productName: 'Headphones', quantity: 1, unitPrice: 200.0, isFinalSale: false },
        ],
      },
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
