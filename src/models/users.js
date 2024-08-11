import { mysqlTable, text, timestamp, varchar, boolean } from 'drizzle-orm/mysql-core';

const users = mysqlTable('users', {
  user_id: varchar('user_id', { length: 36 }).primaryKey().notNull(),
  username: text('username').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  password: text('password').notNull(),
  role: varchar('role', { enum: ['user', 'admin'] }).default('user'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  is_verified: boolean('is_verified').default(false),
  verification_token: text('verification_token').notNull(),
  refresh_token: text('refresh_token').default(''),
  forget_token: text('forget_token').default(''),
  last_login: timestamp('last_login').defaultNow()
});

export default users;

