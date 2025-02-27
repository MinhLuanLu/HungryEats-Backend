import { Make_Query } from "../../database/databaseConnection.js";




async function UpdateFoodQuantityHandler(socket, io, data){
 
        try{
            const Food_name                 = data?.Food_name;
            const New_Food_quantity         = data?.Quantity;
            const Food_id                   = data?.Food_id;
            const Store_name                = data?.Store_name;
            const User_id                   = data?.User_id;
            
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
            
            return{
                success: true,
                message: `${Store_name} update food quantity [${Food_name}(${New_Food_quantity}x)] successfully..`
            }
        }
        catch(error){
            return{
                sussess: true,
                message: error
            }
        }
        
    
}

export default UpdateFoodQuantityHandler;