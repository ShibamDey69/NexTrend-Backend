import config from './src/configs/config.js'

export default {
    dialect: 'mysql',
    dbCredentials: {
      host: config.DB_HOST,
      user: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      port: config.DB_PORT,
      database: config.DB_NAME,
      ssl: {
        rejectUnauthorized: true,
      }
    },
    schema: './src/models/users.js',
    out: './src/schemas/',
}
