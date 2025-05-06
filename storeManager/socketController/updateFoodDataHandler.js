import { Make_Query } from "../../database/databaseConnection.js";
import log from "minhluanlu-color-log";



async function updateFoodDataHandler(data, socket, io){
    const updateFood = data.Food;
    log.debug("---------- Recived update food data event --------------")
    console.log(updateFood)

    await Make_Query(`UPDATE Food SET Food_name = '${updateFood.Food_name}' ,Food_description = '${updateFood.Food_description}', Quantity = '${updateFood.Quantity}', Price = ${updateFood.Price} WHERE Food_id = ${updateFood.Food_id}`)
    
    const [getFood] = await Make_Query(`SELECT * FROM Food WHERE Food_id = ${updateFood.Food_id}`)
    
    if(updateFood == getFood){
        log.debug({
            message: "Failed to update food data ",
            data: getFood
        });
        return
    }
        
    /// send new data to all user //
}

export default updateFoodDataHandler;