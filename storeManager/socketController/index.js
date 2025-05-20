import { Make_Query } from '../../database/databaseConnection.js';
import StoreStatusHandler from './storeStatusHandler.js';
import orderAction from './orderAction.js';
import UpdateFoodQuantityHandler from './updateFoodQuantityHandler.js';
import { socketConfig } from '../../config.js';
import updateFoodDataHandler from './updateFoodDataHandler.js';

async function StoreSocketHandler(socket, io) {

    // ===========================  Handle update store status live => Close or Open from Store UI ======================= //
    socket.on(socketConfig.updateStoreState,async (data)=>{
        StoreStatusHandler(data, socket, io)
    });

    // =============== Handle order action (Accept or Decline) ========================== //
    socket.on(socketConfig.orderAction, async(order) =>{
        orderAction(order, socket, io);
    })
    // ================================================================================= //

    // =============== Handler food update data =================================== //

    socket.on(socketConfig.updateFoodData, async(data) =>{
        updateFoodDataHandler(data, socket, io)
    })
    // ==============================================================================//
    
}

export default StoreSocketHandler;