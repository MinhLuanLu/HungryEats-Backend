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
};


async function updateMenu(req, res) {
    let Imagefile = req.file
    let {Menu} = req.body;
    Menu = JSON.parse(Menu);
    let completeBase64Code;

    log.debug({
        message: "Recived update menu event",
        event: Menu.Menu_name
    });

    if(Imagefile != undefined){
        log.debug("Convert image to base64.");
        const filePath = path.resolve(file.path); // get absolute path
        const base64Image = fs.readFileSync(filePath, { encoding: 'base64' });
        completeBase64Code = `data:${file.mimetype};base64,${base64Image}`
    }
    else{
        completeBase64Code = "none"
    }
    
    try{

        const updateMenu = await Make_Query(`UPDATE Menu SET 
            Store_id = ${Menu.Store_id},
            Menu_name = '${Menu.Menu_name}',
            Menu_description = '${Menu.Menu_description}',
            Menu_image = '${completeBase64Code}' WHERE Menu_id = ${Menu.Menu_id}
        `);

        const [getMenu] = await Make_Query(`SELECT * FROM Menu WHERE Menu_id = ${Menu.Menu_id}`)

        log.debug({
            message:"update menu successfully",
            data: updateMenu
        });

        res.status(200).json({
            success:true,
            message:"update menu successfully",
            data: getMenu
        })

    }
    catch(error){
        console.log(error)
        log.debug({
            message: "Failed to update menu",
            error: error
        });
        res.status(400).json({
            success: false,
            message: "Failed to update menu",
            error: error
        })
    }
    
}

export{
    Menu,
    updateMenu
}