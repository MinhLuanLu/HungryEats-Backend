import { Make_Query } from "../../database/databaseConnection.js";
import newOrderHandler from "./orderHandler.js";
import { socketConfig } from "../../config.js";


async function UserSocketHandler(socket, io) {
    // =================== Handle sending order to Store and sender back to buyer ================= //
    socket.on(socketConfig.processOrder ,async (order)=>{
        newOrderHandler(order, socket, io)
    });

    // ========= Request the Store status when user click on the marker, Handle update store Status on socketio check if store is open/close so the store description will show up or not ======== //
    socket.on('Store_status', async (data)=>{
        try{
            const [get_store_status] = await Make_Query(`SELECT Status FROM Stores WHERE Store_name = '${data?.Store_name}'`)
            socket.emit('Store_status', get_store_status)
            console.info(`Request Status for ${data?.Store_name} successfully...`)
        }
        catch(error){
            console.debug(error)
        };
    });
    // ================================================================================================================ //
}


export default UserSocketHandler;