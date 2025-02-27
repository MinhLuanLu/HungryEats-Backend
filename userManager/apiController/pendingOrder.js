import { Make_Query } from "../../database/databaseConnection.js";

async function PendingOrder(request, response) {
    try{
        const {Email} = request.body;
        console.info(`Request to get pending Order From ${Email} ...`);

        const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}'`)
        let User_id = get_user_id.User_id;
        const get_order_id_list = await Make_Query(`SELECT Order_id FROM Pending_order WHERE User_id = ${User_id}`)
        
        const Order_Status = await Promise.all(
            get_order_id_list.map(async (id) => {
                const [get_order_status_list] = await Make_Query(`SELECT * FROM Orders WHERE Order_id = ${id.Order_id}`);
                return get_order_status_list; // Return the fetched order details
            })
        );
        
        response.status(200).send({
            success: true,
            message: 'Pending order received successfully..',
            data: Order_Status
        })
    }
    catch(error){
        response.status(400).send({
            success:false,
            message: error,
            data: Order_Status
        })
    }
}

export default PendingOrder;