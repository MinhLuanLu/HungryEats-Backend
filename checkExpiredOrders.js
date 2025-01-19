import { Make_Query } from "./databaseConnection";

// Handle Delete Order in Status
async function checkAndDeleteExpiredOrders(){

    const get_order_id = await Make_Query(`SELECT Order_id FROM Order_status`)
    
    for(let i = 0; i < get_order_id; i++){
        let list_id = get_order_id["Order_id"]
        const checkAndDeleteExpiredOrders = await Make_Query(`
            DELETE FROM Orders
            WHERE Order_id = ${list_id} AND Pickup_time <= CURTIME();`
        )
        break;
    }
};

setInterval(checkAndDeleteExpiredOrders, 300000);