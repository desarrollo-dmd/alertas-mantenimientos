const pg = require("pg");
require("dotenv").config();

const { Pool } = pg;

// Configuración del Pool de conexión DB TLMY (Postgres)
const dbTLMY = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Manejo de errores en la conexión Postgres
dbTLMY.on("error", (err) => {
    console.error("Error en el Pool de conexión Postgres:", err);
});

// Obtener las salas a las que pertenece cada equipo, agrupando los cod_articu por sala
async function getRoomsForEquipments(equipments) {
    if (!Array.isArray(equipments) || equipments.length === 0) return {};

    const idToCodMap = {};
    const ids = equipments.map(e => {
        const numericId = parseInt(e.cod_articu.replace(/\D/g, ''), 10);
        if (!isNaN(numericId)) {
            idToCodMap[numericId] = e.cod_articu;
            return numericId;
        }
        return null;
    }).filter(id => id !== null);

    if (ids.length === 0) return {};

    try {
        const query = `
            SELECT room_name, idcompressors
            FROM rooms.rooms_equipments
            WHERE idcompressors && $1::int[]
        `;
        const { rows } = await dbTLMY.query(query, [ids]);

        const roomsMap = {};

        rows.forEach(row => {
            row.idcompressors.forEach(id => {
                const cod_articu = idToCodMap[id];
                if (cod_articu) {
                    if (!roomsMap[row.room_name]) {
                        roomsMap[row.room_name] = [];
                    }
                    roomsMap[row.room_name].push(cod_articu);
                }
            });
        });

        return roomsMap;
    } catch (err) {
        console.error("Error al obtener salas:", err);
        return {};
    }
}

// Obtener los id de clientes que tienen asignada cada sala
async function getIdClientsForRoom(roomsObj) {
    if (!roomsObj || typeof roomsObj !== "object") return {};

    const roomNames = Object.keys(roomsObj);

    if (roomNames.length === 0) return {};

    try {
        const query = `
      SELECT id_user, room_name
      FROM rooms.relations
      WHERE room_name = ANY($1::text[])
    `;
        const { rows } = await dbTLMY.query(query, [roomNames]);
        const result = {};

        rows.forEach(row => {
            const { id_user, room_name } = row;

            if (!result[id_user]) {
                result[id_user] = {
                    room_name,
                    equipments: []
                };
            }

            result[id_user].equipments.push(...roomsObj[room_name]);
        });

        return result;
    } catch (err) {
        console.error("Error al obtener clientes:", err);
        return {};
    }
}

// Obtener los emails de cada cliente
async function getEmailsForClients(clientsObj) {
    if (!clientsObj || typeof clientsObj !== "object") return {};

    const ids = Object.keys(clientsObj);

    if (ids.length === 0) return {};

    try {
        const query = `
      SELECT email, id
      FROM users.users
      WHERE id = ANY($1::int[]) AND email IS NOT NULL
    `;
        const { rows } = await dbTLMY.query(query, [ids]);

        const emailMap = {};
        rows.forEach(row => {
            emailMap[row.id] = row.email;
        });

        const result = {};
        Object.entries(clientsObj).forEach(([id, data]) => {
            result[id] = {
                ...data,
                email: emailMap[id] || null
            };
        });

        return result;
    } catch (err) {
        console.error("Error al obtener emails:", err);
        return {};
    }
}


module.exports = { getRoomsForEquipments, getIdClientsForRoom, getEmailsForClients };












