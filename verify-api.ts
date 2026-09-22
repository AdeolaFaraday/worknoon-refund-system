import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


async function runTests() {
  console.log('Fetching customers...');
  const alice = await prisma.customer.findUnique({ where: { email: 'alice@example.com' } });
  const bob = await prisma.customer.findUnique({ where: { email: 'bob@example.com' } });
  const diana = await prisma.customer.findUnique({ where: { email: 'diana@example.com' } });

  if (!alice || !bob || !diana) {
    console.error('Test customers not found. Did you run the seed?');
    process.exit(1);
  }

  console.log('\n=== SCENARIO A: APPROVED (Recent damaged item) ===');
  const resA = await fetch('http://localhost:3001/refunds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: alice.id,
      orderNumber: 'ORD-A-1001',
      requestedAmount: 120,
      reason: 'damaged',
      description: 'The wireless mouse arrived with a cracked scroll wheel and does not work properly.'
    })
  });
  console.log(await resA.json());

  console.log('\n=== SCENARIO B: DENIED (Final sale) ===');
  const resB = await fetch('http://localhost:3001/refunds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: bob.id,
      orderNumber: 'ORD-B-1002',
      requestedAmount: 50,
      reason: 'damaged',
      description: 'This shirt has a hole in it.'
    })
  });
  console.log(await resB.json());

  console.log('\n=== SCENARIO D: ESCALATED (High value) ===');
  const resD = await fetch('http://localhost:3001/refunds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: diana.id,
      orderNumber: 'ORD-D-1004',
      requestedAmount: 1500,
      reason: 'damaged',
      description: 'The laptop screen is shattered.'
    })
  });
  console.log(await resD.json());
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
