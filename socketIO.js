import { Server } from 'socket.io';
import http, { get } from 'http';
import { Make_Query } from './databaseConnection.js';
import { error } from 'console';
import {v4 as uuidv4} from 'uuid'


export function Socket_Connection(api_express) {
    const server = http.createServer(api_express);
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:8000', 
        },

        cors: {
            origin: "http://localhost:5173",  
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"], 
            credentials: true  
        },
       
    });

    
    io.on('connection',  (socket) => {
        console.info(`Socket [${socket.id}] connected`)

        socket.on('connection', async (data)=>{
        const Socket_id             = data["Socket_id"]
        const User_id               = data["User_id"]
        const Store_name            = data["Store_name"]
        const Email                 = data["Email"]
        const Username              = data["Username"]
     
        if(Store_name && User_id){
            console.info(`Store ${Store_name} is opening..`)
            try{
                const save_socket_id = await Make_Query(`INSERT INTO Socketio (User_id, Socket_id) VALUES (${Number(User_id)}, '${Socket_id}'); `);
                const update_store_status = await Make_Query(`UPDATE Stores SET Status = 1 WHERE User_id = ${Number(User_id)}`)

                const get_all_stores_status = await Make_Query('SELECT * FROM Stores')

                const [get_store_status] = await Make_Query(`SELECT Status FROM Stores WHERE User_id = ${Number(User_id)}`)
                socket.emit('update_Store_status', get_store_status)

                // Handle update all stores status live
                io.emit('store_list', get_all_stores_status)
                console.debug(`Could not save socket ID <${Socket_id}> to the Database`);
            }
            catch{
                const save_socket_id = await Make_Query(`UPDATE Socketio SET Socket_id = '${Socket_id}' WHERE User_id = ${Number(User_id)};`)
                const update_store_status = await Make_Query(`UPDATE Stores SET Status = 1 WHERE User_id = ${Number(User_id)}`)
                const [get_store_status] = await Make_Query(`SELECT Status FROM Stores WHERE USer_id = ${Number(User_id)}`)

                const get_all_stores_status = await Make_Query('SELECT * FROM Stores')

                socket.emit('update_Store_status', get_store_status)
                
                // Handle update all stores status live
                io.emit('store_list', get_all_stores_status)

                console.info('Socket ID updated successfully...');
            }
        }

        if(Email && Username && Socket_id){
            console.info(`Socket ID <${Socket_id}> connection established from mobile app.`);
                
            const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}' AND Username = '${Username}'`);
            let user_id = get_user_id["User_id"]
            if(user_id){
                try{ 
                    const save_socket_id = await Make_Query(`INSERT INTO Socketio(User_id, Socket_id) VALUES (${Number(user_id)}, '${Socket_id}')`)
                    console.log(`Socket_id from ${Email} has created..`)
                }
                catch{
                    const save_socket_id = await Make_Query(`UPDATE Socketio SET Socket_id = '${Socket_id}' WHERE User_id = ${Number(user_id)}`)
                    console.log(`Socket_id from ${Email} has updated..`)
    
                }
            }
        }
       })


        /// Handle Disconnect to socket
        socket.on('disconnect', (reason) => {
            console.log('disconnect');
        });


     
        //  Handle update store status live => Close or Open
        socket.on('close_store',async (data)=>{
            const User_id = data.User_id
            if(User_id != ""){
                try{
                    const update_store_status = await Make_Query(`UPDATE Stores SET Status = 0 WHERE User_id = ${Number(User_id)}`)
                    const [get_store_status] = await Make_Query(`SELECT Status, Store_name FROM Stores WHERE User_id = ${Number(User_id)}`)

                    const get_all_store = await Make_Query(`SELECT * FROM Stores`)

                    socket.emit('update_Store_status', get_store_status)
                    //send update status to all user
                    io.emit('store_list', get_all_store)
                    console.log(`${get_store_status['Store_name']} is close..`)

                }catch{
                    console.error('error')
                }
            }
        })


        /// Get Store status when user click on the marker 
        socket.on('Store_status', async (data)=>{
            const [get_store_status] = await Make_Query(`SELECT Status FROM Stores WHERE Store_name = '${data['Store_name']}'`)
            socket.emit('Store_status', get_store_status)
        })
    

       // Sending order to Store
        socket.on('sending_order',async (order)=>{
            try{
                for(let i = 0; i < order.length; i++){
                    const Order_number = uuidv4();
                    const Store_name            = order[i]["Store_name"]
                    const Sender_email          = order[i]["Order_detail"][0]["Sender_info"]["Sender_email"]
                    const Sender_username       = order[i]["Order_detail"][0]["Sender_info"]["Sender_username"]
                    const Food_name             = order[i]["Order_detail"][0]["Food_name"]
                    const Pickup_time           = order[i]["Order_detail"][0]["Pickup_time"]
                    const Drink                 = order[i]["Order_detail"][0]["Drink"]
                    const Food_quantity         = order[i]["Order_detail"][0]["Food_quantity"]
                    const Total_price           = order[i]["Order_detail"][0]["Total_price"]
                
                    const [get_store_id]        = await Make_Query(`SELECT Store_id, User_id FROM Stores WHERE Store_name = '${Store_name}'`)
                    const [get_food_id]         = await Make_Query(`SELECT Food_id FROM Food WHERE Food_name = '${Food_name}'`)
                    const [get_user_id]         = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Sender_email}'`)

                    const Store_id              = get_store_id['Store_id']
                    const Food_id               = get_food_id["Food_id"]
                    const Sender_user_id        = get_user_id["User_id"] // as an id of the sender order
                    const User_id_of_store      = get_store_id["User_id"]

                    // to get the order just saved in database i using the Order_number generate by uuidv4 for searching..
                    
                    const save_order            = await Make_Query(`INSERT INTO Orders(Store_id, User_id, Food_id, Food_quantity, Drink, Pickup_time, Total_price, Order_number, Order_status)
                                                            VALUES (${Store_id}, ${Sender_user_id}, ${Food_id}, ${Food_quantity}, '${JSON.stringify(Drink)}', '${Pickup_time}', ${Total_price}, '${Order_number}', 'Waiting' )
                                                        `)

                    const get_order_detail      = await Make_Query(`SELECT * FROM Orders INNER JOIN Food ON Orders.Food_id = Food.Food_id JOIN Users ON Orders.User_id = Users.User_id WHERE Order_number = '${Order_number}'`);
                    const [get_socket_id]       = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${User_id_of_store}`) /// get the Store socket id to send the order
                    const socket_id             = get_socket_id['Socket_id']
                    
                    /// send order to store
                    socket.to(socket_id).emit('sending_order', get_order_detail)

                    // save the order to Order status table in Database and Send it to Buyer as users
                    let order_id                                = get_order_detail[0]["Order_id"]
                    let user_id                                 = get_user_id["User_id"]
                    const save_order_to_Order_status            = await Make_Query(`INSERT INTO Order_status(Order_id, User_id) VALUES (${order_id}, ${user_id})`)
                    const [get_user_socket_id]                  = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${user_id}`)
                    let user_socket_id                          = get_user_socket_id["Socket_id"]
                    const get_order_status_list                 = await Make_Query(`SELECT Order_id FROM Order_Status WHERE User_id = ${user_id}`)
                    let order_list                              = []
                    
                    for(let id = 0; id < get_order_status_list.length; id++){
                        let order_id             = get_order_status_list[id]["Order_id"]
                        const get_orders        = await Make_Query(`SELECT * FROM Orders INNER JOIN Food ON Orders.Food_id = Food.Food_id WHERE Order_id = ${order_id}`)

                        for(let j = 0; j < get_orders.length; j ++){
                            let get_order_list = get_orders[j]
                            order_list.push(get_order_list)
                        }
                    }
                    socket.emit('sending_order_status', order_list)
                    //console.log(order_list[0])
                  
                    // === Handel update food quantity === //
                    let food_list_name = order[i]["Order_detail"]
                    for(let food = 0; food < food_list_name.length; food ++){
                        let food_name = food_list_name[food]["Food_name"]
                        let food_quantity = food_list_name[food]["Food_quantity"]
                        const get_current_food_quantity = await Make_Query(`SELECT Quantity FROM Food WHERE Food_name = '${food_name}'`)
                        //console.log(`Food_name: ${food_name} - Quantity: (${get_current_food_quantity[0]["Quantity"]}x)`)
                        let new_quantity = get_current_food_quantity[0]["Quantity"] - food_quantity
                        const update_quantity = await Make_Query(`UPDATE Food SET Quantity = ${new_quantity} WHERE Food_name = '${food_name}'`)
    
                        const get_all_menu_id_in_store = await Make_Query(`SELECT Menu.Menu_id FROM Stores INNER JOIN Menu ON Stores.Store_id = Menu.Store_id WHERE Stores.Store_name = '${Store_name}' `);
                        let food_list = []
                        for(let id = 0; id < get_all_menu_id_in_store.length; id++){
                            const menu_id = get_all_menu_id_in_store[id]['Menu_id']
                            const get_food_list = await Make_Query(`SELECT * FROM Food WHERE Menu_id = ${menu_id}`);
                    
                            for(let j = 0; j < get_food_list.length; j++){
                                const get_list = get_food_list[j]
                                food_list.push(get_list) 
                            }
                        }
                            
                        io.emit('update_food_quantity', food_list)                
                    }            
                }
            
            }catch{
                console.log(error)
            }        
        })


        // Handle the comfirmation when store received the order from users
        socket.on('confirm_received_order', async(order)=>{
            const Sender            = order["Sender"]
            const Order_id          = order["Order_id"]
            const get_socket_id     = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${Sender}`)
            let socket_id           = get_socket_id[0]["Socket_id"]
            //console.log(socket_id)
            socket.to(socket_id).emit('confirm_received_order', Order_id)
        })

        socket.on('accept_order', async (data)=>{
            const Order_id = data["Order_id"]
            const Sender_id = data["Sender_id"]

            const get_sender_socket_id = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${Sender_id}`)
            const update_order_status = await Make_Query(`UPDATE Orders SET Order_status = "Accept" WHERE Order_id = ${Order_id}`)

            let get_list = []
            const get_order_id = await Make_Query(`SELECT * FROM Order_status WHERE User_id = ${Number(Sender_id)}`)

            for(let i = 0; i < get_order_id.length; i++){
                let order_id_list = get_order_id[i]["Order_id"]
                const [get_order] = await Make_Query(`SELECT * FROM Orders INNER JOIN Food ON Orders.Food_id = Food.Food_id INNER JOIN Users ON Orders.User_id = Users.User_id WHERE Order_id = ${order_id_list}`)/// get also the food
                get_list.push(get_order)
            }

            /// Sender update order Status back to seller
            const get_order = await Make_Query(`SELECT * FROM Orders INNER JOIN Food ON Orders.Food_id = Food.Food_id INNER JOIN Users ON Orders.User_id = Users.User_id WHERE Order_id = ${Order_id}`)/// get also the food
            socket.emit('update_order', get_order[0])

            /// send Update order status to the buyer
            let buyer_socket_id = get_sender_socket_id[0]["Socket_id"]
            //console.log(buyer_socket_id)
            socket.to(buyer_socket_id).emit('update_order', get_list)
            
        })

        socket.on('cancel_order', async (data)=>{
            const Order_id                  = data["Order_id"]
            const Sender_id                 = data["Sender_id"]
            const get_sender_socket_id      = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${Sender_id}`)
            const update_order_status       = await Make_Query(`UPDATE Orders SET Order_status = "Cancel" WHERE Order_id = ${Order_id}`)
            const get_order_id              = await Make_Query(`SELECT * FROM Order_status WHERE User_id = ${Number(Sender_id)}`)
            let get_list                    = []

            for(let i = 0; i < get_order_id.length; i++){
                let order_id_list = get_order_id[i]["Order_id"]
                const [get_order] = await Make_Query(`SELECT * FROM Orders INNER JOIN Food ON Orders.Food_id = Food.Food_id INNER JOIN Users ON Orders.User_id = Users.User_id WHERE Order_id = ${order_id_list}`)/// get also the food
                get_list.push(get_order)
            }

            /// Sender update order Status back to Store
            const get_order = await Make_Query(`SELECT * FROM Orders INNER JOIN Food ON Orders.Food_id = Food.Food_id INNER JOIN Users ON Orders.User_id = Users.User_id WHERE Order_id = ${Order_id}`)/// get also the food
            socket.emit('update_order', get_order[0])

            /// send Update order status to the buyer
            let buyer_socket_id = get_sender_socket_id[0]["Socket_id"]
            //console.log(buyer_socket_id)
            socket.to(buyer_socket_id).emit('update_order', get_list)
            
        })

        socket.on('update_food_quantity', async(data)=>{
            const Food_name                 = data["Food_name"]
            const New_Food_quantity         = data["Quantity"]
            const Food_id                   = data["Food_id"]
            const Store_name                = data["Store_name"]
            const User_id                   = data["User_id"]
             
            const update_food_quantity      = await Make_Query(`UPDATE Food SET Quantity = ${Number(New_Food_quantity)} WHERE Food_name = '${Food_name}' AND Food_id = ${Number(Food_id)}`)
            const get_socket_id             = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${User_id}`)
            const Get_store_id              = await Make_Query(`SELECT Store_id FROM Stores WHERE Store_name = '${Store_name}'`)
            let Store_id                    = Get_store_id[0]["Store_id"]
            const get_all_menu_id           = await Make_Query(`SELECT menu_id FROM Menu WHERE Store_id = ${Store_id}`)
            let food_list = []
            
            for(let i = 0; i < get_all_menu_id.length; i++){
                let menu_id = get_all_menu_id[i]["menu_id"]
                let get_food_list = await Make_Query(`SELECT * FROM Food WHERE Menu_id = ${menu_id}`)
                for(let j = 0; j < get_food_list.length; j++){
                    const get_list = get_food_list[j]
                    food_list.push(get_list) 
                }
            }
            io.emit('update_food_quantity', food_list)
            let socket_id = get_socket_id[0]["Socket_id"]
            socket.to(socket_id).emit("update_food_quantity", food_list)
            
        })
    });



    const PORT = 3001
    server.listen(PORT,
    () => console.log(`Server SocketIO running on http://localhost:${PORT}`))

}





