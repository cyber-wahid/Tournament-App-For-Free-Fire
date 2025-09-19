import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(pool, { schema, mode: 'default' });

async function createAdmin() {
  try {
    const adminData = {
      username: 'Superuser',
      email: process.env.ADMIN_EMAIL || 'superuser@cyberit.cloud',
      password: process.env.ADMIN_PASSWORD || 'D3!a9_Tq+Rp7x' // You can change this password
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Check if admin already exists
    const existingAdmin = await db.select().from(schema.admins).where(eq(schema.admins.username, adminData.username));
    
    if (existingAdmin.length > 0) {
      console.log('Admin account already exists!');
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
    console.log('\nYou can now login at: http://localhost:5000/admin/login');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
