import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Alice Johnson',
      email: 'alice@example.com',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Bob Smith',
      email: 'bob@example.com',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
    },
  });

  console.log('✅ Created 3 customers');
  console.log(`   - ${customer1.name} (${customer1.id})`);
  console.log(`   - ${customer2.name} (${customer2.id})`);
  console.log(`   - ${customer3.name} (${customer3.id})`);
  
  console.log('\n🌱 Seed completed!');
  console.log('You can now create accounts for these customers using the API');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });