import mysql from 'mysql2/promise';

let pool;

export async function getConnection() {
  if (!pool) {
    if (process.env.DATABASE_URL) {
      pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
    } else {
      if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
        throw new Error(
          'Configuración de base de datos incompleta. ' +
          'Proporciona DATABASE_URL o (DB_HOST, DB_USER, DB_NAME)'
        );
      }

      pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Pool de conexiones MySQL creado');
    }
  }
  return pool;
}

export async function query(sql, params) {
  const connection = await getConnection();
  const [results] = await connection.execute(sql, params);
  return results;
}

export async function transaction(callback) {
  const connection = await getConnection();
  const conn = await connection.getConnection();

  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
