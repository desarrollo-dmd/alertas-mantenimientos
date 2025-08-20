const pg = require("pg");
const sql = require("mssql");
require("dotenv").config();

// Configuración de conexión DB TANGO (SQL Server)
const dbTango = {
    user: process.env.DBTANGO_USER,
    password: process.env.DBTANGO_PASSWORD,
    server: process.env.DBTANGO_HOST,
    database: process.env.DBTANGO_NAME,
    port: parseInt(process.env.DBTANGO_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

let pool;

async function initPool() {
    try {
        pool = await sql.connect(dbTango);
        console.log("Pool de conexiones SQL Server inicializado");
    } catch (err) {
        console.error("Error al inicializar el pool SQL Server:", err);
    }
}

async function closePool() {
    if (pool) {
        await pool.close();
        console.log("Pool de conexiones SQL Server cerrado");
    }
}

function getPool() {
    if (!pool) {
        throw new Error("El pool SQL Server no está inicializado");
    }
    return pool;
}

async function getDatesNextManteinances() {
    await initPool();
    const dbTANGO = await getPool();

    try {
        const request = dbTANGO.request();
        const query = `
        SELECT cod_articu, [FH PROX MP]
        FROM dbo.CZSTA11_DATOS_ADICIONALES_DMD 
        WHERE [FH PROX MP] IS NOT NULL
      `;
        const res = await request.query(query);
        return res.recordset;

    } catch (err) {
        throw new Error(`Error al obtener datos de la vista CZSTA11_DATOS_ADICIONALES_DMD: ${err.message}`);
    }
}

module.exports = { getDatesNextManteinances };
