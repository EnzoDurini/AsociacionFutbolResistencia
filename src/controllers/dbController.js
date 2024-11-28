import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
     options:{
        encrypt: true, // for azure
     },};

let pool

export const getConnection = async() => {
    try {
        if (!pool)
            pool = await sql.connect(dbConfig);
            return pool;
    } catch (error) {
        console.error('Error al conectar a la base de datos', error);
        throw error
    }
}

export const closeConnection = async () => {
    try {
      if (pool) {
        await pool.close();
        console.log('Conexión a SQL Server cerrada');
        pool = null;
      }
    } catch (error) {
      console.error('Error al cerrar la conexión:', error.message);
    }
 };