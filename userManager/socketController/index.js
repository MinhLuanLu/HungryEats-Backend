import { Make_Query } from "../../database/databaseConnection.js";
import newOrderHandler from "./orderHandler.js";
import confirmRecivedOrder from "./confirmRecivedOrder.js";
import { socketConfig } from "../../config.js";


async function UserSocketHandler(socket, io) {
    // =================== Handle sending order to Store and sender back to buyer ================= //
    socket.on(socketConfig.processOrder ,async (order)=>{
        newOrderHandler(order, socket, io)
    });

    // handle order recived comfim from store //
    socket.on(socketConfig.confirmRecivedOrder, async(order) =>{
        confirmRecivedOrder(order, socket, io)
    })

}


export default UserSocketHandler;