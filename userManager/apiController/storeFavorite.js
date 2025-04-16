import { checkFn } from "nats/lib/nats-base-client/typedsub.js";
import { Make_Query } from "../../database/databaseConnection.js";
import log from "minhluanlu-color-log";
async function StoreFavorite(request, response) {
    const {
        User,
        Store,
        Favorite,
        Check
        
    } = request.body;

    if(Check){
        const [store] = await Make_Query(`SELECT * FROM Store_favorite WHERE Store_id = ${Store.Store_id} AND User_id = ${User.User_id}`);
        if(store == undefined){
            log.err({
                message: 'failed to get store, store is emty',
                store: store
            });
            return []
        }

        console.log(store)
       
        response.status(200).json({
            success: true,
            message:"update store favorite successfully.",
            data: store
        })
        return true
    }
    

    try{
        console.log('---------------------- Update Store Favorite ------------------------------------')
       const updateStoreFavorite = await Make_Query(`
            UPDATE Store_favorite
            SET Favorite = ${Favorite}
            WHERE Store_id = ${Store.Store_id} AND User_id = ${User.User_id};
        `);

        const [store] = await Make_Query(`SELECT * FROM Store_favorite WHERE Store_id = ${Store.Store_id} AND User_id = ${User.User_id}`);
        
        console.log(store)
       
        response.status(200).json({
            success: true,
            message:"update store favorite successfully.",
            data: store
        })
        return true
        
    }
    catch(error){
        response.status(400).json({
            success: false,
            message: error,
         
        })
    }
}

export default StoreFavorite;