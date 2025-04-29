import { Make_Query } from "../../database/databaseConnection.js";

async function OrderHistory(request, response) {

    const {
        User
    } = request.body

    try{
        const get_order_history = await Make_Query(`SELECT * FROM Orders WHERE User_id = ${User.User_id}`);

        console.info(`Request Order history from ${User.Email} successfully..`)
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