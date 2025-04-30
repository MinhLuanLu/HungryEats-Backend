import { Make_Query } from "../../database/databaseConnection.js"
import { socketConfig } from "../../config.js";
import log from "minhluanlu-color-log";

//  function to update whether a store is open or closed //
async function StoreStatusHandler(data, socket ,io){
    const store = data.Store;
    const state = data.State;
    let status;
    

    if(state){
        status = 1
    }else{
        status = 0
    }
    console.log(status)
    try{
        await Make_Query(`UPDATE Stores SET Active = ${status} WHERE Store_id = ${store.Store_id}`)
        
        const get_all_store = await Make_Query(`SELECT * FROM Stores`);
        
        // send  a list of update stores status to all user
        io.emit(socketConfig.updateStoreState, get_all_store);

        log.debug({
            message: "Update store state successfully.",
            store: store,
            state: state
        })
        
        
    }
    catch(error){
        console.debug(error);
    }
}

export default StoreStatusHandler;