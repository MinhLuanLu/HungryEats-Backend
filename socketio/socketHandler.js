import { Server } from 'socket.io';
import http, { get } from 'http';
import { Make_Query } from '../database/databaseConnection.js';
import {v4 as uuidv4} from 'uuid'
import orderHandler from './orderHandler/orderHandler.js';
import orderAction from './orderHandler/orderAction.js';


export function socketConnection(api_express) {
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

    // ============================= Handle update the socket id from Users when connection is successfully absed Store name or User_id ====================== //
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
       });


        // ==================== Handle Disconnect to socket ==================== //
        socket.on('disconnect', (reason) => {
            console.log('disconnect');
        });

     
        // ===========================  Handle update store status live => Close or Open from Store UI ======================= //
        socket.on('close_store',async (data)=>{
            try{
                const User_id = data.User_id
                const update_store_status = await Make_Query(`UPDATE Stores SET Status = 0 WHERE User_id = ${Number(User_id)}`)
                const [get_store_status] = await Make_Query(`SELECT Status, Store_name FROM Stores WHERE User_id = ${Number(User_id)}`)
                
                const get_all_store = await Make_Query(`SELECT * FROM Stores`)

                socket.emit('update_Store_status', get_store_status)
                //send update status to all user
                io.emit('store_list', get_all_store)
                console.log(`${get_store_status['Store_name']} is close..`);
            }
            catch(error){
                console.debug(error);
            }
        });
        // ==================================================================================================  //

        // ========= Request the Store status when user click on the marker, Handle update store Status on socketio check if store is open/close so the store description will show up or not ======== //
        socket.on('Store_status', async (data)=>{
            try{
                const [get_store_status] = await Make_Query(`SELECT Status FROM Stores WHERE Store_name = '${data['Store_name']}'`)
                socket.emit('Store_status', get_store_status)
                console.info(`Request Status for ${data.Store_name} successfully...`)
            }
            catch(error){
                console.debug(error)
            };
        });
        // ================================================================================================================ //
    
        // =================== Handle sending order to Store and sender back to buyer ================= //
        socket.on('sending_order',async (order)=>{
            orderHandler(order, socket, io)
        })
        // =========================================================================================== //

        
        // ============ Handle the comfirmation when store received the order from users ============== //
        socket.on('confirm_received_order', async(order)=>{
            try{
                const Sender_id            = order?.Sender_id
                const Order_id          = order?.Order_id
                const get_socket_id     = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${Sender_id}`)
                const socket_id           = get_socket_id[0]["Socket_id"]
                socket.to(socket_id).emit('confirm_received_order', Order_id);
                console.info(`Confirm received order: ${Order_id} From buyer: ${Sender_id} successfully..`);
            }
            catch(error){
                console.debug(error)
            };
        });
        // =================================================================================== //

        // =============== Handle order action (Accept or Decline) ========================== //
        socket.on('accept_order', async (data)=>{
            const Accept = "Accept";
            const acceptOrder = await orderAction(data, Accept, socket);
            console.info(acceptOrder);
        });
        
        socket.on('decline_order', async (data)=>{
            const Decline = "Decline";
            const declineOrder = await orderAction(data, Decline, socket);
            console.info(declineOrder);
            
        });
        // ================================================================================= //


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





