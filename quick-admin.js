import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.js';

// Direct admin creation without environment variables
async function createQuickAdmin() {
  try {
    // Database connection - replace with your actual DATABASE_URL
    const DATABASE_URL = process.env.DATABASE_URL || 'mysql://ffclash_user:password@localhost:3306/ffclash';
    const pool = mysql.createPool(DATABASE_URL);
    const db = drizzle(pool, { schema, mode: 'default' });

    const adminData = {
      username: 'Superuser',
      email: 'admin@ffclash.com',
      password: 'admin123' // Change this password
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Check if admin already exists
    const existingAdmin = await db.select().from(schema.admins).where(eq(schema.admins.username, adminData.username));
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin account already exists!');
      console.log('Username:', adminData.username);
      console.log('Email:', adminData.email);
      return;
    }

    // Insert admin
    await db.insert(schema.admins).values({
      username: adminData.username,
      email: adminData.email,
      password: hashedPassword
    });

    console.log('✅ Admin account created successfully!');
    console.log('Username:', adminData.username);
    console.log('Password:', adminData.password);
    console.log('Email:', adminData.email);
    console.log('\n🔗 Login URL: http://your-domain/admin/login');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    console.log('\n💡 Make sure to:');
    console.log('1. Set DATABASE_URL environment variable');
    console.log('2. Database is running and accessible');
    console.log('3. Schema is already migrated (npm run db:push)');
  } finally {
    process.exit(0);
  }
}

createQuickAdmin();
