import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Comprehensive database setup script
async function setupDatabase() {
  try {
    // Database connection - use your local DATABASE_URL
    const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/ffclash';
    const pool = mysql.createPool(DATABASE_URL);
    const db = drizzle(pool, { schema, mode: 'default' });

    console.log('🚀 Setting up FF Clash database...\n');

    // 1. Initialize system settings
    console.log('🔧 Step 1: Initializing system settings...');
    const settings = [
      {
        key: 'min_balance_add',
        value: '20',
        description: 'ব্যবহারকারীরা সর্বনিম্ন কত টাকা অ্যাড করতে পারবে'
      },
      {
        key: 'max_balance_add',
        value: '1000',
        description: 'ব্যবহারকারীরা সর্বোচ্চ কত টাকা অ্যাড করতে পারবে'
      },
      {
        key: 'min_withdraw',
        value: '20',
        description: 'ব্যবহারকারীরা সর্বনিম্ন কত টাকা উত্তোলন করতে পারবে'
      },
      {
        key: 'max_withdraw',
        value: '1000',
        description: 'ব্যবহারকারীরা সর্বোচ্চ কত টাকা উত্তোলন করতে পারবে'
      },
      {
        key: 'social_facebook',
        value: 'https://m.me/cyberwahid',
        description: 'Facebook Messenger link for customer support'
      },
      {
        key: 'social_telegram',
        value: 'https://t.me/cyberwahid',
        description: 'Telegram link for customer support'
      },
      {
        key: 'social_whatsapp',
        value: 'https://wa.me/+880130527405',
        description: 'WhatsApp link for customer support'
      }
    ];

    for (const setting of settings) {
      try {
        await db.insert(schema.systemSettings).values({
          id: crypto.randomUUID(),
          key: setting.key,
          value: setting.value,
          description: setting.description,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`  ✅ Created: ${setting.key} = ${setting.value}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          await db
            .update(schema.systemSettings)
            .set({
              value: setting.value,
              description: setting.description,
              updatedAt: new Date()
            })
            .where(eq(schema.systemSettings.key, setting.key));
          console.log(`  🔄 Updated: ${setting.key} = ${setting.value}`);
        } else {
          console.error(`  ❌ Error with ${setting.key}:`, error.message);
        }
      }
    }

    // 2. Initialize admin wallets
    console.log('\n💰 Step 2: Setting up admin wallets...');
    const wallets = [
      {
        paymentMethod: 'bkash',
        walletNumber: '01011340014',
        isActive: true
      },
      {
        paymentMethod: 'nagad',
        walletNumber: '01011340014',
        isActive: true
      },
      {
        paymentMethod: 'rocket',
        walletNumber: '01011340014',
        isActive: true
      }
    ];

    for (const wallet of wallets) {
      try {
        await db.insert(schema.adminWallets).values({
          id: crypto.randomUUID(),
          paymentMethod: wallet.paymentMethod,
          walletNumber: wallet.walletNumber,
          isActive: wallet.isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`  ✅ Created: ${wallet.paymentMethod} wallet`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`  🔄 Already exists: ${wallet.paymentMethod} wallet`);
        } else {
          console.error(`  ❌ Error with ${wallet.paymentMethod}:`, error.message);
        }
      }
    }

    // 3. Create a test user with 20 TK balance
    console.log('\n👤 Step 3: Creating test user...');
    try {
      const testUser = await db.insert(schema.users).values({
        id: crypto.randomUUID(),
        username: 'testuser',
        email: 'test@ffclash.com',
        password: '$2b$10$test.hash.for.testing.purposes.only',
        balance: '20.00',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('  ✅ Created test user with ৳20.00 balance');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('  🔄 Test user already exists');
      } else {
        console.error('  ❌ Error creating test user:', error.message);
      }
    }

    // 4. Create a superuser admin
    console.log('\n👑 Step 4: Creating superuser admin...');
    try {
      const admin = await db.insert(schema.admins).values({
        id: crypto.randomUUID(),
        username: 'Superuser',
        email: 'admin@ffclash.com',
        password: '$2b$10$LRGMy7mnwVZ225hJT7RKae5xeCDCksaRoXb1EsUNocjR4rvkyG8Wa', // D3!a9_Tq+Rp7x
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('  ✅ Created superuser admin');
      console.log('  📧 Email: admin@ffclash.com');
      console.log('  🔑 Password: D3!a9_Tq+Rp7x');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('  🔄 Superuser admin already exists');
      } else {
        console.error('  ❌ Error creating admin:', error.message);
      }
    }

    // 5. Display final status
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Current database status:');
    
    const [userCount] = await db.select({ count: sql`count(*)` }).from(schema.users);
    const [adminCount] = await db.select({ count: sql`count(*)` }).from(schema.admins);
    const [settingCount] = await db.select({ count: sql`count(*)` }).from(schema.systemSettings);
    const [walletCount] = await db.select({ count: sql`count(*)` }).from(schema.adminWallets);
    
    console.log(`  👥 Users: ${userCount.count}`);
    console.log(`  👑 Admins: ${adminCount.count}`);
    console.log(`  ⚙️  Settings: ${settingCount.count}`);
    console.log(`  💰 Admin Wallets: ${walletCount.count}`);
    
    console.log('\n🔗 Next steps:');
    console.log('1. Start your app: npm start');
    console.log('2. Login as admin: admin@ffclash.com / D3!a9_Tq+Rp7x');
    console.log('3. Verify settings in admin panel');
    console.log('4. Test user balance and limits');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('\n💡 Make sure to:');
    console.log('1. Set DATABASE_URL environment variable');
    console.log('2. Database is running and accessible');
    console.log('3. Run migrations first: npm run db:push');
  } finally {
    process.exit(0);
  }
}

setupDatabase();
