import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import fp from 'fastify-plugin';
import config from '../configs/config.js';


const drizzlePlugin = fp (async (fastify) => {
    const queryClient = await mysql.createConnection({
      host: config.DB_HOST,
      user: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      port: config.DB_PORT,
      database: config.DB_NAME,
    });
    const db = drizzle(queryClient)
    fastify.decorate('db', db)
})

export default drizzlePlugin