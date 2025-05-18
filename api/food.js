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

// this function using in socketIO not API //
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

    log.debug("------------------ Recived upload food image event ------------------")
    

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

async function createFood(req, res) {
    const Imagefile = req.file
    let {Food} = req.body;
    Food = JSON.parse(Food)
    const {
        Menu_name,
        Menu_description,
        Food_name,
        Food_description,
        Price,
        Quantity,
        isNewMenu,
        SelectMenu,
        Store
    } = Food;

    log.debug({
        message: "------------- Recived create food event ------------",
        event: Food
    });


    if(isNewMenu){
        log.debug("Create food with new menu");
        try{
            const createMenu = await Make_Query(`INSERT INTO Menu (Store_id, Menu_name, Menu_description, Menu_image)
                VALUES(
                    ${Store.Store_id},
                    '${Menu_name}',
                    '${Menu_description}',
                    'none'
                )    
            `);

            log.debug("Create Menu successfully. Add food to the menu");
            const newMenuID = createMenu?.insertId;
            const createFood = await Make_Query(`INSERT INTO Food (Menu_id, Food_name, Food_description, Quantity, Price, Food_image)
            VALUES(
                ${Number(newMenuID)},
                '${Food_name}',
                '${Food_description}',
                ${Number(Quantity)},
                ${Number(Price)},
                'null'
            )`);

            log.debug({
                message: "Create food successfully.",
                data: createFood
            });
            
            const createFoodID = createFood?.insertId;
            const getFood = await Make_Query(`SELECT * FROM Food WHERE Food_id = ${createFoodID}`)
            const retrievedMenu = await Make_Query
            (
                `SELECT *
                FROM Stores INNER JOIN Menu
                ON Stores.Store_id = Menu.Store_id  
                WHERE Stores.Store_id = ${Store.Store_id} AND Menu.Menu_id = ${newMenuID};`
            );
            if(retrievedMenu.length == 0){
                log.debug({
                    message: 'Failed to get the menu of food just created.',
                    data: retrievedMenu
                });
                res.status(400).json({
                    success: false,
                    message: 'Failed to get the menu of food just created.',
                    data: retrievedMenu
                });
                return;
            }

            let foodDataResult = retrievedMenu[0];
            foodDataResult.Food = getFood[0]
            

            res.status(200).json({
                success: true,
                message: "Create food successfully.",
                data: []
            })
        }
        catch(error){
            log.err({
                success: false,
                message: error,
                data:[]
            });
            res.status(400).json({
                success: false,
                message: error,
                data:[]
            })
        }
    }
    else{
        log.debug("------------ Create food with select menu -----------------");
        try{
            const createFood = await Make_Query(`INSERT INTO Food (Menu_id, Food_name, Food_description, Quantity, Price, Food_image)
            VALUES(
                ${Number(SelectMenu)},
                '${Food_name}',
                '${Food_description}',
                ${Number(Quantity)},
                ${Number(Price)},
                'null'
            )`);

            log.debug({
                message: "Create food successfully.",
                data: createFood
            });
            
            const createFoodID = createFood?.insertId;
            const getFood = await Make_Query(`SELECT * FROM Food WHERE Food_id = ${createFoodID}`);
            if(getFood.length == 0){
                log.debug({
                    message: 'Failed to get the new food just created.',
                    data: getFood
                });
                res.status(400).json({
                    success: false,
                    message: 'Failed to get the new food just created.',
                    data: getFood
                });
                return;
            }

            const retrievedMenu = await Make_Query
            (
                `SELECT *
                FROM Stores INNER JOIN Menu
                ON Stores.Store_id = Menu.Store_id  
                WHERE Stores.Store_id = ${Store.Store_id} AND Menu.Menu_id = ${SelectMenu};`
            );
            if(retrievedMenu.length == 0){
                log.debug({
                    message: 'Failed to get the menu of food just created.',
                    data: retrievedMenu
                });
                res.status(400).json({
                    success: false,
                    message: 'Failed to get the menu of food just created.',
                    data: retrievedMenu
                });
                return;
            }

            let foodDataResult = retrievedMenu[0];
            foodDataResult.Food = getFood[0]

            res.status(200).json({
                success: true,
                message: "Create food successfully.",
                data: foodDataResult
            });
        }
        catch(error){
            log.err({
                success: false,
                message: error,
                data:[]
            });
            res.status(400).json({
                success: false,
                message: error,
                data:[]
            })
        }
    }
}


async function deleteFood(req, res) {
    const FoodID = req.params.id
    log.debug({
        message: 'Recived Delete Food event',
        FoodID: FoodID
    });

    try{
        const deleteFood = await Make_Query(`
            DELETE FROM Food WHERE Food_id = ${FoodID}
        `);

        log.debug({
            message: "Delete food successfully.",
            DeleteID: FoodID,
            data: deleteFood
        });
        res.status(200).json({
            success:true,
            message: "Delete food successfully.",
            DeleteID: FoodID,
            data: deleteFood
        })
    }
    catch(error){
        log.debug({
            message: "error to delete food"
        });
        res.status(400).json({
            message: "error to delete food"
        })
    }


}

export { FoodList, updateFoodQuantity, uploadFoodImage, createFood, deleteFood};