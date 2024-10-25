import fp from 'fastify-plugin';
import config from '../configs/config.js';
import * as userSchema from '../models/users.js';
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const drizzlePlugin = fp (async (fastify) => {
  const connectionString = config.DB_URL
  const client = postgres(connectionString, { prepare: false })
    const db = drizzle(client,{schema: userSchema, mode:'default'});
    fastify.decorate('db', db)
})

export default drizzlePlugin