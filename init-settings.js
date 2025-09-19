import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './shared/schema.js';
import { eq } from 'drizzle-orm';

// Initialize system settings with correct values
async function initializeSettings() {
  try {
    // Database connection - use your local DATABASE_URL
    const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/ffclash';
    const pool = mysql.createPool(DATABASE_URL);
    const db = drizzle(pool, { schema, mode: 'default' });

    console.log('🔧 Initializing system settings...');

    // Define the correct settings that should match your server
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

    // Insert or update each setting
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
        console.log(`✅ Created setting: ${setting.key} = ${setting.value}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          // Setting already exists, update it
          await db
            .update(schema.systemSettings)
            .set({
              value: setting.value,
              description: setting.description,
              updatedAt: new Date()
            })
            .where(eq(schema.systemSettings.key, setting.key));
          console.log(`🔄 Updated setting: ${setting.key} = ${setting.value}`);
        } else {
          console.error(`❌ Error with setting ${setting.key}:`, error.message);
        }
      }
    }

    console.log('\n🎉 System settings initialized successfully!');
    console.log('\n📋 Current settings:');
    
    const currentSettings = await db.select().from(schema.systemSettings);
    currentSettings.forEach(setting => {
      console.log(`  ${setting.key}: ${setting.value}`);
    });

  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    console.log('\n💡 Make sure to:');
    console.log('1. Set DATABASE_URL environment variable');
    console.log('2. Database is running and accessible');
    console.log('3. Schema is already migrated (npm run db:push)');
  } finally {
    process.exit(0);
  }
}

initializeSettings();
