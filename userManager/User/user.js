import { Make_Query } from "../../database/databaseConnection.js";
import log from "minhluanlu-color-log";


export async function getUser(userInfo) {
    const user_id = userInfo.User_id;
    let user;
    let getUser = await Make_Query(`
        SELECT * FROM Users WHERE User_id = ${user_id}    
    `)
    
    if(getUser.length == 0){
        log.warn({message: 'User: get user failed..', user})
        return []
    }

    user = getUser[0]
    user.Password = "**************";
    return user
}



export async function getUserSocketId(user) {
    const user_id = user.User_id;
    console.log('USER', user)

    const socketId = await Make_Query(`
        SELECT Socket_id FROM Socketio WHERE User_id = ${user_id}    
    `)

    if(socketId.length == 0){
        log.err({
            message: "Failed to recived socketId"
        })
        return
    }

    const id = socketId[0].Socket_id;
    return id

}