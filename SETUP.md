# 🚀 FF Clash - Complete Setup Guide

## 🎯 **Problem Identified**
**CRITICAL**: Both your local development environment and production server are using the **SAME DATABASE**! This is why you're experiencing synchronization issues:

- **Server shows**: ৳20 balance, min withdraw/add = ৳100 ❌
- **Local shows**: ৳30 balance, min withdraw/add = ৳20 ✅

**Root Cause**: Same database, different application versions or environment configurations.

## 📋 **Prerequisites**
- Node.js 18+ installed
- Access to your production database (same one server uses)
- Git repository cloned

## 🗄️ **Step 1: Database Verification**

### 1.1 Check Current Database State
Since both local and server use the same database, first verify what's currently in production:

```bash
# Connect to your production database
mysql -u ffclash -p ffclash

# Check current system settings
SELECT * FROM system_settings WHERE `key` IN ('min_withdraw', 'min_balance_add');

# Check admin wallets
SELECT * FROM admin_wallets;

# Check if there are conflicting settings
SELECT * FROM system_settings;
```

### 1.2 Identify the Issue
The problem is likely one of these:
- **Database has old settings** (min = 100)
- **Application code is hardcoded** somewhere
- **Environment variables are different**

## 🔧 **Step 2: Fix Database Settings**

### 2.1 Update Database Settings (Production)
Since this affects your live server, update the production database directly:

```sql
-- Connect to your production database and run:
UPDATE system_settings SET value = '20' WHERE `key` = 'min_withdraw';
UPDATE system_settings SET value = '20' WHERE `key` = 'min_balance_add';

-- Verify the changes
SELECT * FROM system_settings WHERE `key` IN ('min_withdraw', 'min_balance_add');
```

### 2.2 Ensure Admin Wallets Exist
```sql
-- Check if admin wallets exist
SELECT * FROM admin_wallets;

-- If they don't exist, create them
INSERT INTO admin_wallets (id, payment_method, wallet_number, is_active, created_at, updated_at) VALUES
(UUID(), 'bkash', '01011340014', 1, NOW(), NOW()),
(UUID(), 'nagad', '01011340014', 1, NOW(), NOW()),
(UUID(), 'rocket', '01011340014', 1, NOW(), NOW());
```

## 🚀 **Step 3: Update Application Code**

### 3.1 Pull Latest Code
```bash
# Make sure you have the latest code
git pull origin main
```

### 3.2 Build and Test Locally
```bash
# Build the project
npm run build

# Start locally (will use same database as server)
npm start
```

### 3.3 Verify Local Environment
- **Frontend**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin/login
- **Test**: Check if min amounts now show ৳20

## 🔍 **Step 4: Verification**

### 4.1 Check Both Environments
1. **Local**: http://localhost:5000
   - Add Money: Should show "Enter amount (৳20-৳1000)"
   - Withdraw: Should show "Enter amount (৳20-৳1000)"

2. **Server**: https://cnode.pw
   - Add Money: Should show "Enter amount (৳20-৳1000)"
   - Withdraw: Should show "Enter amount (৳20-৳1000)"

### 4.2 Check Admin Panel
1. Login to admin panel on both environments
2. Go to System Settings
3. Verify these values are **identical**:
   - `min_balance_add`: 20
   - `min_withdraw`: 20
   - `max_balance_add`: 1000
   - `max_withdraw`: 1000

## 🆘 **Troubleshooting**

### Issue: Settings Still Show 100
**Solution**: The database update didn't work or there's cached data
```sql
-- Double-check database
SELECT * FROM system_settings WHERE `key` IN ('min_withdraw', 'min_balance_add');

-- Clear any application cache by restarting
pm2 restart your-app-name  # On server
npm start                   # Locally
```

### Issue: Different Values on Local vs Server
**Solution**: Both are using same database, so this shouldn't happen
- Check if you have different `.env` files
- Verify both environments point to same `DATABASE_URL`
- Restart both applications

### Issue: Application Won't Start
**Solution**: 
```bash
# Check if dist folder exists
npm run build

# Check environment variables
echo $DATABASE_URL

# Check database connection
mysql -u ffclash -p ffclash -e "SELECT 1;"
```

## 📤 **Deploy to Server**

### 5.1 Update Server Code
```bash
# On your server
git pull origin main
npm install
npm run build
pm2 restart your-app-name
```

### 5.2 Verify Server
1. Check server logs: `pm2 logs your-app-name`
2. Test server functionality
3. Verify settings are correct

## 🎯 **Expected Results**

After fixing the database settings, both environments should show:
- ✅ **User Balance**: ৳20.00 (consistent)
- ✅ **Add Money**: Min ৳20, Max ৳1000 (consistent)
- ✅ **Withdraw**: Min ৳20, Max ৳1000 (consistent)
- ✅ **Admin Panel**: All settings correctly configured
- ✅ **Database**: Single source of truth for both environments

## 🔗 **Useful Commands**

```bash
# Database operations
npm run db:push          # Run migrations if needed
npm run setup-db         # Complete database setup (if needed)

# Application
npm run build            # Build for production
npm start                # Start production server
npm run dev              # Start development server

# Server management
pm2 restart your-app-name
pm2 logs your-app-name
```

## ⚠️ **Important Notes**

1. **Single Database**: Both local and server use the same database
2. **No Local Database**: Don't create a separate local database
3. **Environment Variables**: Ensure both environments have same `DATABASE_URL`
4. **Code Sync**: Keep local and server code versions synchronized
5. **Database Changes**: Any database changes affect both environments immediately

## 📞 **Support**

If you still encounter issues:
1. Check database settings directly: `SELECT * FROM system_settings;`
2. Verify both environments use same `DATABASE_URL`
3. Check application logs for errors
4. Ensure code versions are identical

---

**🎉 Key Point**: Since you're using the same database, fixing the database settings will resolve the issue for both environments simultaneously!
