const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'librastech_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} catch (error) {
  console.warn('[DB] Não foi possível criar o Pool de conexões MySQL:', error.message);
}

async function testarConexao() {
  if (!pool) return false;
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('[DB] Conexão MySQL estabelecida com sucesso.');
    return true;
  } catch (err) {
    console.warn('[DB] Falha ao conectar no MySQL. O sistema usará dados demonstrativos.', err.message);
    return false;
  }
}

module.exports = {
  pool,
  testarConexao
};