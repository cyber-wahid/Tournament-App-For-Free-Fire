import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = mysql.createPool(process.env.DATABASE_URL);

async function clearDatabase() {
  try {
    console.log("🗑️  Starting database cleanup...");
    
    // Drop all tables in the correct order (respecting foreign key constraints)
    const dropQueries = [
      "DROP TABLE IF EXISTS tournament_participants",
      "DROP TABLE IF EXISTS balance_requests", 
      "DROP TABLE IF EXISTS withdraw_requests",
      "DROP TABLE IF EXISTS admin_wallets",
      "DROP TABLE IF EXISTS tournaments",
      "DROP TABLE IF EXISTS users",
      "DROP TABLE IF EXISTS admins"
    ];

    for (const query of dropQueries) {
      console.log(`Executing: ${query}`);
      await pool.execute(query);
      console.log("✓ Table dropped successfully");
    }

    console.log("\n✅ All tables dropped successfully!");
    console.log("📝 Database is now completely empty");
    console.log("\n🔄 To recreate tables, run: npm run db:push");
    console.log("🎯 You can now start with a completely clean database");
    
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  } finally {
    await pool.end();
  }
}

clearDatabase();

