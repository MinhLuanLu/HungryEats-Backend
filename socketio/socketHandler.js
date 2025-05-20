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
        console.info(`Socket [${socket.id}] connected`);

        socket.on('connection', async (data)=>{
        const SocketID            = data?.Socket_id
        const User = data?.User;
        console.log(User)

        const check = await Make_Query(`SELECT * FROM Socketio WHERE User_id = ${User.User_id}`);
        if(check.length > 0){
            try{
                log.debug({
                    message: "data is exist, save socket to it",
                    socketId: SocketID,
                    data: check
                })
                await Make_Query(`UPDATE Socketio SET Socket_id = '${String(SocketID)}' WHERE id = ${check[0].id}`);
                return
            }
            catch(error){
                log.err({
                    message: "Failed to update socketID",
                    socketID: SocketID,
                    error: error
                });
            }
        }

        // if socket data not exist yet //
        log.debug({
            message:"cerate socket id",
            socketID: SocketID,
            user: User
        });

        try{
            const create = await Make_Query(`INSERT INTO Socketio (User_id, Socket_id)
            VALUES(
                ${User?.User_id},
                '${SocketID}'
            )    
            `);
            log.debug("create successfully.")
        }
        catch(error){
            log.err({
                message: "failed to create and save socketid",
                user: User,
                socketID: SocketID
            })
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





