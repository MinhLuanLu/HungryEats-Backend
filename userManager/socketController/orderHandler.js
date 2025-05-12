import {v4 as uuidv4} from 'uuid';
import {CreatePurchaseLog, updatePurchaseLog, updatePurchaseLogStatus} from '../purchase_log.js';
import { updateFoodQuantity } from '../../api/food.js';
import { Make_Query } from '../../database/databaseConnection.js';
import log from 'minhluanlu-color-log';
import { orderStatusConfig, purchaseLog, socketConfig } from '../../config.js';
import { getUser, getUserSocketId } from '../User/user.js';



async function newOrderHandler(order, socket, io) {
    log.debug({
        message: "recived order from user",
        order: order
    });

    const Order_number = uuidv4();
    const Store_id = order?.Store?.Store_id;
    const User_id = order?.User?.User_id;
    const Food_item = JSON.stringify(order?.Food_item);
    const Drink_item = JSON.stringify(order?.Drink_item);
    const Total_price = order.Total_price
    const Pickup_time = order.Pickup_time

    try{
        // save order to database //
        const save_order = await Make_Query(`INSERT INTO Orders (Store_id, User_id, Food_item, Drink_item, Total_price, Pickup_time, Order_number, Order_status)
            VALUES(
                ${Store_id}, ${User_id}, 
                '${Food_item}', '${Drink_item}', 
                ${Total_price}, '${Pickup_time}', '${Order_number}', '${orderStatusConfig.unprocessing}'
            )`
        )
        
        if(!save_order){
            log.err({
                message: 'newOrderHandler: Failed to save order',
            });
            return{
                message: 'newOrderHandler: Failed to save order',
                order: order
            }
        }

        log.info('save order successfully.');
        
        // Get the Order just save from database to comtinue send to the Store //
        const [getOrder] = await Make_Query(`
            SELECT * FROM Orders WHERE Order_number = "${Order_number}"   
        `);

        if(!getOrder){
            log.err({
                message: 'newOrderHandler: Failed to recived order',
            })
            return{
                message: 'newOrderHandler: Failed to recived order',
                order: order
            }
        }
        log.info({
            message: 'recived order successfully.',
            order: getOrder
        });

        // send order to user as unprocessing status //
        const userSocketID = await getUserSocketId(order.User);
        setTimeout(() => {
            socket.emit(socketConfig.orderUnprocessing, getOrder);
        }, 3000);

        log.debug({
            message: 'Send order unprocessing back to user',
                socketId: userSocketID
        })
        ///////////////////////////////////////////////////////////

        // get user info //
        const user = await getUser(order.User);
        console.log('insert user info to order', user)
        if(user.length === 0){
            log.warn({
                message: 'recived user failed.',
                user: user
            })
        }

        // add user info to order //
        console.log('insert user to order.')
        getOrder.User = user

        //////////////////////////////////////////////////////////

        // get store SocketID /////
        const Store_SocketId = await getStoreSocketId(order.Store);
        if(Store_SocketId.length == 0){
            log.err({message: "Failed to recived store SocketID"});
            return
        }

        // ****************** sending order to Store ********************************* //
        socket.to(Store_SocketId).emit(socketConfig.processOrder, getOrder)
        log.debug('sending order')
        

        /////////////////////////////////////////////////////////
 
        // Check store recived order or not than send back to user ====================//
        console.log("checking store recived order yet.")
        let checkOrderRecived;
        let time = 10000
        setTimeout(async () => {
            checkOrderRecived = await checkOrderStatus(getOrder, orderStatusConfig.pending)
            if(!checkOrderRecived){
                log.warn({
                    message: `Store not recived order after a while`,
                    time: `${time} seconds`
                })

                console.log('------ Attempt to send order again ------');
                socket.to(Store_SocketId).emit(socketConfig.processOrder, getOrder);
                // attemp to check again after 10000 secondes ///
                setTimeout(async ()=>{
                    checkOrderRecived = await checkOrderStatus(getOrder, orderStatusConfig.pending)
                    if(!checkOrderRecived){
                        log.warn({
                            message: `Store not recived order after a while`,
                            time: `${time} seconds`
                        })
                        // update order status to failed
                        const changeOrderStatus = await Make_Query(`
                            UPDATE Orders
                            SET Order_status = '${orderStatusConfig.failed}' 
                            WHERE Order_number = '${getOrder.Order_number}';
                        `);

                        const [getFailedOrder] = await Make_Query(`SELECT * FROM Orders WHERE Order_number = '${getOrder.Order_number}'`)
                        // send failedRecivedOrder to user //
                        socket.emit(socketConfig.failedRecivedOrder, getFailedOrder);
                        log.debug('send failed order to user.')
        
                        return
                    }
                    log.info('Store recived order successfully in seconde time.');
                    let [getUpdateOrder] = await Make_Query(`
                        SELECT * FROM Orders WHERE Order_number = '${Order_number}'    
                    `)

                    socket.emit(socketConfig.confirmRecivedOrder, getUpdateOrder);

                    ////////////////////////////////////////////////////////////////////////////////////

                    // Handle update Food quantity after be ordered ===================== //
                    log.debug("Update food quantity")
                    const updateFood = await updateFoodQuantity(order.Food_item);
                    if(updateFood.length == 0){
                        log.warn({message: 'failed to update food quantity.'})
                    }
                    log.debug(updateFood)
                    
                    // update the purchaerlog status to redemed if order using discount //
                    if(order.Discount != undefined){
                        log.debug({
                            message: "Order used discount code, update purcahse log",
                            Discount: order.Discount
                        })
                        const updateStatus = await updatePurchaseLogStatus(order.User, order.Store, purchaseLog.redeemed);
                        updateStatus ? log.debug('update purchaselog successfully') : log.warn('failed to update purchase log')
                    }
                    // ================== Create and update Purchase log ============================ //
                    console.log('------------------- Create Purchase log -------------------------')
                    const updatePurchase = await CreatePurchaseLog(getOrder);
                    if(updatePurchase.length == 0){
                        log.warn({
                            message: "Faild to update purchase log."
                        })
                    }

                    log.debug(updatePurchase)
                },time)
    
                return
            }

            log.info('Store recived order successfully.');
            let [getUpdateOrder] = await Make_Query(`
                SELECT * FROM Orders WHERE Order_number = '${Order_number}'    
            `);

            // send order to user as pending status
            socket.emit(socketConfig.confirmRecivedOrder, getUpdateOrder);

            ////////////////////////////////////////////////////////////////////////////////////

            // Handle update Food quantity after be ordered ===================== //
            log.debug("Update food quantity")
            const updateFood = await updateFoodQuantity(order.Food_item);
            if(updateFood.length == 0){
                log.warn({message: 'failed to update food quantity.'})
            }
            log.debug(updateFood)
  
            // update the purchaerlog status to redemed if order using discount //
            if(order.Discount != undefined){
                log.debug({
                    message: "Order used discount code, update purcahse log",
                    Discount: order.Discount
                });
                const updateStatus = await updatePurchaseLogStatus(order.User, order.Store, purchaseLog.redeemed);
                updateStatus ? log.debug('update purchaselog successfully') : log.warn('failed to update purchase log')
            }
            

            // ================== Create and update Purchase log ============================ //
            console.log('------------------- Create Purchase log -------------------------')
            const updatePurchase = await CreatePurchaseLog(getOrder);
            if(updatePurchase.length == 0){
                log.warn({
                    message: "Faild to update purchase log."
                })
            }

            log.debug(updatePurchase)
            return
                
        }, time);
        
        
        // ================ Get the food list then send to all users ======================= //
        
    }
    catch(error){
        return{
            success: false,
            message: "Failed newOrderHandler procesing.",
            data: []
        }
    }
}


