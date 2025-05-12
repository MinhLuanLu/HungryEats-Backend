import { Make_Query } from "../database/databaseConnection.js";
import fs from 'fs';
import path from 'path';
import log from 'minhluanlu-color-log';

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

async function updateFoodQuantity(foods){
    let success = false;
    let Food = [];
    try{
        for(const food of foods ){
            const id = food?.Food_id;
            const orderFood_quantity = food?.Food_quantity;

            const [getFood] = await Make_Query(`
                SELECT * FROM Food WHERE Food_id = ${id}    
            `)
            if(!getFood){
                log.warn({message: 'Failed to update food quantity'})
            }else if(getFood){
                log.debug({message: 'update food quantity'})

                const newQuantity = getFood.Quantity - food.Food_quantity
                const update = await Make_Query(`
                    UPDATE Food
                    SET Quantity = ${newQuantity}
                    WHERE Food_id = ${id}
                `)
                if(!update){
                    log.debug({message: 'Failed to update food quantity'})
                }else{
                    log.info('update food quantity successfully.');

                    success = true;
                    Food.push(getFood)
                }

            }
        }

        if(success){
            return "update food quantity successfully."
        }
        return []
    }catch(error){

    }
}

async function uploadFoodImage(request, response) {
    const file = request.file
    const file_name = File["originalname"]
    let {Food} = request.body;
    Food = JSON.parse(Food);
    

    const filePath = path.resolve(file.path); // get absolute path
    const base64Image = fs.readFileSync(filePath, { encoding: 'base64' });

    const completeBase64Code = `data:${file.mimetype};base64,${base64Image}`

    try{
        const updateFoodIamge = await Make_Query(`UPDATE Food SET Food_image = '${completeBase64Code}' WHERE Food_id = ${Food.Food_id}`)

        const [getFood] = await Make_Query(`SELECT * FROM Food WHERE Food_id = ${Food.Food_id}`);
        //console.log(getFood);

        response.status(200).json({
            success: true,
            message: "save image successfully.",
            data: getFood
        });
    }
    catch(error){
        response.status(400).json({
            success: true,
            message: "Failed to save image successfully.",
        });
    }
}
export { FoodList, updateFoodQuantity, uploadFoodImage};