import {
  users,
  admins,
  tournaments,
  tournamentParticipants,
  balanceRequests,
  withdrawRequests,
  adminWallets,
  systemSettings,
  uidChangeLogs,
  passwordResetTokens,
  type User,
  type InsertUser,
  type Admin,
  type InsertAdmin,
  type Tournament,
  type InsertTournament,
  type TournamentParticipant,
  type BalanceRequest,
  type InsertBalanceRequest,
  type WithdrawRequest,
  type InsertWithdrawRequest,
  type AdminWallet,
  type InsertAdminWallet,
  type SystemSetting,
  type InsertSystemSetting,
  type UIDChangeLog,
  type InsertUIDChangeLog,
  type PasswordResetToken,
  type InsertPasswordResetToken,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined>;
  getUserByFreeFireUID(freeFireUID: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserBalance(userId: string, amount: string, operation?: 'add' | 'subtract' | 'set'): Promise<User>;

  // Admin operations
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Tournament operations
  getTournaments(): Promise<Tournament[]>;
  getActiveTournaments(): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, tournament: Partial<Tournament>): Promise<Tournament>;
  deleteTournament(id: string): Promise<void>;
  joinTournament(tournamentId: string, userId: string, freeFireUID?: string): Promise<void>;
  isUserInTournament(tournamentId: string, userId: string): Promise<boolean>;
  getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]>;
  getUserTournaments(userId: string): Promise<Tournament[]>;

  // Balance request operations
  getBalanceRequests(): Promise<BalanceRequest[]>;
  getPendingBalanceRequests(): Promise<BalanceRequest[]>;
  createBalanceRequest(request: InsertBalanceRequest): Promise<BalanceRequest>;
  updateBalanceRequestStatus(id: string, status: string): Promise<BalanceRequest>;

  // Withdraw request operations
  getWithdrawRequests(): Promise<WithdrawRequest[]>;
  getPendingWithdrawRequests(): Promise<WithdrawRequest[]>;
  createWithdrawRequest(request: InsertWithdrawRequest): Promise<WithdrawRequest>;
  updateWithdrawRequestStatus(id: string, status: string): Promise<WithdrawRequest>;

  // Admin wallet operations
  getAdminWallets(): Promise<AdminWallet[]>;
  getActiveAdminWallets(): Promise<AdminWallet[]>;
  upsertAdminWallet(wallet: InsertAdminWallet): Promise<AdminWallet>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeTournaments: number;
    pendingRequests: number;
    totalRevenue: string;
  }>;

  // User transactions
  getUserTransactions(userId: string): Promise<{
    balanceRequests: BalanceRequest[];
    withdrawRequests: WithdrawRequest[];
  }>;

  // System settings operations
  getSystemSettings(): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;

  // UID change log operations
  createUIDChangeLog(log: InsertUIDChangeLog): Promise<UIDChangeLog>;
  getUIDChangeLogs(userId: string): Promise<UIDChangeLog[]>;

  // Password reset operations
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(token: string): Promise<void>;
  deleteExpiredPasswordResetTokens(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(sql`${users.username} = ${usernameOrEmail} OR ${users.email} = ${usernameOrEmail}`);
    return user;
  }

  async getUserByFreeFireUID(freeFireUID: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.freeFireUID, freeFireUID));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    await db.insert(users).values(user);
    const [created] = await db.select().from(users).where(eq(users.username, user.username)).limit(1);
    return created;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await db.update(users).set({ ...userData, updatedAt: new Date() }).where(eq(users.id, id));
    const [updated] = await db.select().from(users).where(eq(users.id, id));
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(sql`${users.createdAt} DESC`);
  }

  async updateUserBalance(userId: string, amount: string | number, operation: 'add' | 'subtract' | 'set' = 'add'): Promise<User> {
    console.log('Storage updateUserBalance called:', { userId, amount, operation });
    
    let updateExpression;
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    console.log('Numeric amount:', numericAmount);
    
    switch (operation) {
      case 'add':
        updateExpression = sql`${users.balance} + ${numericAmount}`;
        break;
      case 'subtract':
        updateExpression = sql`${users.balance} - ${numericAmount}`;
        break;
      case 'set':
        updateExpression = sql`${numericAmount}`;
        break;
      default:
        updateExpression = sql`${users.balance} + ${numericAmount}`;
    }

    console.log('Update expression:', updateExpression);

    await db
      .update(users)
      .set({ 
        balance: updateExpression,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    const [updated] = await db.select().from(users).where(eq(users.id, userId));
    console.log('Updated user from database:', updated);
    return updated;
  }

  // Admin operations
  async getAdmin(id: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    await db.insert(admins).values(admin);
    const [created] = await db.select().from(admins).where(eq(admins.username, admin.username)).limit(1);
    return created;
  }

  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(sql`${tournaments.createdAt} DESC`);
  }

  async getActiveTournaments(): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(sql`${tournaments.status} IN ('upcoming', 'active')`)
      .orderBy(tournaments.startTime);
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    await db.insert(tournaments).values(tournament);
    const [created] = await db.select().from(tournaments).where(eq(tournaments.title, tournament.title)).orderBy(sql`${tournaments.createdAt} DESC`).limit(1);
    return created;
  }

  async updateTournament(id: string, tournament: Partial<Tournament>): Promise<Tournament> {
    await db
      .update(tournaments)
      .set({ ...tournament, updatedAt: new Date() })
      .where(eq(tournaments.id, id));
    
    const [updated] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return updated;
  }

  async deleteTournament(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // First delete all participants
      await tx.delete(tournamentParticipants).where(eq(tournamentParticipants.tournamentId, id));
      
      // Then delete the tournament
      await tx.delete(tournaments).where(eq(tournaments.id, id));
    });
  }

  async joinTournament(tournamentId: string, userId: string, freeFireUID?: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Add participant
      await tx.insert(tournamentParticipants).values({
        tournamentId,
        userId,
        freeFireUID,
      });

      // Update current players count
      await tx
        .update(tournaments)
        .set({ 
          currentPlayers: sql`${tournaments.currentPlayers} + 1`,
          updatedAt: new Date()
        })
        .where(eq(tournaments.id, tournamentId));
    });
  }

  async isUserInTournament(tournamentId: string, userId: string): Promise<boolean> {
    const [participant] = await db
      .select()
      .from(tournamentParticipants)
      .where(and(eq(tournamentParticipants.tournamentId, tournamentId), eq(tournamentParticipants.userId, userId)));
    
    return !!participant;
  }

  async getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    return await db
      .select()
      .from(tournamentParticipants)
      .where(eq(tournamentParticipants.tournamentId, tournamentId))
      .orderBy(tournamentParticipants.joinedAt);
  }

  async getUserTournaments(userId: string): Promise<Tournament[]> {
    return await db
      .select({
        id: tournaments.id,
        title: tournaments.title,
        description: tournaments.description,
        gameType: tournaments.gameType,
        teamFormation: tournaments.teamFormation,
        maxPlayers: tournaments.maxPlayers,
        currentPlayers: tournaments.currentPlayers,
        entryFee: tournaments.entryFee,
        prizePool: tournaments.prizePool,
        roomId: tournaments.roomId,
        roomPassword: tournaments.roomPassword,
        status: tournaments.status,
        startTime: tournaments.startTime,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
      })
      .from(tournaments)
      .innerJoin(tournamentParticipants, eq(tournaments.id, tournamentParticipants.tournamentId))
      .where(eq(tournamentParticipants.userId, userId))
      .orderBy(sql`${tournaments.startTime} DESC`);
  }

  // Balance request operations
  async getBalanceRequests(): Promise<BalanceRequest[]> {
    return await db.select().from(balanceRequests).orderBy(sql`${balanceRequests.createdAt} DESC`);
  }

  async getPendingBalanceRequests(): Promise<BalanceRequest[]> {
    return await db
      .select()
      .from(balanceRequests)
      .where(eq(balanceRequests.status, "pending"))
      .orderBy(balanceRequests.createdAt);
  }

  async createBalanceRequest(request: InsertBalanceRequest): Promise<BalanceRequest> {
    await db.insert(balanceRequests).values(request);
    const [created] = await db.select().from(balanceRequests).where(eq(balanceRequests.userId, request.userId)).orderBy(sql`${balanceRequests.createdAt} DESC`).limit(1);
    return created;
  }

  async updateBalanceRequestStatus(id: string, status: string): Promise<BalanceRequest> {
    await db
      .update(balanceRequests)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(balanceRequests.id, id));
    
    const [updated] = await db.select().from(balanceRequests).where(eq(balanceRequests.id, id));
    return updated;
  }

  // Withdraw request operations
  async getWithdrawRequests(): Promise<WithdrawRequest[]> {
    return await db.select().from(withdrawRequests).orderBy(sql`${withdrawRequests.createdAt} DESC`);
  }

  async getPendingWithdrawRequests(): Promise<WithdrawRequest[]> {
    return await db
      .select()
      .from(withdrawRequests)
      .where(eq(withdrawRequests.status, "pending"))
      .orderBy(withdrawRequests.createdAt);
  }

  async createWithdrawRequest(request: InsertWithdrawRequest): Promise<WithdrawRequest> {
    await db.insert(withdrawRequests).values(request);
    const [created] = await db.select().from(withdrawRequests).where(eq(withdrawRequests.userId, request.userId)).orderBy(sql`${withdrawRequests.createdAt} DESC`).limit(1);
    return created;
  }

  async updateWithdrawRequestStatus(id: string, status: string): Promise<WithdrawRequest> {
    await db
      .update(withdrawRequests)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(withdrawRequests.id, id));
    
    const [updated] = await db.select().from(withdrawRequests).where(eq(withdrawRequests.id, id));
    return updated;
  }

  // Admin wallet operations
  async getAdminWallets(): Promise<AdminWallet[]> {
    return await db.select().from(adminWallets).orderBy(adminWallets.paymentMethod);
  }

  async getActiveAdminWallets(): Promise<AdminWallet[]> {
    return await db
      .select()
      .from(adminWallets)
      .where(eq(adminWallets.isActive, true))
      .orderBy(adminWallets.paymentMethod);
  }

  async upsertAdminWallet(wallet: InsertAdminWallet): Promise<AdminWallet> {
    // Check if wallet exists
    const existingWallet = await db
      .select()
      .from(adminWallets)
      .where(eq(adminWallets.paymentMethod, wallet.paymentMethod))
      .limit(1);

    if (existingWallet.length > 0) {
      // Update existing wallet
      await db
        .update(adminWallets)
        .set({
          walletNumber: wallet.walletNumber,
          isActive: wallet.isActive,
          updatedAt: new Date(),
        })
        .where(eq(adminWallets.paymentMethod, wallet.paymentMethod));
      
      const [updated] = await db
        .select()
        .from(adminWallets)
        .where(eq(adminWallets.paymentMethod, wallet.paymentMethod));
      return updated;
    } else {
      // Insert new wallet
      await db.insert(adminWallets).values(wallet);
      const [created] = await db
        .select()
        .from(adminWallets)
        .where(eq(adminWallets.paymentMethod, wallet.paymentMethod));
      return created;
    }
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeTournaments: number;
    pendingRequests: number;
    totalRevenue: string;
  }> {
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [tournamentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tournaments)
      .where(sql`${tournaments.status} IN ('upcoming', 'active')`);

    const [balanceRequestCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(balanceRequests)
      .where(eq(balanceRequests.status, "pending"));

    const [withdrawRequestCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(withdrawRequests)
      .where(eq(withdrawRequests.status, "pending"));

    const [revenueData] = await db
      .select({ total: sql<string>`COALESCE(SUM(${tournaments.entryFee} * ${tournaments.currentPlayers}), 0)` })
      .from(tournaments);

    return {
      totalUsers: userCount.count,
      activeTournaments: tournamentCount.count,
      pendingRequests: balanceRequestCount.count + withdrawRequestCount.count,
      totalRevenue: revenueData.total || "0",
    };
  }

  // User transactions
  async getUserTransactions(userId: string): Promise<{
    balanceRequests: BalanceRequest[];
    withdrawRequests: WithdrawRequest[];
  }> {
    const userBalanceRequests = await db
      .select()
      .from(balanceRequests)
      .where(eq(balanceRequests.userId, userId))
      .orderBy(sql`${balanceRequests.createdAt} DESC`);

    const userWithdrawRequests = await db
      .select()
      .from(withdrawRequests)
      .where(eq(withdrawRequests.userId, userId))
      .orderBy(sql`${withdrawRequests.createdAt} DESC`);

    return {
      balanceRequests: userBalanceRequests,
      withdrawRequests: userWithdrawRequests,
    };
  }

  // System settings operations
  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings).orderBy(systemSettings.key);
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async upsertSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    // Check if setting exists
    const existingSetting = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, setting.key))
      .limit(1);

    if (existingSetting.length > 0) {
      // Update existing setting
      await db
        .update(systemSettings)
        .set({
          value: setting.value,
          description: setting.description,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.key, setting.key));
      
      const [updated] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, setting.key));
      return updated;
    } else {
      // Insert new setting
      await db.insert(systemSettings).values(setting);
      const [created] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, setting.key));
      return created;
    }
  }

  // UID change log operations
  async createUIDChangeLog(log: InsertUIDChangeLog): Promise<UIDChangeLog> {
    await db.insert(uidChangeLogs).values(log);
    const [created] = await db
      .select()
      .from(uidChangeLogs)
      .where(eq(uidChangeLogs.userId, log.userId))
      .orderBy(sql`${uidChangeLogs.createdAt} DESC`)
      .limit(1);
    return created;
  }

  async getUIDChangeLogs(userId: string): Promise<UIDChangeLog[]> {
    return await db
      .select()
      .from(uidChangeLogs)
      .where(eq(uidChangeLogs.userId, userId))
      .orderBy(sql`${uidChangeLogs.createdAt} DESC`);
  }

  // Password reset operations
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    await db.insert(passwordResetTokens).values(token);
    const [created] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token.token))
      .limit(1);
    return created;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        sql`${passwordResetTokens.expiresAt} > NOW()`
      ));
    
    return resetToken;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(sql`${passwordResetTokens.expiresAt} < NOW() OR ${passwordResetTokens.used} = true`);
  }
}

export const storage = new DatabaseStorage();
