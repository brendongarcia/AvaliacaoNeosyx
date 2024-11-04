import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pgConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10), // Convert to number
    max: 10, // number of maximum connections in the pool
    idleTimeoutMillis: 30000 // wait time before disconnecting a client
};

const pool = new Pool(pgConfig);

async function query(queryText: string, params: any[] = []) {
    const client = await pool.connect();
    try {
        const res = await client.query(queryText, params);
        
        // console.log("Resultado da consulta:", res.rows);
        return res;
    } finally {
        client.release();
    }
}

export { query };


// query("SELECT * FROM users").then(() => {
//   console.log("Teste de query executado.");
// }).catch(err => {
//   console.error("Erro ao executar teste de query:", err);
// });