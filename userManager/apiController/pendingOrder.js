import { Make_Query } from "../../database/databaseConnection.js";
import { orderStatusConfig } from "../../config.js";
import log from "minhluanlu-color-log";

async function PendingOrder(request, response) {
    try{
        const {User} = request.body;
        console.info(`Request to get pending Order From ${User} ...`);

        const getOrders = await Make_Query(`
            SELECT * FROM Orders 
            WHERE User_id = ${User.User_id} 
            AND (Order_status = '${orderStatusConfig.pending}' OR Order_status = '${orderStatusConfig.procesing}' OR Order_status = '${orderStatusConfig.ready}')
        `);
        
        if(getOrders.length == 0){
            log.debug({
                message: "no pending order or processing order was found."
            });

            response.status(200).send({
                success: true,
                message: "no pending order or processing order was found.",
                data: []
            })
            return
        }
        response.status(200).send({
            success: true,
            message: 'Pending order received successfully..',
            data: getOrders
        });
        return
    }
    catch(error){
        response.status(400).send({
            success:false,
            message: error,
            //data: Order_Status
        })
    }
}

export default PendingOrder;