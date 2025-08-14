import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.fundReservation.deleteMany();
  await prisma.transactionStatusHistory.deleteMany();
  await prisma.fraudEvent.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.balanceHistory.deleteMany();
  await prisma.fundReservation.deleteMany();
  await prisma.monthlyAnalytics.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.userBiometric.deleteMany();
  await prisma.userMfa.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userRiskScore.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Existing data cleared');

  // Create sample users
  console.log('👥 Creating sample users...');
  
  const user1 = await prisma.user.create({
    data: {
      email: 'kwame.asante@example.com',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.kQKz6G', // password: test123
      phoneNumber: '+233244123456',
      firstName: 'Kwame',
      lastName: 'Asante',
      dateOfBirth: new Date('1990-05-15'),
      kycStatus: 'VERIFIED',
      kycVerifiedAt: new Date('2024-01-15'),
      isActive: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'ama.osei@example.com',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.kQKz6G',
      phoneNumber: '+233244123457',
      firstName: 'Ama',
      lastName: 'Osei',
      dateOfBirth: new Date('1988-08-22'),
      kycStatus: 'VERIFIED',
      kycVerifiedAt: new Date('2024-01-20'),
      isActive: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'kofi.mensah@example.com',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.kQKz6G',
      phoneNumber: '+233244123458',
      firstName: 'Kofi',
      lastName: 'Mensah',
      dateOfBirth: new Date('1992-03-10'),
      kycStatus: 'VERIFIED',
      kycVerifiedAt: new Date('2024-01-25'),
      isActive: true,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'abena.addo@example.com',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.kQKz6G',
      phoneNumber: '+233244123459',
      firstName: 'Abena',
      lastName: 'Addo',
      dateOfBirth: new Date('1985-12-05'),
      kycStatus: 'VERIFIED',
      kycVerifiedAt: new Date('2024-02-01'),
      isActive: true,
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'yaw.boateng@example.com',
      passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.kQKz6G',
      phoneNumber: '+233244123460',
      firstName: 'Yaw',
      lastName: 'Boateng',
      dateOfBirth: new Date('1995-07-18'),
      kycStatus: 'VERIFIED',
      kycVerifiedAt: new Date('2024-02-05'),
      isActive: true,
    },
  });

  console.log('✅ 5 users created');

  // Create accounts for users
  console.log('🏦 Creating user accounts...');
  
  const account1 = await prisma.account.create({
    data: {
      userId: user1.id,
      accountNumber: 'GHS001234567890',
      balance: 50000.00,
      availableBalance: 50000.00,
      currency: 'GHS',
      accountType: 'PERSONAL',
      status: 'ACTIVE',
    },
  });

  const account2 = await prisma.account.create({
    data: {
      userId: user2.id,
      accountNumber: 'GHS001234567891',
      balance: 35000.00,
      availableBalance: 35000.00,
      currency: 'GHS',
      accountType: 'PERSONAL',
      status: 'ACTIVE',
    },
  });

  const account3 = await prisma.account.create({
    data: {
      userId: user3.id,
      accountNumber: 'GHS001234567892',
      balance: 28000.00,
      availableBalance: 28000.00,
      currency: 'GHS',
      accountType: 'PERSONAL',
      status: 'ACTIVE',
    },
  });

  const account4 = await prisma.account.create({
    data: {
      userId: user4.id,
      accountNumber: 'GHS001234567893',
      balance: 42000.00,
      availableBalance: 42000.00,
      currency: 'GHS',
      accountType: 'PERSONAL',
      status: 'ACTIVE',
    },
  });

  const account5 = await prisma.account.create({
    data: {
      userId: user5.id,
      accountNumber: 'GHS001234567894',
      balance: 15000.00,
      availableBalance: 15000.00,
      currency: 'GHS',
      accountType: 'PERSONAL',
      status: 'ACTIVE',
    },
  });

  console.log('✅ 5 accounts created');

  // Create sample transactions
  console.log('💸 Creating sample transactions...');
  
  const transactionCategories = ['FOOD', 'SHOPPING', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTHCARE', 'EDUCATION', 'SAVINGS'];
  
  // Generate transactions for the last 30 days
  const transactions = [];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const transactionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const senderAccount = [account1, account2, account3, account4, account5][Math.floor(Math.random() * 5)];
    let recipientAccount = [account1, account2, account3, account4, account5][Math.floor(Math.random() * 5)];
    
    // Ensure sender and recipient are different
    while (recipientAccount.id === senderAccount.id) {
      recipientAccount = [account1, account2, account3, account4, account5][Math.floor(Math.random() * 5)];
    }
    
    const amount = Math.floor(Math.random() * 5000) + 100; // 100 to 5100 GHS
    const category = transactionCategories[Math.floor(Math.random() * transactionCategories.length)];
    
    const transaction = await prisma.transaction.create({
      data: {
        idempotencyKey: `txn_${Date.now()}_${i}`,
        senderAccountId: senderAccount.id,
        recipientAccountId: recipientAccount.id,
        amount: amount,
        currency: 'GHS',
        category: category,
        description: `${category.toLowerCase()} transaction`,
        status: 'COMPLETED',
        reference: `REF_${Date.now()}_${i}`,
        metadata: { source: 'seed' },
        completedAt: transactionDate,
      },
    });
    
    transactions.push(transaction);
  }

  console.log('✅ 50 transactions created');

  // Create contacts between users
  console.log('👥 Creating user contacts...');
  
  await prisma.contact.create({
    data: {
      userId: user1.id,
      contactUserId: user2.id,
      nickname: 'Ama',
      isFavorite: true,
      transactionCount: 8,
      totalSent: 12000.00,
      lastTransactionAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.contact.create({
    data: {
      userId: user1.id,
      contactUserId: user3.id,
      nickname: 'Kofi',
      isFavorite: false,
      transactionCount: 5,
      totalSent: 8000.00,
      lastTransactionAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.contact.create({
    data: {
      userId: user2.id,
      contactUserId: user1.id,
      nickname: 'Kwame',
      isFavorite: true,
      transactionCount: 6,
      totalSent: 9500.00,
      lastTransactionAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ 3 contacts created');

  // Create monthly analytics
  console.log('📊 Creating monthly analytics...');
  
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  await prisma.monthlyAnalytics.create({
    data: {
      userId: user1.id,
      month: currentMonth,
      year: currentYear,
      totalSpent: 25000.00,
      totalReceived: 18000.00,
      transactionCount: 25,
      topRecipients: [
        { name: 'Ama Osei', amount: 12000, count: 8 },
        { name: 'Kofi Mensah', amount: 8000, count: 5 },
        { name: 'Abena Addo', amount: 5000, count: 3 },
      ],
      topCategories: [
        { category: 'FOOD', amount: 8000, percentage: 32 },
        { category: 'TRANSPORT', amount: 6000, percentage: 24 },
        { category: 'SHOPPING', amount: 5000, percentage: 20 },
        { category: 'ENTERTAINMENT', amount: 4000, percentage: 16 },
        { category: 'UTILITIES', amount: 2000, percentage: 8 },
      ],
    },
  });

  console.log('✅ Monthly analytics created');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`📊 Created ${transactions.length} transactions for analytics testing`);
  console.log(`👥 Created ${5} users with accounts`);
  console.log(`💳 Created ${5} accounts with realistic balances`);
  console.log(`📈 Created sample monthly analytics`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
