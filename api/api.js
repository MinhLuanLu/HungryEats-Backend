import { Make_Query } from '../database/databaseConnection.js';
import express, { json, request, response } from 'express';
import { socketConnection } from '../socketio/socketHandler.js';
import cors from 'cors'
import multer from "multer";
import fs from 'fs'



async function API() {
    
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
        cb(null, '../upload/images')
        },
        filename: function (request, file, cb) {
        cb(null, file.originalname)
        }
    })
    
    const upload = multer({ storage: storage })

    const api_express = express() // Create A Server
    api_express.use(json())
    api_express.use(cors())

    api_express.use(express.static('../upload/images')); 

    const PORT = 3000;

    api_express.use(cors())
    api_express.listen(
        PORT,
        () => console.log(`Server running On http://localhost:${PORT}`)
    )

    socketConnection(api_express) //// Run the SocketIO as Port:3001


    api_express.post('/register/api', async (request, response)=>{
        const {Email} = request.body
        const {Password} = request.body
        const {Username} = request.body
        const {Role} = request.body
        console.log(Role)

        if(Email && Password && Role && Username){
            const create_user = await Make_Query(`INSERT INTO Users(Email, Username, Phone_number, Password, Role) VALUES ('${Email}', '${Username}', 'none', '${Password}', '${Role}')`);
            console.info('New user has created..')
        }
    })


    api_express.post('/login/api', async(request, response)=>{
        const {Email} = request.body;
        const {Password} = request.body;
        if(Email && Password){
            const check_email = await Make_Query(`SELECT COUNT (*) FROM Users WHERE Email = '${Email}'`)
            let check_email_result = (check_email[0]['COUNT (*)'])
            if(check_email_result === 1){
                const check_authentication = await Make_Query(`SELECT Password, Role FROM Users WHERE Email = '${Email}'`)

                let get_password = check_authentication[0]['Password']
                let get_user_role = check_authentication[0]['Role']
                if (Password == get_password){

                    const get_seller_info = await Make_Query(`SELECT * FROM Users INNER JOIN Stores ON Users.User_id =  Stores.User_id WHERE Email = '${Email}'`);
                    const get_user_info = await Make_Query(`SELECT * FROM Users WHERE Email = '${Email}'`)
                    console.info(`Login successfully from ${Email}`)
                    response.status(200).send(
                        {
                            message: "Login Successfully..",
                            "Role": get_user_role,
                            "Seller_info": get_seller_info,
                            "User_info": get_user_info
                        }
                    )
                }
                else{
                    response.status(200).send(
                        {
                            message: "Password incorrect!"
                        }
                    )
                }
            }
            else{
                response.status(200).send(
                    {
                        message: "Email doesn't exits in system.."
                    }
                )
            }
        }
    })


    api_express.get('/Store_list/api', async (request, response) =>{
        let store_list = await Make_Query("SELECT * FROM Stores")
        console.info("User request for the store list.")
        response.status(200).send(
            {
                "store_list": store_list
            }
        )
    })


    api_express.post('/searching/api', async (request, response) => {
        const { PostCode } = request.body;
        const { SearchName } = request.body;
        if (PostCode) {
            console.info("Received search value:", PostCode);
            let query = await Make_Query(`SELECT * FROM Stores WHERE PostCode LIKE "${PostCode}%" `)
            //console.log(query)
            if(query.length != 0){
                response.status(200).send({
                    message: 'Search request handled successfully!',
                    result: query
                });
            }
        }

        if(SearchName){
            console.info("Received search value:", SearchName);
            let query = await Make_Query(`SELECT * FROM Stores WHERE Store_Name LIKE "${SearchName}%" `)
            //console.log(query)
            if(query.length != 0){
                response.status(200).send({
                    message: 'Search request handled successfully!',
                    result: query
                });
            }
        }
    });


    api_express.post('/menu/api', async (request, response) =>{
        const {Store_Name} = request.body;
        console.info(`The user selected ${Store_Name} and requested a restaurant menu.`)

        if(Store_Name){
            const query = await Make_Query(`
                                            SELECT Stores.Store_name, Stores.Address, Stores.Phone_number, Menu.Menu_description, Menu.Menu_name , Menu.Menu_image, Menu.Menu_id
                                            FROM Stores INNER JOIN Menu
                                            ON Stores.Store_id= Menu.Store_id  
                                            WHERE Stores.Store_Name ='${Store_Name}'
                                            ;

                                        `);

            response.status(200).send({
                message: 'Get menu successfully..',
                menu: query
                
        })
    }

    })

    // Handle retrieved Food list of the store
    api_express.post('/food_list/api', async(request, response)=>{
        const {Menu_id} = request.body
        const {Menu_name} = request.body
        const {Request} = request.body
        const {Store_Name} = request.body
        if(Menu_id && Menu_name){
            const query = await Make_Query(`SELECT * FROM Food WHERE Menu_id = '${Menu_id}'`);
            response.status(200).send({
                message: 'Get Food List successfully..',
                food_list: query
            })
        }
        if(Request === "Get_Food_List"){
            console.info(`Request to get the food list from ${Store_Name}.`)
            const get_all_menu_id_in_store = await Make_Query(`SELECT Menu.Menu_id FROM Stores INNER JOIN Menu ON Stores.Store_id = Menu.Store_id WHERE Stores.Store_name = '${Store_Name}' `);
            let food_list = []
            for(let i = 0; i < get_all_menu_id_in_store.length; i++){
                const menu_id = get_all_menu_id_in_store[i]['Menu_id']
                const get_food_list = await Make_Query(`SELECT * FROM Food WHERE Menu_id = ${menu_id}`);
                
                for(let j = 0; j < get_food_list.length; j++){
                    const get_list = get_food_list[j]
                    food_list.push(get_list) 
                }
            }

            console.info("Food list retrieved successfully.")
            response.status(200).send({
                message: "Food list retrieved successfully.",
                food_list: food_list
                
            })
        }
    })


    // Handle to retrieved drink list based on store name
    api_express.post('/drink/api', async(request, response)=>{
        const {Store_name} = request.body;
        const [get_store_id] = await Make_Query(`SELECT Store_id FROM Stores WHERE Store_name = '${Store_name}'`)
        const Store_id = get_store_id["Store_id"]
        
        const get_drink_list = await Make_Query(`SELECT * FROM Drink INNER JOIN Store_Drink
                                                    ON Drink.Drink_id = Store_Drink.Drink_id
                                                    WHERE Store_Drink.Store_id = ${Store_id}`)
        
        console.info("Drink list retrieved successfully...")
        response.status(200).send({
            message: "Drink list retrieved successfully...",
            drink_list: get_drink_list
        })
    })


    // Handle retrieved store favorite for each user
    api_express.post('/store_favorite/api', async(request, response)=>{
        const {Email} = request.body;
        const {Store_name} = request.body;
        const {Request} = request.body;
        const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}'`)
        const [get_Store_id] = await Make_Query(`SELECT Store_id FROM Stores WHERE Store_name = '${Store_name}'`)
        let User_id = get_user_id["User_id"]
        let Store_id = get_Store_id["Store_id"]

        if(Request == false){
            let result = false
            let message = `Remove ${Store_name} from favorites.`
            
            const check_favorite = await(Make_Query(`SELECT * FROM Store_favorite WHERE User_id = ${User_id} AND Store_id = ${Store_id}`))
            if(check_favorite.length == 0){
                const save_to_favorite = await Make_Query(`INSERT INTO Store_favorite(User_id, Store_id, Favorite_status) VALUES (${User_id}, ${Store_id}, 'true')`)
                console.info(`Set ${Store_name} as a favorite..`)
                result = true
                message = `Set ${Store_name} as a favorite..`
            }else{
                const delete_favorite = await Make_Query(`DELETE FROM Store_favorite WHERE User_id = ${User_id} AND Store_id = ${Store_id}`)
                console.info(`Remove ${Store_name} from favorites.`)
            }

            response.status(200).send({
                message: message,
                Result: result
            })
        }

        if(Request == true){
            const get_favorite = await Make_Query(`SELECT * FROM Store_favorite WHERE User_id = ${User_id} AND Store_id = ${Store_id}`)
            let result = true
            let message = `${Store_name} has been set as a favorite by ${Email}.`
            if(get_favorite.length == 0){
                result = false
                message = `${Store_name} hasn't been set as a favorite by ${Email}.`
            }

            response.status(200).send({
                message: message,
                Result: result
            })
        }

    
    });

    // Handle retrieved order status
    api_express.post('/order_status/api', async (request, response) => {
        const {Email} = request.body;
        console.log('Request to get Order Status...')
        const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}'`)
        let User_id = get_user_id.User_id;
        const get_order_id_list = await Make_Query(`SELECT Order_id FROM Order_status WHERE User_id = ${User_id}`)
        
        const Order_Status = await Promise.all(
            get_order_id_list.map(async (id) => {
                const [get_order_status_list] = await Make_Query(`SELECT * FROM Orders WHERE Order_id = ${id.Order_id}`);
                return get_order_status_list; // Return the fetched order details
            })
        );
        
        response.status(200).send({
            message: 'Order status received successfully..',
            Order_status: Order_Status
        })
            
        
    })

    // Handle retrieve all order history from User or Store
    api_express.post('/order_history/api', async(request, response)=>{
        const {Email} = request.body
        const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}'`)
        let User_id = get_user_id.User_id
        const get_order_history = await Make_Query(`SELECT * FROM Orders WHERE User_id = ${User_id}`);

        console.info(`Request Order history from ${Email} successfully..`)
        response.status(200).json({
            message: 'Order history retrieved successfully!',
            Order_history: get_order_history
        });
        
    });
    // ================================================================================== //


    // ============= Handle From Project Management Tool ================================ //
    api_express.post('/edit_store/api', upload.single('image'), async (request, response) => {
        const File = request.file
        const file_name = File["originalname"]

        const {data} = request.body; 
        const Data = JSON.parse(data)
        let Store_id = Data["Store_id"]
        let Store_name = Data["Store_name"]
        let Request = Data["Request"]
        let Food_id = Data["Food_id"]
        let Food_name = Data["Food_name"]

        let message = ""
        
        if (!request.file) {
            return response.status(400).json({ message: "The file upload has failed." });
        }
    
        // Handle to change Store Image Cover
        if(Request === "Change Store Image"){
            let [get_previous_store_image] = await Make_Query(`SELECT Store_image, Store_name FROM Stores WHERE Store_id = ${Store_id}`)
            let old_store_image = get_previous_store_image["Store_image"]
            let get_store_name = get_previous_store_image["Store_name"]
            let filePath = `upload/images/${old_store_image}`;

            if(old_store_image != "" || old_store_image != "none"){
                if(old_store_image != file_name && get_store_name == Store_name){
                    fs.unlink(filePath, async (err) => {
                        if (err) {
                        console.debug("Error occurred while deleting the file.", err);
                        } else {
                        console.info(`File ${old_store_image} deleted successfully!`);
                        }
                    });
                }else{
                    console.debug("The uploaded file is the same as the old image file.")
                }
            }

            const save_image = await Make_Query(`UPDATE Stores SET Store_image = '${file_name}' WHERE Store_id = ${Store_id};`)
            message = "Store image uploaded successfully."
        }

        // Handle to change Food Image Cover
        if(Request === "Change Food Image"){
            let [get_previous_food_image] = await Make_Query(`SELECT Food_image, Food_name FROM Food WHERE Food_id = ${Food_id}`)
            let old_food_image = get_previous_food_image["Food_image"]
            let get_food_name = get_previous_food_image["Food_name"]
            let filePath = `upload/images/${old_food_image}`;

            if(old_food_image != "" || old_food_image != "none"){
                if(old_food_image != file_name && get_food_name == Food_name){
                    fs.unlink(filePath, async (err) => {
                        if (err) {
                        console.debug("Error occurred while deleting the file.", err);
                        } else {
                        console.info(`File ${old_food_image} deleted successfully!`);
                        }
                    });
                }else{
                    console.debug("The uploaded file is the same as the old image file.")
                }
            }
            const save_image = await Make_Query(`UPDATE Food SET Food_image = '${file_name}' WHERE Food_id = ${Food_id};`)
            message = "Food image uploaded successfully.";
        }

        console.info(message)

        response.status(200).send({
            message: message
            
        })
    });

    // ================================================================================== //

    // =========== Handle Store management tool  ==============================

    api_express.post('/get_today_order/api', async(request, response)=>{
        const {Date} = request.body;
        const {User_id} = request.body
        const {Store_name} = request.body
        
        console.info(`Request to get today's order from ${Store_name}.`)
        if(Date){
            try{
                const [get_store_id] = await Make_Query(`SELECT Store_id FROM Stores WHERE Store_name = '${Store_name}'`)
                const Store_id = get_store_id["Store_id"]
                const get_orders_in_today = await Make_Query(`SELECT * 
                                                            FROM Orders
                                                            JOIN Users ON Orders.User_id = Users.User_id
                                                            WHERE DATE(Orders.created_at) = '${Date}' AND Orders.Store_id = ${Store_id};
                                                            `);

                response.status(200).send({
                    message: "Orders for today retrieved successfully...",
                    order_in_today: get_orders_in_today
                })
            }
            catch{
                console.debug("Failed to retrieve today's orders...")
            }
        }
    })
};

export default API;