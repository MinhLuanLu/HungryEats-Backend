import { Make_Query } from "../../database/databaseConnection.js";
import log from "minhluanlu-color-log";




async function MenuFood(req, res) {
    const {id} = req.params;
    
    try{
        const retrievedMenu = await Make_Query
        (
            `SELECT *
            FROM Stores INNER JOIN Menu
            ON Stores.Store_id = Menu.Store_id  
            WHERE Stores.Store_id = ${id};`
        );

        if(retrievedMenu.length === 0){
            log.warn({
                message: "Failed to recived menu of resturant",
                restaurent: Store_name,
                data: retrievedMenu
            })
            res.status(400).json({
                success: true,
                message: "Failed to recived menu and food successfully",
                data: retrievedMenu.Food
            })
        }

        log.debug({
            message: "recived menu successfully.",
            data: retrievedMenu
        });
        
        for(const menu of retrievedMenu){
            const menuID = menu.Menu_id;
            const recivedMenuFood = await Make_Query
            (
                `SELECT *
                FROM Food WHERE Menu_id = ${menuID};`
            );
            menu.Food = recivedMenuFood;
        }
        

        console.log(retrievedMenu.Food)

        
        res.status(200).json({
            success: true,
            message: "Recived menu and food successfully",
            data: retrievedMenu
        })
        
        
    }
    catch(error){
        log.err({
            message: "Failed to recived menu and food",
            error: error
        })
    }
}


export default MenuFood