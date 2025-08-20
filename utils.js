function isExactly15Or30Days(dateStr) {
    // dateStr viene en formato 'dd/MM/yyyy'
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    // Elimina la parte de tiempo para evitar errores por horas/minutos
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffTime = date - today; // diferencia en ms
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // convertir a días

    return diffDays === 15 || diffDays === 30;
}


function filterEquipments(equipments) {
    if (!Array.isArray(equipments) || equipments.length === 0) {
        return [];
    }

    return equipments.filter(e => {
        const fecha = e['FH PROX MP'];
        if (!fecha) return false;
        return isExactly15Or30Days(fecha);
    });
}


module.exports = { filterEquipments };