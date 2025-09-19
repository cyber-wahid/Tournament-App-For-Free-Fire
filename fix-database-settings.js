import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './shared/schema.js';
import { eq } from 'drizzle-orm';

// Quick fix for database settings - since both local and server use same database
async function fixDatabaseSettings() {
  try {
    // Database connection - use your production DATABASE_URL
    const DATABASE_URL = process.env.DATABASE_URL || 'mysql://ffclash:password@localhost:3306/ffclash';
    const pool = mysql.createPool(DATABASE_URL);
    const db = drizzle(pool, { schema, mode: 'default' });

    console.log('🔧 Fixing database settings for shared database...\n');

    // 1. Check current settings
    console.log('📊 Current settings:');
    const currentSettings = await db.select().from(schema.systemSettings);
    currentSettings.forEach(setting => {
      console.log(`  ${setting.key}: ${setting.value}`);
    });

    // 2. Fix the problematic settings
    console.log('\n🔧 Fixing minimum amounts...');
    
    const settingsToFix = [
      {
        key: 'min_balance_add',
        value: '20',
        description: 'ব্যবহারকারীরা সর্বনিম্ন কত টাকা অ্যাড করতে পারবে'
      },
      {
        key: 'min_withdraw',
        value: '20',
        description: 'ব্যবহারকারীরা সর্বনিম্ন কত টাকা উত্তোলন করতে পারবে'
      }
    ];

    for (const setting of settingsToFix) {
      try {
        // Check if setting exists
        const existingSetting = await db
          .select()
          .from(schema.systemSettings)
          .where(eq(schema.systemSettings.key, setting.key))
          .limit(1);

        if (existingSetting.length > 0) {
          // Update existing setting
          await db
            .update(schema.systemSettings)
            .set({
              value: setting.value,
              description: setting.description,
              updatedAt: new Date()
            })
            .where(eq(schema.systemSettings.key, setting.key));
          console.log(`  ✅ Updated: ${setting.key} = ${setting.value}`);
        } else {
          // Create new setting
          await db.insert(schema.systemSettings).values({
            id: crypto.randomUUID(),
            key: setting.key,
            value: setting.value,
            description: setting.description,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`  ✅ Created: ${setting.key} = ${setting.value}`);
        }
      } catch (error) {
        console.error(`  ❌ Error with ${setting.key}:`, error.message);
      }
    }

    // 3. Verify the fix
    console.log('\n🔍 Verifying fix...');
    const fixedSettings = await db
      .select()
      .from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, 'min_withdraw'));
    
    if (fixedSettings.length > 0) {
      console.log(`  ✅ min_withdraw is now: ${fixedSettings[0].value}`);
    }

    const fixedBalanceSettings = await db
      .select()
      .from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, 'min_balance_add'));
    
    if (fixedBalanceSettings.length > 0) {
      console.log(`  ✅ min_balance_add is now: ${fixedBalanceSettings[0].value}`);
    }

    // 4. Final status
    console.log('\n🎉 Database settings fixed successfully!');
    console.log('\n📋 Updated settings:');
    
    const updatedSettings = await db.select().from(schema.systemSettings);
    updatedSettings.forEach(setting => {
      console.log(`  ${setting.key}: ${setting.value}`);
    });

    console.log('\n🔗 Next steps:');
    console.log('1. Restart your server: pm2 restart your-app-name');
    console.log('2. Test locally: npm start');
    console.log('3. Both environments should now show ৳20 minimum');
    console.log('4. Check Add Money and Withdraw pages');

  } catch (error) {
    console.error('❌ Failed to fix database settings:', error);
    console.log('\n💡 Make sure to:');
    console.log('1. Set correct DATABASE_URL in .env');
    console.log('2. Database is accessible');
    console.log('3. You have write permissions to the database');
  } finally {
    process.exit(0);
  }
}

fixDatabaseSettings();
