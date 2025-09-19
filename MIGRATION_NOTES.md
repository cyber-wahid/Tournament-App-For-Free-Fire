# Migration from PostgreSQL to MySQL

## Overview

This document outlines the changes made to migrate the FF Clash tournament app from PostgreSQL to MySQL.

## Changes Made

### 1. Database Configuration

**Before (PostgreSQL):**
```typescript
// drizzle.config.ts
dialect: "postgresql"

// server/db.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
```

**After (MariaDB):**
```typescript
// drizzle.config.ts
dialect: "mysql"

// server/db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
```

### 2. Schema Changes

**Before (PostgreSQL):**
```typescript
import { pgTable, varchar, text, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const paymentMethodEnum = pgEnum("payment_method", ["bkash", "nagad", "rocket"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // ...
});
```

**After (MariaDB):**
```typescript
import { mysqlTable, varchar, text, int, decimal, timestamp, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

export const paymentMethodEnum = mysqlEnum("payment_method", ["bkash", "nagad", "rocket"]);

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  // ...
});
```

### 3. Package Dependencies

**Removed:**
- `@neondatabase/serverless`
- `connect-pg-simple`
- `ws`
- `@types/connect-pg-simple`
- `@types/ws`

**Added:**
- `mysql2`

### 4. Key Differences

1. **UUID Generation:**
   - PostgreSQL: `gen_random_uuid()`
   - MariaDB: `UUID()`

2. **Enum Usage:**
   - PostgreSQL: `gameTypeEnum("game_type")`
   - MariaDB: `gameTypeEnum` (no column name parameter)

3. **Integer Type:**
   - PostgreSQL: `integer`
   - MariaDB: `int`

4. **Table Definition:**
   - PostgreSQL: `pgTable`
   - MariaDB: `mysqlTable`

5. **Varchar Length:**
   - PostgreSQL: `varchar("id")` (no length required)
   - MariaDB: `varchar("id", { length: 36 })` (length required)

### 5. Environment Configuration

**Database URL Format:**
- PostgreSQL: `postgresql://user:password@host:port/database`
- MariaDB: `mysql://user:password@host:port/database`

## Testing

The application has been tested with:
- Database schema migration successful
- Server starts without errors
- Frontend loads correctly
- Database connection established

## Deployment Notes

1. Ensure MariaDB/MySQL is installed and running
2. Create database and user with appropriate permissions
3. Update environment variables with correct database URL
4. Run `npm run db:push` to create tables
5. Start the application with `npm run dev` or `npm start`

## Troubleshooting

### Common Issues

1. **Enum Errors:**
   - Ensure enum usage doesn't include column name parameter
   - Use `enumName.notNull()` instead of `enumName("column_name").notNull()`

2. **Connection Errors:**
   - Verify MariaDB service is running
   - Check database credentials and permissions
   - Ensure database exists

3. **Schema Issues:**
   - Run `npm run db:push` after any schema changes
   - Check for proper varchar length specifications

## Performance Considerations

MariaDB generally offers:
- Better performance for read-heavy workloads
- Improved JSON handling
- Better compatibility with MySQL ecosystem
- More storage engines available

## Backup and Recovery

Remember to:
- Backup your PostgreSQL data before migration
- Test the migration thoroughly in a development environment
- Have a rollback plan if needed

