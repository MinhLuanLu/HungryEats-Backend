import { Make_Query } from "../../database/databaseConnection.js";


async function orderAction(data, order_status, socket) {
    try{
        const Order_id = data["Order_id"]
        const Sender_id = data["Sender_id"]

        const get_sender_socket_id = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${Sender_id}`)
        const update_order_status = await Make_Query(`UPDATE Orders SET Order_status = "${order_status}" WHERE Order_id = ${Order_id}`)

        let get_list = []
        const get_order_id = await Make_Query(`SELECT * FROM Order_status WHERE User_id = ${Number(Sender_id)}`)

        for(let i = 0; i < get_order_id.length; i++){
            let order_id_list = get_order_id[i]["Order_id"]
            const [get_order] = await Make_Query(`SELECT * FROM Orders INNER JOIN Users ON Orders.User_id = Users.User_id WHERE Order_id = ${order_id_list}`)/// get also the food
            get_list.push(get_order)
        }

        /// Sender update order Status back to seller
        const get_order = await Make_Query(`SELECT * FROM Orders INNER JOIN Users ON Orders.User_id = Users.User_id WHERE Order_id = ${Order_id}`)/// get also the food
        socket.emit('update_order', get_order[0])

        /// send Update order status to the buyer
        let buyer_socket_id = get_sender_socket_id[0]["Socket_id"]
        //console.log(buyer_socket_id)
        socket.to(buyer_socket_id).emit('update_order', get_list)  
        
        return{
            success: true,
            message: `${order_status} order: ${Order_id} successfully..`
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