import { Make_Query } from "../database/databaseConnection.js";
import log from 'minhluanlu-color-log'

async function Menu(request, response) {
    const {
        Store,
        User
    } = request.body;


    const Store_name = Store.Store_name;
    const Store_id = Store.Store_id;


    try{
        log.info({message: `The user selected ${Store_name} and requested a restaurant menu.`})
        
        const retrievedMenu = await Make_Query
        (
            `SELECT Stores.Store_id, Stores.Store_name, Stores.Address, Stores.Phone_number, Menu.Menu_description, Menu.Menu_name , Menu.Menu_image, Menu.Menu_id
            FROM Stores INNER JOIN Menu
            ON Stores.Store_id = Menu.Store_id  
            WHERE Stores.Store_id = '${Store_id}' AND Stores.Store_name = '${Store_name}';`
        );

        if(retrievedMenu.length === 0){
            log.warn({
                message: "Failed to recived menu of resturant",
                restaurent: Store_name,
                data: retrievedMenu
            })
        }

        log.debug({
            message: "recived restaurant successfully.",
            restaurent: Store_name,
            data: retrievedMenu
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
    catch(error){
        return{
            success: false,
            message: error,
        }
    }
}

export default Menu;