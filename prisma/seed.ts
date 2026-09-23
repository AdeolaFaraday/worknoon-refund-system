import { PrismaClient, OrderStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ── Scenario Customers (A–F) ─────────────────────────────────────────────
  const customerA = await prisma.customer.create({ data: { name: 'Alice Smith', email: 'alice@example.com' } });
  const customerB = await prisma.customer.create({ data: { name: 'Bob Jones', email: 'bob@example.com' } });
  const customerC = await prisma.customer.create({ data: { name: 'Charlie Brown', email: 'charlie@example.com' } });
  const customerD = await prisma.customer.create({ data: { name: 'Diana Prince', email: 'diana@example.com' } });
  const customerE = await prisma.customer.create({ data: { name: 'Eve Adams', email: 'eve@example.com' } });
  const customerF = await prisma.customer.create({ data: { name: 'Frank White', email: 'frank@example.com' } });

  // ── Additional Customers (G–O) ───────────────────────────────────────────
  const customerG = await prisma.customer.create({ data: { name: 'Grace Hopper', email: 'grace@example.com' } });
  const customerH = await prisma.customer.create({ data: { name: 'Henry Ford', email: 'henry@example.com' } });
  const customerI = await prisma.customer.create({ data: { name: 'Irene Curie', email: 'irene@example.com' } });
  const customerJ = await prisma.customer.create({ data: { name: 'James Bond', email: 'james@example.com' } });
  const customerK = await prisma.customer.create({ data: { name: 'Karen Page', email: 'karen@example.com' } });
  const customerL = await prisma.customer.create({ data: { name: 'Leo Messi', email: 'leo@example.com' } });
  const customerM = await prisma.customer.create({ data: { name: 'Maria Garcia', email: 'maria@example.com' } });
  const customerN = await prisma.customer.create({ data: { name: 'Noah Williams', email: 'noah@example.com' } });
  const customerO = await prisma.customer.create({ data: { name: 'Olivia Chen', email: 'olivia@example.com' } });

  // ── Scenario A: Valid damaged item (Recent, not final sale, < $500) ──────
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-A-1001',
      customerId: customerA.id,
      orderDate: new Date(),
      totalAmount: 120.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Wireless Mouse', quantity: 1, unitPrice: 120.0, isFinalSale: false }],
      },
    },
  });

  // ── Scenario B: Final sale (Recent, but final sale) ──────────────────────
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-B-1002',
      customerId: customerB.id,
      orderDate: new Date(),
      totalAmount: 50.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Clearance T-Shirt', quantity: 2, unitPrice: 25.0, isFinalSale: true }],
      },
    },
  });

  // ── Scenario C: Old order (> 30 days old) ───────────────────────────────
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 45);
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-C-1003',
      customerId: customerC.id,
      orderDate: oldDate,
      totalAmount: 75.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Coffee Mug', quantity: 3, unitPrice: 25.0, isFinalSale: false }],
      },
    },
  });

  // ── Scenario D: High-value refund (> $500) ───────────────────────────────
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-D-1004',
      customerId: customerD.id,
      orderDate: new Date(),
      totalAmount: 1500.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Laptop', quantity: 1, unitPrice: 1500.0, isFinalSale: false }],
      },
    },
  });

  // ── Scenario E: Incorrect item delivered ─────────────────────────────────
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-E-1005',
      customerId: customerE.id,
      orderDate: new Date(),
      totalAmount: 85.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Mechanical Keyboard', quantity: 1, unitPrice: 85.0, isFinalSale: false }],
      },
    },
  });

  // ── Scenario F: Suspicious/conflicting request ───────────────────────────
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-F-1006',
      customerId: customerF.id,
      orderDate: new Date(),
      totalAmount: 200.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Headphones', quantity: 1, unitPrice: 200.0, isFinalSale: false }],
      },
    },
  });

  // ── Additional Orders for Customers G–O ─────────────────────────────────
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-G-2001',
      customerId: customerG.id,
      orderDate: new Date(),
      totalAmount: 340.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Smart Watch', quantity: 1, unitPrice: 340.0, isFinalSale: false }],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-H-2002',
      customerId: customerH.id,
      orderDate: new Date(),
      totalAmount: 60.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [
          { productName: 'Notebook Set', quantity: 2, unitPrice: 20.0, isFinalSale: false },
          { productName: 'Pen Holder', quantity: 1, unitPrice: 20.0, isFinalSale: false },
        ],
      },
    },
  });

  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 5);
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-I-2003',
      customerId: customerI.id,
      orderDate: recentDate,
      totalAmount: 250.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Running Shoes', quantity: 1, unitPrice: 250.0, isFinalSale: false }],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-J-2004',
      customerId: customerJ.id,
      orderDate: new Date(),
      totalAmount: 45.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Sunglasses', quantity: 1, unitPrice: 45.0, isFinalSale: true }],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-K-2005',
      customerId: customerK.id,
      orderDate: new Date(),
      totalAmount: 180.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Yoga Mat', quantity: 1, unitPrice: 90.0, isFinalSale: false }, { productName: 'Resistance Bands', quantity: 3, unitPrice: 30.0, isFinalSale: false }],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-L-2006',
      customerId: customerL.id,
      orderDate: new Date(),
      totalAmount: 720.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Gaming Console', quantity: 1, unitPrice: 720.0, isFinalSale: false }],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-M-2007',
      customerId: customerM.id,
      orderDate: new Date(),
      totalAmount: 95.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Scented Candles Set', quantity: 1, unitPrice: 95.0, isFinalSale: false }],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-N-2008',
      customerId: customerN.id,
      orderDate: new Date(),
      totalAmount: 130.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Electric Toothbrush', quantity: 1, unitPrice: 130.0, isFinalSale: false }],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-O-2009',
      customerId: customerO.id,
      orderDate: new Date(),
      totalAmount: 310.0,
      status: OrderStatus.COMPLETED,
      orderItems: {
        create: [{ productName: 'Portable Speaker', quantity: 1, unitPrice: 310.0, isFinalSale: false }],
      },
    },
  });

  console.log('Database seeded successfully with 15 customers and their orders.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
