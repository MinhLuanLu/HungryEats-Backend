import { Make_Query } from "../database/databaseConnection.js";
import log from 'minhluanlu-color-log'

async function Menu(request, response) {
    try{
        const {
            Store_name,
            User_id,
            Store_id
        } = request.body;

        log.info({message: `The user selected ${Store_name} and requested a restaurant menu.`})
        
        if(Store_name && User_id){
            const retrievedMenu = await Make_Query
            (
                `SELECT Stores.Store_name, Stores.Address, Stores.Phone_number, Menu.Menu_description, Menu.Menu_name , Menu.Menu_image, Menu.Menu_id
                FROM Stores INNER JOIN Menu
                ON Stores.Store_id = Menu.Store_id  
                WHERE Stores.User_id =${User_id} OR Stores.Store_id = '${Store_name}';`
            );

            log.debug({
                message: `Get menu from store ${Store_name} successfully..`, 
                menu: retrievedMenu
            })

            response.status(200).send({
                success: true,
                message: `Get menu from store ${Store_name} successfully..`,
                data: retrievedMenu
            })
            return{
                success: true,
                message: `Get menu from store ${Store_name} successfully..`,
                data: retrievedMenu
            }
        }
        if(Store_name && Store_id){
            const retrievedMenu = await Make_Query
            (
                `SELECT Stores.Store_id, Stores.Store_name, Stores.Address, Stores.Phone_number, Menu.Menu_description, Menu.Menu_name , Menu.Menu_image, Menu.Menu_id
                FROM Stores INNER JOIN Menu
                ON Stores.Store_id = Menu.Store_id  
                WHERE Stores.Store_id = '${Store_id}' AND Stores.Store_name = '${Store_name}';`
            );

            console.log(retrievedMenu)
            console.log('name', Store_name)
            console.log('id', Store_id)

            response.status(200).send({
                success: true,
                message: `Get menu from store ${Store_name} successfully..`,
                data: retrievedMenu
            })
            return{
                success: true,
                message: `Get menu from store ${Store_name} successfully..`,
                data: retrievedMenu
            }
        }
    }
    catch(error){
        return{
            success: false,
            message: error,
        }
    }
}

export default Menu;