import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting fresh seed for actual database structure...');

  // Create test user
  const testUser = await prisma.users.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@example.com',
      phone_number: '1234567890',
      first_name: 'Test',
      last_name: 'User',
      date_of_birth: new Date('1990-01-01'),
      kyc_status: 'VERIFIED',
      is_active: true,
      updated_at: new Date(),
    },
  });

  // Create second test user for transfers
  const recipientUser = await prisma.users.upsert({
    where: { email: 'recipient@example.com' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'recipient@example.com',
      phone_number: '0987654321',
      first_name: 'Recipient',
      last_name: 'User',
      date_of_birth: new Date('1995-01-01'),
      kyc_status: 'VERIFIED',
      is_active: true,
      updated_at: new Date(),
    },
  });

  console.log('✅ Test user created:', testUser.email);
  console.log('✅ Recipient user created:', recipientUser.email);

  // Create a test account for the user
  const testAccount = await prisma.accounts.upsert({
    where: { account_number: 'TEST123456' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      user_id: testUser.id,
      account_number: 'TEST123456',
      balance: 1000.00,
      available_balance: 1000.00,
      currency: 'USD',
      account_type: 'PERSONAL',
      status: 'ACTIVE',
      updated_at: new Date(),
    },
  });

  // Create an account for the recipient user
  const recipientAccount = await prisma.accounts.upsert({
    where: { account_number: 'RECIPIENT789' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      user_id: recipientUser.id,
      account_number: 'RECIPIENT789',
      balance: 500.00,
      available_balance: 500.00,
      currency: 'USD',
      account_type: 'PERSONAL',
      status: 'ACTIVE',
      updated_at: new Date(),
    },
  });

  console.log('✅ Test account created:', testAccount.account_number);
  console.log('✅ Recipient account created:', recipientAccount.account_number);

  console.log('🎉 Fresh seed completed successfully!');
  console.log('\n📊 Current Data:');
  console.log(`   Users: 2`);
  console.log(`   Accounts: 2`);
  console.log(`   Test User Balance: $1000.00`);
  console.log(`   Recipient User Balance: $500.00`);
  console.log('\n💡 Note: Transactions will be created when you test the transfer functionality');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
