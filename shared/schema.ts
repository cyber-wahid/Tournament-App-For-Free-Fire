import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, int, decimal, timestamp, boolean, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const paymentMethodEnum = mysqlEnum("payment_method", ["bkash", "nagad", "rocket"]);
export const requestStatusEnum = mysqlEnum("request_status", ["pending", "approved", "rejected", "completed"]);
export const tournamentStatusEnum = mysqlEnum("tournament_status", ["upcoming", "active", "started", "waiting", "finished", "completed", "cancelled"]);
export const gameTypeEnum = mysqlEnum("game_type", ["battle_royale", "clash_squad", "lone_wolf"]);
export const teamFormationEnum = mysqlEnum("team_formation", ["solo", "duo", "squad", "1v1", "2v2", "4v4"]);

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  freeFireUID: varchar("free_fire_uid", { length: 9 }).notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admins table
export const admins = mysqlTable("admins", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tournaments table
export const tournaments = mysqlTable("tournaments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  gameType: gameTypeEnum.notNull(),
  teamFormation: teamFormationEnum.default("solo").notNull(),
  maxPlayers: int("max_players").default(50).notNull(),
  currentPlayers: int("current_players").default(0).notNull(),
  entryFee: decimal("entry_fee", { precision: 10, scale: 2 }).notNull(),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).notNull(),
  roomId: varchar("room_id", { length: 50 }),
  roomPassword: varchar("room_password", { length: 50 }),
  status: tournamentStatusEnum.default("upcoming").notNull(),
  startTime: timestamp("start_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tournament participants table
export const tournamentParticipants = mysqlTable("tournament_participants", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  tournamentId: varchar("tournament_id", { length: 36 }).references(() => tournaments.id).notNull(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  freeFireUID: varchar("free_fire_uid", { length: 9 }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Balance requests table
export const balanceRequests = mysqlTable("balance_requests", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum.notNull(),
  senderWallet: varchar("sender_wallet", { length: 20 }).notNull(),
  transactionId: varchar("transaction_id", { length: 100 }).notNull(),
  status: requestStatusEnum.default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Withdraw requests table
export const withdrawRequests = mysqlTable("withdraw_requests", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum.notNull(),
  receiverWallet: varchar("receiver_wallet", { length: 20 }).notNull(),
  status: requestStatusEnum.default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin wallet settings table
export const adminWallets = mysqlTable("admin_wallets", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  paymentMethod: paymentMethodEnum.notNull().unique(),
  walletNumber: varchar("wallet_number", { length: 20 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// System settings table
export const systemSettings = mysqlTable("system_settings", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// UID change logs table for admin tracking
export const uidChangeLogs = mysqlTable("uid_change_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  oldUID: varchar("old_uid", { length: 9 }),
  newUID: varchar("new_uid", { length: 9 }).notNull(),
  changedBy: varchar("changed_by", { length: 36 }).references(() => admins.id),
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password reset tokens table
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tournamentParticipants: many(tournamentParticipants),
  balanceRequests: many(balanceRequests),
  withdrawRequests: many(withdrawRequests),
  uidChangeLogs: many(uidChangeLogs),
  passwordResetTokens: many(passwordResetTokens),
}));

export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  participants: many(tournamentParticipants),
}));

export const tournamentParticipantsRelations = relations(tournamentParticipants, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentParticipants.tournamentId],
    references: [tournaments.id],
  }),
  user: one(users, {
    fields: [tournamentParticipants.userId],
    references: [users.id],
  }),
}));

export const balanceRequestsRelations = relations(balanceRequests, ({ one }) => ({
  user: one(users, {
    fields: [balanceRequests.userId],
    references: [users.id],
  }),
}));

export const withdrawRequestsRelations = relations(withdrawRequests, ({ one }) => ({
  user: one(users, {
    fields: [withdrawRequests.userId],
    references: [users.id],
  }),
}));

export const uidChangeLogsRelations = relations(uidChangeLogs, ({ one }) => ({
  user: one(users, {
    fields: [uidChangeLogs.userId],
    references: [users.id],
  }),
  admin: one(admins, {
    fields: [uidChangeLogs.changedBy],
    references: [admins.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  balance: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  freeFireUID: z.string().length(9, "Free Fire UID must be exactly 9 digits").refine((val) => /^\d{9}$/.test(val), "Free Fire UID must contain exactly 9 numbers"),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  gameType: z.enum(["battle_royale", "clash_squad", "lone_wolf"]),
  teamFormation: z.enum(["solo", "duo", "squad", "1v1", "2v2", "4v4"]),
  maxPlayers: z.number().min(1, "Max players must be at least 1"),
  entryFee: z.string().min(1, "Entry fee is required"),
  prizePool: z.string().min(1, "Prize pool is required"),
  roomId: z.string().optional(),
  roomPassword: z.string().optional(),
  startTime: z.string().min(1, "Start time is required").transform((val) => new Date(val)),
});

export const insertBalanceRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.string().min(1, "Amount is required"),
  paymentMethod: z.enum(["bkash", "nagad", "rocket"]),
  senderWallet: z.string().min(1, "Sender wallet is required").max(11, "Wallet number must be 11 digits").refine((val) => /^\d{11}$/.test(val), "Wallet number must be exactly 11 digits"),
  transactionId: z.string().min(1, "Transaction ID is required"),
});

export const insertWithdrawRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.string().min(1, "Amount is required"),
  paymentMethod: z.enum(["bkash", "nagad", "rocket"]),
  receiverWallet: z.string().min(1, "Receiver wallet is required").max(11, "Wallet number must be 11 digits").refine((val) => /^\d{11}$/.test(val), "Wallet number must be exactly 11 digits"),
});

export const insertAdminWalletSchema = createInsertSchema(adminWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSystemSettingSchema = z.object({
  value: z.string().min(1, "Value is required"),
  description: z.string().optional(),
});

export const updateUserUIDSchema = z.object({
  freeFireUID: z.string().length(9, "Free Fire UID must be exactly 9 digits").refine((val) => /^\d{9}$/.test(val), "Free Fire UID must contain exactly 9 numbers"),
});

export const adminUpdateUserUIDSchema = z.object({
  freeFireUID: z.string().length(9, "Free Fire UID must be exactly 9 digits").refine((val) => /^\d{9}$/.test(val), "Free Fire UID must contain exactly 9 numbers"),
  changeReason: z.string().optional(),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Login schemas
export const userLoginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type BalanceRequest = typeof balanceRequests.$inferSelect;
export type InsertBalanceRequest = z.infer<typeof insertBalanceRequestSchema>;
export type WithdrawRequest = typeof withdrawRequests.$inferSelect;
export type InsertWithdrawRequest = z.infer<typeof insertWithdrawRequestSchema>;
export type AdminWallet = typeof adminWallets.$inferSelect;
export type InsertAdminWallet = z.infer<typeof insertAdminWalletSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
export type UIDChangeLog = typeof uidChangeLogs.$inferSelect;
export type InsertUIDChangeLog = typeof uidChangeLogs.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
export type UpdateUserUID = z.infer<typeof updateUserUIDSchema>;
export type AdminUpdateUserUID = z.infer<typeof adminUpdateUserUIDSchema>;
export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;

