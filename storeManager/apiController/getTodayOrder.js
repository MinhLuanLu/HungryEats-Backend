import { Make_Query } from "../../database/databaseConnection.js";


async function GetTodayOrder(request, response) {
    try{
        const {Date} = request.body;
        const {User_id} = request.body
        const {Store_name} = request.body
        
        console.info(`Request to get today's order from ${Store_name}.`)
        if(Date){
            try{
                const [get_store_id] = await Make_Query(`SELECT Store_id FROM Stores WHERE Store_name = '${Store_name}'`)
                const Store_id = get_store_id["Store_id"]
                const get_orders_in_today = await Make_Query(
                    `SELECT * 
                    FROM Orders
                    JOIN Users ON Orders.User_id = Users.User_id
                    WHERE DATE(Orders.created_at) = '${Date}' AND Orders.Store_id = ${Store_id};
                    `);

                response.status(200).send({
                    success: true,
                    message: "Orders for today retrieved successfully...",
                    data: get_orders_in_today
                })
            }
            catch{
                console.debug("Failed to retrieve today's orders...")
            }
        }
    }
    catch(error){
        response.status(400).send({
            success: false,
            message: error,
            data: []
        })
    }
}

export default GetTodayOrder;