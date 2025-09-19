import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "./shared/schema.js";
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(pool, { schema, mode: 'default' });

async function createAdmin() {
  try {
    console.log("👤 Creating fresh admin account...");
    
    const adminData = {
      username: "superuser",
      email: "superuser@cyberit.cloud",
      password: "D3!a9_Tq+Rp7x"
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    // Check if admin already exists
    const existingAdmin = await db.select().from(schema.admins).where(eq(schema.admins.username, adminData.username));
    
    if (existingAdmin.length > 0) {
      console.log("⚠️  Admin already exists, updating password...");
      await db.update(schema.admins)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(schema.admins.username, adminData.username));
    } else {
      console.log("➕ Creating new admin account...");
      await db.insert(schema.admins).values({
        username: adminData.username,
        email: adminData.email,
        password: hashedPassword
      });
    }
    
    console.log("✅ Superuser account created/updated successfully!");
    console.log("📧 Username: superuser");
    console.log("📧 Email: superuser@cyberit.cloud");
    console.log("🔑 Password: D3!a9_Tq+Rp7x");
    console.log("⚠️  Superuser account is ready for login!");
    
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();

