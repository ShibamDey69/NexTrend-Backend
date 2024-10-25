import config from './src/configs/config.js'

export default {
    dialect: 'postgresql',
    dbCredentials:  {
        url: config.DB_URL,
      },
    schema: './src/models/users.js',
    out: './src/schemas/',
}
