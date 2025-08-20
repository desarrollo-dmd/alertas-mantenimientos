const { processAndSendEmails } = require("./mailer");
const { getDatesNextManteinances } = require("./dbTango");
const { getRoomsForEquipments, getIdClientsForRoom, getEmailsForClients } = require("./dbTLMY");
const { filterEquipments } = require("./utils");

async function mainLoop() {
    try {
        console.log("Iniciando Script de Mantenimiento");

        // 1. Obtenemos los próximos mantenimientos
        const datesLastManteinance = await getDatesNextManteinances();

        // 2. Filtramos los equipos que tienen un mantenimiento próximo dentro de los 15 o 30 días
        const filteredEquipments = filterEquipments(datesLastManteinance);

        // 3. Obtenemos los equipos que pertenecen a cada sala
        const roomsEquipments = await getRoomsForEquipments(filteredEquipments);

        // 4. Obtenemos los id de clientes que tienen asignada cada sala
        const clientsObj = await getIdClientsForRoom(roomsEquipments);

        // 5. Obtenemos los emails de cada cliente
        const emailsObj = await getEmailsForClients(clientsObj);

        // 6. Procesamos y enviamos los emails
        await processAndSendEmails(emailsObj);

    } catch (err) {
        console.error("Error en mainLoop:", err);
    } finally {
        // 7. Repetir la función en 24 horas (1000ms * 60s * 60m * 24h)
        setTimeout(mainLoop, 1000 * 60 * 60 * 24);
    }
}

mainLoop();