async function getStoreSocketId(Store) {
    try{
        const Store_id = Store?.Store_id;
        
        const [getUserId] = await Make_Query(`
            SELECT User_id FROM Stores WHERE Store_id = ${Store_id}    
        `)
        if(!getUserId){
            log.err({
                message: 'newOrderHandler: Failed to recived User_id',
            });
            return []
        }

       const User_id = getUserId.User_id;

       const [getSocketId] = await Make_Query(`
            SELECT * FROM Socketio WHERE User_id = ${User_id}
        `);

        if(!getSocketId){
            log.err({
                message: 'newOrderHandler: Failed to recived socketId',
            });
            return []
        }
        const SocketId = getSocketId.Socket_id
        return SocketId;

    }catch(error){
        log.err({
            message: 'newOrderHandler: Failed to recived socketId',
        });
        return []
    }
}

async function checkOrderStatus(order ,expectStatus) {
    const Order_number = order.Order_number;
  
    const [checkOrder] = await Make_Query(`
        SELECT * FROM Orders WHERE Order_number = '${Order_number}'   
    `);
    if(!checkOrder){
        log.debug("order not exist");
        return false
    }

    if(checkOrder.Order_status != expectStatus){
        log.debug({
            message: "Order status not match the expect Status",
            expectStatus: expectStatus,
            currentStatus: checkOrder.Order_status
        });
        return false
    }

    log.debug({
        message: "Order Status is match the expect Status.",
        expectStatus: expectStatus,
        currentStatus: checkOrder.Order_status
    });
    return true
}


export default newOrderHandler;