import { Make_Query } from "../../database/databaseConnection.js"

//  function to update whether a store is open or closed //
async function StoreStatusHandler(data, socket ,io){
    try{
        const User_id = data.User_id
        const update_store_status = await Make_Query(`UPDATE Stores SET Status = 0 WHERE User_id = ${Number(User_id)}`)
        const [get_store_status] = await Make_Query(`SELECT Status, Store_name FROM Stores WHERE User_id = ${Number(User_id)}`)
        
        const get_all_store = await Make_Query(`SELECT * FROM Stores`)

        socket.emit('update_Store_status', get_store_status)
        //send  a list of update stores status to all user
        io.emit('updateStoreStatus', get_all_store)
        console.info(`${get_store_status?.Store_name} is close..`);
    }
    catch(error){
        console.debug(error);
    }
}

export default StoreStatusHandler;