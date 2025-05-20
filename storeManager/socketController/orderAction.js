import { Make_Query } from "../../database/databaseConnection.js";
import log from "minhluanlu-color-log";
import { socketConfig, orderStatusConfig } from "../../config.js";


async function orderAction(order, socket, io) {
    const orderStatus = order?.Order_status;
    log.debug("--- recived updateorder status event -----")

    try{
        await Make_Query(`UPDATE Orders SET Order_status = '${orderStatus}' WHERE Order_id = ${order?.Order_id}`);

        if(orderStatus != orderStatusConfig.done){
            const [getUserSocketID] = await Make_Query(`SELECT * FROM Socketio WHERE User_id = ${order.User_id}`)
            const socketID = getUserSocketID?.Socket_id;
            console.log('send new order status')
            io.to(socketID).emit(socketConfig.updateOrderStatus, order)
        }
        
        return{
            success: true,
            message: `Update ${orderStatus} order: ${order.Order_id} successfully..`,
            order: order
        }
    }
    catch(error){
        return{
            success: false,
            message: error
        }
    }
}

export default orderAction;