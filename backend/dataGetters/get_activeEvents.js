const mongoose = require("mongoose");
const eventSchema = require("../schema/eventSchema");

async function getActiveEvents() {
    // 1. Configuración de conexión
    const EventsDB = mongoose.createConnection("mongodb://localhost:27017/HtmlContent");
    const Events = EventsDB.model("eventos", eventSchema);
    
    // 2. Fecha actual
    const now = new Date(); 

    try {
        // Traer todos los eventos
        const allEvents = await Events.find({}); 

        // Filtrar en JavaScript (Temporal debido al error de mongoose en consulta de la base de datos)
        const activeEvents = allEvents.filter(event => {

            const startDate = new Date(event.startTime);
            const endDate = new Date(event.endTime);
            
            // Eventos en los que la fecha de inicio es menor que ahora y la fecha de terminacion es mayor que ahora
            return startDate < now && endDate > now;
        });
        
        if (activeEvents.length === 0) {
            // console.log("No se encontraron eventos activos después del filtrado.");
            return [];
        }
        
        return activeEvents;
        
    } catch (error) {
        console.error("Error al buscar y filtrar eventos:", error);
        throw error;
    } finally {
        // Asegura que la conexión se cierre
        await EventsDB.close(); 
    }
}


module.exports = { getActiveEvents }