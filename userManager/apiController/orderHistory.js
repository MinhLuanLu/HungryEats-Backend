import { Make_Query } from "../../database/databaseConnection.js";
import log from "minhluanlu-color-log"

async function OrderHistory(request, response) {

    const {
        User
    } = request.body

    log.info("------------ order history request -------------------")
   
    try{
        const get_order_history = await Make_Query(`SELECT * FROM Orders WHERE User_id = ${User.User_id}`);

        if(get_order_history.length > 0){
            console.info(`Request Order history from ${User.Email} successfully..`)
            response.status(200).json({
                success: true,
                message: 'Order history retrieved successfully!',
                data: get_order_history
            });
            return
        }

        response.status(200).json({
            success: true,
            message: 'User has no order yet.',
            data: []
        });
        return
    }
    catch(error){
        response.status(400).json({
            success: false,
            message: error,
            data: []
        });
    }
}

export default OrderHistory;