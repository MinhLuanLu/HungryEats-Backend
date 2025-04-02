import { Server } from 'socket.io';
import http, { get } from 'http';
import log from 'minhluanlu-color-log'
import config from '../config.js';
import { Make_Query } from '../database/databaseConnection.js';
import UserSocketHandler from '../userManager/socketController/index.js'; //User Manager
import StoreSocketHandler from '../storeManager/socketController/index.js';// Store Manager



export function socketConnection(api_express) {
    const server = http.createServer(api_express);
    const io = new Server(server, {
        cors: {
            origin: "*", //["http://localhost:5173", 'http://localhost:8000'],  
            methods: ["GET", "POST"],
            allowedHeaders: "*", // ["my-custom-header"], 
            credentials: false//true  
        },
       
    });

    // Handle update the socket id from Users when connection is successfully absed Store name or User_id 
    io.on('connection', async (socket) => {
        console.info(`Socket [${socket.id}] connected`)

        socket.on('connection', async (data)=>{
        const Socket_id             = data?.Socket_id
        const User_id               = data?.User?.User_id
        const Store_name            = data?.User?.Store_name
        const Email                 = data?.User?.Email
        const Username              = data?.User?.Username

        //console.log(data.User)
    
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
                io.emit('updateStoreStatus', get_all_stores_status)
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


        // Handle Disconnect to socket
        socket.on('disconnect', (reason) => {
            console.info('disconnect', reason);
        });
        // ====================================================================== //
    
        // Handle all request from Users
        await UserSocketHandler(socket, io)    
        // =========================================================================================== //

        // Handle all request from Store
        await StoreSocketHandler(socket, io)
        // ==================================================================================================  //

    });



    const PORT = config.SOCKET_PORT;
    server.listen(PORT,'0.0.0.0',
    () => log.info(`Connected to SocketIo Server running On http://localhost:${PORT}`))

}





