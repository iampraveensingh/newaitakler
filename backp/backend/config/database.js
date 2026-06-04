import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expressive_voice',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const testConnection = async () => {
  try {
    const conn = await db.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};
