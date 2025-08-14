import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seeding...');

  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const userCount = await prisma.users.count();
    console.log(`✅ Database connected! Current user count: ${userCount}`);

    // Check if test user already exists
    console.log('👤 Checking if test user exists...');
    let testUser = await prisma.users.findUnique({
        where: { email: 'test@example.com' }
    });

    if (!testUser) {
        console.log('👤 Creating test user...');
        testUser = await prisma.users.create({
            data: {
                id: 'e0f1854b-ac6e-4381-b7ae-648a5ab0a2f0',
                email: 'test@example.com',
                phone_number: '1234567890',
                first_name: 'Test',
                last_name: 'User',
                date_of_birth: new Date('1990-01-01'),
                kyc_status: 'PENDING',
                is_active: true,
                updated_at: new Date(),
            },
        });
        console.log(`✅ Test user created: ${testUser.first_name} ${testUser.last_name}`);
    } else {
        console.log(`✅ Test user already exists: ${testUser.first_name} ${testUser.last_name}`);
    }

    // Check if test account already exists
    console.log('🏦 Checking if test account exists...');
    let testAccount = await prisma.accounts.findFirst({
        where: { user_id: testUser.id }
    });

    if (!testAccount) {
        console.log('🏦 Creating test account...');
        testAccount = await prisma.accounts.create({
            data: {
                id: '0f2b4008-6566-4990-b405-ea735b95c0d2',
                user_id: testUser.id,
                account_number: 'TEST123456',
                balance: 1000.00,
                available_balance: 1045.00,
                currency: 'USD',
                account_type: 'PERSONAL',
                status: 'ACTIVE',
                updated_at: new Date(),
            },
        });
        console.log(`✅ Test account created with balance: ${testAccount.balance} ${testAccount.currency}`);
    } else {
        console.log(`✅ Test account already exists with balance: ${testAccount.balance} ${testAccount.currency}`);
    }

    // Create a second test user (recipient) for sending money
    console.log('👤 Checking if recipient test user exists...');
    let recipientUser = await prisma.users.findUnique({
        where: { email: 'recipient@example.com' }
    });

    if (!recipientUser) {
        console.log('👤 Creating recipient test user...');
        recipientUser = await prisma.users.create({
            data: {
                id: '11111111-1111-1111-1111-111111111111',
                email: 'recipient@example.com',
                phone_number: '9876543210',
                first_name: 'Recipient',
                last_name: 'User',
                date_of_birth: new Date('1995-01-01'),
                kyc_status: 'PENDING',
                is_active: true,
                updated_at: new Date(),
            },
        });
        console.log(`✅ Recipient test user created: ${recipientUser.first_name} ${recipientUser.last_name}`);
    } else {
        console.log(`✅ Recipient test user already exists: ${recipientUser.first_name} ${recipientUser.last_name}`);
    }

    // Create account for recipient user
    console.log('🏦 Checking if recipient account exists...');
    let recipientAccount = await prisma.accounts.findFirst({
        where: { user_id: recipientUser.id }
    });

    if (!recipientAccount) {
        console.log('🏦 Creating recipient account...');
        recipientAccount = await prisma.accounts.create({
            data: {
                id: '22222222-2222-2222-2222-222222222222',
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
        console.log(`✅ Recipient account created with balance: ${recipientAccount.balance} ${recipientAccount.currency}`);
    } else {
        console.log(`✅ Recipient account already exists with balance: ${recipientAccount.balance} ${recipientAccount.currency}`);
    }

    console.log('🎉 Simple seeding completed successfully!');
    console.log('📊 You can now test the login endpoint with test@example.com');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
