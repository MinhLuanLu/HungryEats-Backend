import { Make_Query } from "../../database/databaseConnection.js";
import { socketConfig , orderStatusConfig} from "../../config.js";
import log from "minhluanlu-color-log";



async function confirmRecivedOrder(order, socket, io) {
    log.info({
        message: "get confirm order event.",
        order: order
    })

    const Order_id = order.Order_id;
    const changeOrderStatus = await Make_Query(`
        UPDATE Orders
        SET Order_status = '${orderStatusConfig.pending}' 
        WHERE Order_id = ${Order_id};
    `)

    const getOrder = await Make_Query(`
        SELECT * FROM Orders Where Order_id = ${Order_id}    
    `)

    if(getOrder.length === 0){
        log.warn({
            message: 'Failed to confirm order recived from store.',
            order: order
        })
        /// it should be try again or do somthimge or to tell user or store that error //
        return
    }
    
    if(getOrder[0].Order_status !== orderStatusConfig.pending){
        log.warn({
            message: 'Failed to update orderStatus',
            expectStatus: orderStatusConfig.procesing,
            currentStatus: getOrder.Order_status,
            order: getOrder
        })
    }

    log.debug({
        message: 'Confirm order recived successfully.',
        expectStatus: orderStatusConfig.pending,
        currentStatus: getOrder[0].Order_status,
    }
    )
}

export default confirmRecivedOrder