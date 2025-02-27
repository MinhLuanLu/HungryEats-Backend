import { Make_Query } from '../../database/databaseConnection.js';
import StoreStatusHandler from './storeStatusHandler.js';
import orderAction from './orderAction.js';
import UpdateFoodQuantityHandler from './updateFoodQuantityHandler.js';

async function StoreSocketHandler(socket, io) {

    // ===========================  Handle update store status live => Close or Open from Store UI ======================= //
    socket.on('close_store',async (data)=>{
        StoreStatusHandler(data, socket, io)
    });

    // =============== Handle order action (Accept or Decline) ========================== //
    socket.on('accept_order', async (data)=>{
        const Accept = "Accept";
        const acceptOrder = await orderAction(data, Accept, socket);
        return acceptOrder
    });
    
    socket.on('decline_order', async (data)=>{
        const Decline = "Decline";
        const declineOrder = await orderAction(data, Decline, socket);
        return declineOrder;
        
    });
    // ================================================================================= //

    // ============ Handle the comfirmation when store received the order from users ============== //
    socket.on('update_food_quantity', async(data)=>{
        const update_food_quantity = await UpdateFoodQuantityHandler(socket, io, data);
        console.info(update_food_quantity)
    })
    
}

export default StoreSocketHandler;