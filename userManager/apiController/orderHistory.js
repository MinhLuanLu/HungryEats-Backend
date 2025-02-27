import { Make_Query } from "../../database/databaseConnection.js";

async function OrderHistory(request, response) {
    try{
        const {Email} = request.body;
        const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}'`)
        let User_id = get_user_id.User_id
        const get_order_history = await Make_Query(`SELECT * FROM Orders WHERE User_id = ${User_id}`);

        console.info(`Request Order history from ${Email} successfully..`)
        response.status(200).json({
            success: true,
            message: 'Order history retrieved successfully!',
            data: get_order_history
        });
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