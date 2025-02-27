import {v4 as uuidv4} from 'uuid';
import {CreatePurchaseLog} from '../purchase_log.js';
import { Make_Query } from '../../database/databaseConnection.js';


async function orderHandler(order, socket, io) {
    try{
        const Order_number = uuidv4();
        const Sender = order?.Sender;
        const Store_name = order?.Store_name;
        const Total_price = order?.Total_price;
        const Pickup_time = order?.Pickup_time;

        const Food_item_list = order?.Food_item;
        const Food_quantity_list = order?.Food_quantity;
        let food_item = [];
        const Food_id_list = order?.Food_id
        let food_id_list = [];
        const Drink_item_list = order?.Drink_item;
        const Drink_quantity_list = order?.Drink_quantity;
        let drink_item = [];

        /// get Store id and User id base and order information
        const [getStore_id] = await Make_Query(`SELECT Store_id FROM Stores WHERE Store_name = '${Store_name}'`);
        const Store_id = getStore_id?.Store_id;
        
        const [getUser_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Sender}'`)
        const User_id = getUser_id?.User_id;
        
        
        // Combine Foods and Food quantity //
        for(const food of Food_item_list ){
            const Food_name = food?.Food_name; // get food name in order

            // Get Food id in order by using Food name
            for(let id = 0;  id < Food_id_list.length; id ++){
                if(Food_id_list[id][Food_name] !== undefined){
                    const Food_id = Food_id_list[id][Food_name]
                    food_id_list.push(Food_id)
                    break;
                }
            };

            // Get and Set Food name and Food quantity to a list by using Food name
            for(let i = 0; i < Food_quantity_list.length; i ++){
                if (Food_quantity_list[i][Food_name] !== undefined) {
                    const Food_Quantity = Food_quantity_list[i][Food_name]
                    food_item.push({
                        Food_name: Food_name,
                        Food_Quantity: Food_Quantity
                    });
                    break;
                }
            };
        };

        // Combine Drinks and Drink quantity //
        for(const drink of Drink_item_list){
            const Drink_name = drink?.Drink;
            for(let j = 0; j < Drink_quantity_list.length; j ++){
                if (Drink_quantity_list[j][Drink_name] !== undefined) {
                    const Drink_quantity = Drink_quantity_list[j][Drink_name]
                    drink_item.push({
                        Drink: Drink_name,
                        Drink_quantity: Drink_quantity
                    })
                    break;
                }
            }
            
        };
        // save order to database
        const save_order = await Make_Query(`INSERT INTO Orders (Store_id, User_id, Food_item, Drink_item, Total_price, Pickup_time, Order_number, Order_status)
            VALUES(${Store_id}, ${User_id}, '${JSON.stringify(food_item)}', '${JSON.stringify(drink_item)}', ${Total_price}, '${Pickup_time}', '${Order_number}', 'Waitting')
            `)
        
        // Get the Order just save from database to comtinue send to the Store
        const get_Order = await Make_Query(`SELECT * FROM Orders JOIN Users ON Orders.User_id = Users.User_id WHERE Order_number = '${Order_number}'`);
        
        const [get_Store_User_id] = await Make_Query(`SELECT User_id FROM Stores WHERE Store_id = ${get_Order[0]["Store_id"]}`);
        const [get_Store_Socket_id] = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${get_Store_User_id?.User_id}`);

        // ================== Create and update Purchase log ============================ //
        const purchase_Log = await CreatePurchaseLog(get_Order)
        console.info(purchase_Log)
        // ============================================================================== //

        // ****************** sending order to Store ********************************* //
        const socket_id = get_Store_Socket_id?.Socket_id;
        socket.to(socket_id).emit('processOrder', get_Order)
        console.info("Send order to Store successfully..")
        // *************************************************************************** //

        // ===================== save and send Pending Order ====================//
        const [get_sender_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Sender}'`);
        const [get_sender_socket_id] = await Make_Query(`SELECT Socket_id FROM Socketio WHERE User_id = ${get_sender_id?.User_id}`)
        const order_id = get_Order[0]["Order_id"];
        const save_pending_order = await Make_Query(`INSERT INTO Pending_order (User_id, Order_id) VALUES (${get_sender_id?.User_id}, ${order_id})`)
        // send order back to user - buyer (sender)
        socket.emit('pendingOrder', get_Order)
        console.info("Send order back to Buyer successfully..")
        // ======================================================================== //


        // ======================= Handle update Food quantity after be ordered ===================== //
        for(let id = 0; id < food_id_list.length; id ++){
            const foodId = food_id_list[id];
            const [get_food_current_quantity] = await Make_Query(`SELECT * FROM Food WHERE Food_id = ${foodId}`);
            const current_quantity = get_food_current_quantity.Quantity; // the food quantity in database
            const food_name = get_food_current_quantity.Food_name; // food name in database

            // loop through food item to check the food name and get the quantity from order
            for(const food of food_item){
                if(food.Food_name == food_name){
                    const order_quantity = food.Food_Quantity;
                    let new_quantity = current_quantity - order_quantity;
                    // update the bew quantity to database
                    const update_new_quantity = await Make_Query(`UPDATE Food SET Quantity = ${new_quantity} WHERE Food_id = ${foodId}`);
                    console.info('Update food quantity successfully..')
                }
            }
        };
        // ===================================================================================  //

        // ================ Get the food list then send to all users ======================= //
        let food_list = []
        const get_all_menu_of_store = await Make_Query(`SELECT Menu_id FROM Menu WHERE Store_id = '${Store_id}'`);
        for(let id = 0; id < get_all_menu_of_store.length; id ++){
            const menu_id = get_all_menu_of_store[id]["Menu_id"];
            const get_new_food_list = await Make_Query(`SELECT * FROM Food WHERE Menu_id = ${menu_id}`);
            for(const item of get_new_food_list){
                food_list.push(item)
            }
        };
        io.emit('update_food_quantity', food_list)    /// update new food quantity to all users     
        console.info("update Food quantity successfylly")
        
        return{
            success: true,
            message: `Sending order successfully..`
        }
    }
    catch(error){
        return{
            success: false,
            message: error
        }
    }
}

export default orderHandler;