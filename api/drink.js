import { Make_Query } from "../database/databaseConnection.js";

async function Drink(request, response) {
    try{
        const {Store_name} = request.body;
        const [get_store_id] = await Make_Query(`SELECT Store_id FROM Stores WHERE Store_name = '${Store_name}'`)
        const Store_id = get_store_id?.Store_id
        
        const get_drink_list = await Make_Query(`SELECT * FROM Drink INNER JOIN Store_Drink
                                                    ON Drink.Drink_id = Store_Drink.Drink_id
                                                    WHERE Store_Drink.Store_id = ${Store_id}`)
        
        response.status(200).send({
            success: true,
            message: "Drink list retrieved successfully...",
            data: get_drink_list
        });
        return{
            success: true,
            message: `Drink list retrieved successfully from ${Store_name}`,
        }
    }
    catch(error){
        return{
            success: true,
            message: error,
        }
    }
}

export default Drink;