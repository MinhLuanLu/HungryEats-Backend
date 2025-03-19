import { Make_Query } from "../database/databaseConnection.js";
import log from 'minhluanlu-color-log'
async function FoodList(request, response){
    try{
        const {
            Menu_id,
            Menu_name,
            Request,
            Store_name
        } = request.body
        // Handle get All Food based on Menu id
        if(Menu_id && Menu_name){
            const retrievedFood = await Make_Query(`SELECT * FROM Food WHERE Menu_id = '${Menu_id}'`);
            response.status(200).send({
                success: true,
                message: `retrieved food in Menu ${Menu_name} successfully.`,
                data: retrievedFood
            });
            log.info({message: `retrieved food in Menu ${Menu_name} successfully.`})
            return{
                success: true,
                message: `retrieved food in Menu ${Menu_name} successfully.`,
            }
        }
        // Handle get all menu and food
        if(Request == true){
            console.info(`Request to get the food list from ${Store_name}.`)
            const get_all_menu_id_in_store = await Make_Query(`SELECT Menu.Menu_id FROM Stores INNER JOIN Menu ON Stores.Store_id = Menu.Store_id WHERE Stores.Store_name = '${Store_name}' `);
            let food_list = []
            for(let i = 0; i < get_all_menu_id_in_store.length; i++){
                const menu_id = get_all_menu_id_in_store[i]['Menu_id']
                const get_food_list = await Make_Query(`SELECT * FROM Food WHERE Menu_id = ${menu_id}`);
                
                for(let j = 0; j < get_food_list.length; j++){
                    const get_list = get_food_list[j]
                    food_list.push(get_list) 
                }
            }

            console.info({message: `retrieved all food in ${Store_name} successfully.`})
            response.status(200).send({
                success: true,
                message: `retrieved all food in ${Store_name} successfully.`,
                data: food_list 
            });
            return{
                success: true,
                message: `retrieved all food in ${Store_name} successfully.`,
            }
        }
    }
    catch(error){
        return{
            success: false,
            message: error
        }
    }
}

export default FoodList;