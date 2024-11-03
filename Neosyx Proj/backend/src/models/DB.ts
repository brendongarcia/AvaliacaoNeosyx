import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function query(queryString: string) {
  try {
    const pool = await sql.connect(sqlConfig);
    console.log("Conectado ao banco de dados com sucesso!");
    
    const result = await pool.query(queryString);
    console.log("Resultado da consulta:", result.recordset); // Imprimindo o resultado da consulta
    
    return result;
  } catch (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    throw err;
  }
}

export { query };
module.exports = { query };

// // Testando a consulta
// query("SELECT * FROM users").then(() => {
//   console.log("Teste de query executado.");
// }).catch(err => {
//   console.error("Erro ao executar teste de query:", err);
// });
