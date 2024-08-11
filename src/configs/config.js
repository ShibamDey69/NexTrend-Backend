import dotenv from 'dotenv'
dotenv.config();

export default {
    NODE_ENV: process.env.NODE_ENV || 'development',
    SERVER_HOST: process.env.SERVER_HOST || '0.0.0.0',
    SERVER_PORT: process.env.SERVER_PORT || 8080,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_URL: process.env.DB_URL,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    JWT_SECRET: process.env.JWT_SECRET,
}
