import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

const users = pgTable("users", {
  user_id: varchar("user_id", { length: 36 }).primaryKey().notNull(),
  username: text("username").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  password: text("password").notNull(),
  role: varchar("role", { length: 10 }).notNull().default("user"), // Use VARCHAR instead of ENUM
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  is_verified: boolean("is_verified").default(false),
  verification_token: text("verification_token").default(null),
  vt_created_at: timestamp("vt_created_at").defaultNow(),
  vt_gen_count: integer("vt_gen_count").default(0),
  refresh_token: text("refresh_token").notNull(),
  reset_token: text("reset_token").default(null),
  rt_created_at: timestamp("rt_created_at").defaultNow(),
  last_login: timestamp("last_login").defaultNow()
});

export default users;
