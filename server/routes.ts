import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { userLoginSchema, adminLoginSchema, insertUserSchema, insertTournamentSchema, insertBalanceRequestSchema, insertWithdrawRequestSchema, insertAdminWalletSchema, insertSystemSettingSchema, updateSystemSettingSchema, requestPasswordResetSchema, resetPasswordSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware for user authentication
const authenticateUser = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    if (decoded.type !== "user") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware for admin authentication
const authenticateAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string; type: string };
    if (decoded.type !== "admin") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const admin = await storage.getAdmin(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // User Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Additional validation for Free Fire UID
      if (!userData.freeFireUID || userData.freeFireUID.trim() === '') {
        return res.status(400).json({ message: "Free Fire UID is required" });
      }
      
      if (!/^\d{9}$/.test(userData.freeFireUID)) {
        return res.status(400).json({ message: "Free Fire UID must be exactly 9 digits" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Check if Free Fire UID already exists
      const existingUID = await storage.getUserByFreeFireUID(userData.freeFireUID);
      if (existingUID) {
        return res.status(400).json({ message: "Free Fire UID already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = jwt.sign({ userId: user.id, type: "user" }, JWT_SECRET);

      res.json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { usernameOrEmail, password } = userLoginSchema.parse(req.body);
      
      const user = await storage.getUserByUsernameOrEmail(usernameOrEmail);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, type: "user" }, JWT_SECRET);

      res.json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin Authentication Routes
  app.post("/api/admin/auth/login", async (req, res) => {
    try {
      const { username, password } = adminLoginSchema.parse(req.body);
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ adminId: admin.id, type: "admin" }, JWT_SECRET);

      res.json({
        admin: { ...admin, password: undefined },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Password Reset Routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = requestPasswordResetSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If an account with that email exists, we've sent a password reset link." });
      }

      // Generate reset token
      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Create expiration time in UTC to avoid timezone issues
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now in UTC

      // Save reset token to database
      await storage.createPasswordResetToken({
        userId: user.id,
        token: resetToken,
        expiresAt,
      });

      // Generate reset link
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;

      // Send email
      const { sendEmail, generatePasswordResetEmail } = await import('./email');
      const emailSent = await sendEmail({
        to: user.email,
        subject: 'Password Reset - FF Clash',
        html: generatePasswordResetEmail(resetLink, user.username),
      });

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send reset email. Please try again." });
      }

      res.json({ message: "If an account with that email exists, we've sent a password reset link." });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      // Find valid reset token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token." });
      }

      // Get user
      const user = await storage.getUser(resetToken.userId);
      if (!user) {
        return res.status(400).json({ message: "User not found." });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      await storage.updateUser(user.id, { password: hashedPassword });

      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(token);

      // Send success email
      const { sendEmail, generatePasswordResetSuccessEmail } = await import('./email');
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Successful - FF Clash',
        html: generatePasswordResetSuccessEmail(user.username),
      });

      res.json({ message: "Password has been reset successfully." });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/verify-reset-token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token." });
      }

      res.json({ message: "Token is valid." });
    } catch (error: any) {
      console.error('Token verification error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // User Routes
  app.get("/api/user/profile", authenticateUser, async (req: any, res) => {
    try {
      // Get fresh user data from database
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/user/profile", authenticateUser, async (req: any, res) => {
    try {
      const { username, freeFireUID, password } = req.body;
      
      // Validate input
      if (freeFireUID && !/^\d{9}$/.test(freeFireUID)) {
        return res.status(400).json({ message: "Free Fire UID must be exactly 9 digits" });
      }

      // Check if username is already taken by another user
      if (username && username !== req.user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      // Check if Free Fire UID is already taken by another user
      if (freeFireUID && freeFireUID !== req.user.freeFireUID) {
        const existingUID = await storage.getUserByFreeFireUID(freeFireUID);
        if (existingUID) {
          return res.status(400).json({ message: "Free Fire UID already exists" });
        }
      }

      // Update user
      const updateData: any = {};
      if (username) updateData.username = username;
      if (freeFireUID) updateData.freeFireUID = freeFireUID;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await storage.updateUser(req.user.id, updateData);
      
      // Log UID change if it was changed
      if (freeFireUID && freeFireUID !== req.user.freeFireUID) {
        await storage.createUIDChangeLog({
          userId: req.user.id,
          oldUID: req.user.freeFireUID,
          newUID: freeFireUID,
          changeReason: "User self-update",
        });
      }

      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getActiveTournaments();
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tournaments/:id/join", authenticateUser, async (req: any, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      if (tournament.currentPlayers >= tournament.maxPlayers) {
        return res.status(400).json({ message: "Tournament is full" });
      }

      const userBalance = parseFloat(req.user.balance);
      const entryFee = parseFloat(tournament.entryFee);

      if (userBalance < entryFee) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Check if user is already a participant
      const existingParticipant = await storage.isUserInTournament(req.params.id, req.user.id);
      if (existingParticipant) {
        return res.status(400).json({ message: "You are already registered for this tournament" });
      }

      // Join tournament and deduct balance
      await storage.joinTournament(req.params.id, req.user.id, req.user.freeFireUID);
      await storage.updateUserBalance(req.user.id, tournament.entryFee, 'subtract');

      res.json({ message: "Successfully joined tournament" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user/tournaments", authenticateUser, async (req: any, res) => {
    try {
      const tournaments = await storage.getUserTournaments(req.user.id);
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/user/transactions", authenticateUser, async (req: any, res) => {
    try {
      const transactions = await storage.getUserTransactions(req.user.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/balance/request", authenticateUser, async (req: any, res) => {
    try {
      const requestData = insertBalanceRequestSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      // Additional validation for transaction ID length based on payment method
      const { paymentMethod, transactionId } = requestData;
      let maxLength = 10; // Default for bKash
      
      if (paymentMethod === "nagad") {
        maxLength = 8;
      } else if (paymentMethod === "rocket") {
        maxLength = 20;
      }
      
      if (transactionId.length > maxLength) {
        return res.status(400).json({ 
          message: `Transaction ID must be ${maxLength} characters or less for ${paymentMethod}` 
        });
      }

      const request = await storage.createBalanceRequest(requestData);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/user/withdraw/request", authenticateUser, async (req: any, res) => {
    try {
      const requestData = insertWithdrawRequestSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const userBalance = parseFloat(req.user.balance);
      const withdrawAmount = parseFloat(requestData.amount);

      if (userBalance < withdrawAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Validate wallet number
      const { receiverWallet } = requestData;
      if (receiverWallet.length !== 11 || !/^\d{11}$/.test(receiverWallet)) {
        return res.status(400).json({ 
          message: "Wallet number must be exactly 11 digits" 
        });
      }

      const request = await storage.createWithdrawRequest(requestData);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/wallets/active", async (req, res) => {
    try {
      const wallets = await storage.getActiveAdminWallets();
      res.json(wallets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin Routes
  app.get("/api/admin/dashboard/stats", authenticateAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/tournaments", authenticateAdmin, async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/tournaments", authenticateAdmin, async (req, res) => {
    try {
      const tournamentData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(tournamentData);
      res.json(tournament);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/admin/tournaments/:id", authenticateAdmin, async (req, res) => {
    try {
      const tournamentData = insertTournamentSchema.partial().parse(req.body);
      const tournament = await storage.updateTournament(req.params.id, tournamentData);
      res.json(tournament);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/admin/tournaments/:id/status", authenticateAdmin, async (req, res) => {
    try {
      const { status } = z.object({ 
        status: z.enum(["upcoming", "active", "started", "waiting", "finished", "completed", "cancelled"]) 
      }).parse(req.body);
      
      const tournament = await storage.updateTournament(req.params.id, { status });
      res.json(tournament);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/tournaments/:id", authenticateAdmin, async (req, res) => {
    try {
      await storage.deleteTournament(req.params.id);
      res.json({ message: "Tournament deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/balance-requests", authenticateAdmin, async (req, res) => {
    try {
      const requests = await storage.getBalanceRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/pending-requests-count", authenticateAdmin, async (req, res) => {
    try {
      const pendingBalanceRequests = await storage.getPendingBalanceRequests();
      const pendingWithdrawRequests = await storage.getPendingWithdrawRequests();
      const totalPending = pendingBalanceRequests.length + pendingWithdrawRequests.length;
      res.json({ count: totalPending });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/balance-requests/:id/status", authenticateAdmin, async (req, res) => {
    try {
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const request = await storage.updateBalanceRequestStatus(req.params.id, status);
      
      // If approved, add balance to user
      if (status === "approved") {
        await storage.updateUserBalance(request.userId, request.amount);
      }
      
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Add missing endpoints for user management and withdraw requests
  app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id/balance", authenticateAdmin, async (req, res) => {
    try {
      console.log('Balance update request:', { body: req.body, params: req.params });
      
      const { amount, operation } = z.object({ 
        amount: z.string(), 
        operation: z.enum(['add', 'subtract', 'set']).optional().default('add')
      }).parse(req.body);
      
      console.log('Parsed data:', { amount, operation, userId: req.params.id });
      
      const user = await storage.updateUserBalance(req.params.id, amount, operation);
      console.log('Updated user:', user);
      
      res.json(user);
    } catch (error: any) {
      console.error('Balance update error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id/uid", authenticateAdmin, async (req, res) => {
    try {
      const { freeFireUID, changeReason } = adminUpdateUserUIDSchema.parse(req.body);
      
      // Get current user data
      const currentUser = await storage.getUser(req.params.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if UID is already taken by another user
      if (freeFireUID !== currentUser.freeFireUID) {
        const existingUID = await storage.getUserByFreeFireUID(freeFireUID);
        if (existingUID) {
          return res.status(400).json({ message: "Free Fire UID already exists" });
        }
      }

      // Update user UID
      const user = await storage.updateUser(req.params.id, { freeFireUID });
      
      // Log UID change
      await storage.createUIDChangeLog({
        userId: req.params.id,
        oldUID: currentUser.freeFireUID,
        newUID: freeFireUID,
        changedBy: req.admin.id,
        changeReason: changeReason || "Admin update",
      });

      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/users/:id/uid-logs", authenticateAdmin, async (req, res) => {
    try {
      const logs = await storage.getUIDChangeLogs(req.params.id);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/withdraw-requests", authenticateAdmin, async (req, res) => {
    try {
      const requests = await storage.getWithdrawRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/withdraw-requests/:id/status", authenticateAdmin, async (req, res) => {
    try {
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const request = await storage.updateWithdrawRequestStatus(req.params.id, status);
      
      // If approved or completed, deduct the balance from user
      if (status === "approved" || status === "completed") {
        await storage.updateUserBalance(request.userId, request.amount, 'subtract');
      }
      // If rejected, refund the balance to user (in case it was already deducted)
      else if (status === "rejected") {
        await storage.updateUserBalance(request.userId, request.amount, 'add');
      }
      
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/wallets", authenticateAdmin, async (req, res) => {
    try {
      const wallets = await storage.getAdminWallets();
      res.json(wallets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/wallets", authenticateAdmin, async (req, res) => {
    try {
      const walletData = insertAdminWalletSchema.parse(req.body);
      const wallet = await storage.upsertAdminWallet(walletData);
      res.json(wallet);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // System Settings Routes
  app.get("/api/admin/settings", authenticateAdmin, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/settings/:key", authenticateAdmin, async (req, res) => {
    try {
      const setting = await storage.getSystemSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/settings", authenticateAdmin, async (req, res) => {
    try {
      const settingData = insertSystemSettingSchema.parse(req.body);
      const setting = await storage.upsertSystemSetting(settingData);
      res.json(setting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/admin/settings/:key", authenticateAdmin, async (req, res) => {
    try {
      const updateData = updateSystemSettingSchema.parse(req.body);
      const setting = await storage.upsertSystemSetting({
        key: req.params.key,
        value: updateData.value,
        description: updateData.description,
      });
      res.json(setting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Social media settings endpoints (public)
  app.get("/api/social-media", async (req, res) => {
    try {
      const facebook = await storage.getSystemSetting("social_facebook");
      const telegram = await storage.getSystemSetting("social_telegram");
      const whatsapp = await storage.getSystemSetting("social_whatsapp");
      
      res.json({
        facebook: facebook?.value || "",
        telegram: telegram?.value || "",
        whatsapp: whatsapp?.value || "",
      });
    } catch (error) {
      console.error("Error fetching social media settings:", error);
      res.status(500).json({ error: "Failed to fetch social media settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
