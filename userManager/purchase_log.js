import { Make_Query } from "../database/databaseConnection.js";
import log from 'minhluanlu-color-log'

async function CreatePurchaseLog(order) {
    console.log('PUSRCHASE ORDER', order)
    const User_id = order.User_id;
    const Store_id = order.Store_id;
    let exist;
    try{
        const check_log = await Make_Query(`
            SELECT EXISTS (
              SELECT 1 FROM Purchase_log 
              WHERE User_id = ${User_id} AND Store_id = ${Store_id}
            ) AS exists_flag;
          `);
          
          const result = check_log[0]?.exists_flag ?? 0;
          const exist = result === 1;
          
       
        /// Purchase log not exists yet create one ///
        if(!exist){
            console.log('------------ Purchase log not exist yet, create one --------------------')
            log.info(`Create new purchase log with User_id:${User_id} and Store_id:${Store_id}`);
            try{
                await Make_Query(
                    `INSERT INTO Purchase_log (User_id , Store_id, Purchase_count, Type) VALUES(
                        ${User_id},
                        ${Store_id},
                        ${1},
                        'none'
                    )`);
                return{
                    success: true,
                    message: `Create Purchase Log for User_id:${User_id} with Store_id: ${Store_id}`,
                    data: 
                    {
                        Purchase_count: 1
                    }
                }
            }catch(error){
                log.warn(error);
                return []
            }
        }

        if(exist){
            console.log('------------- Purchase log exist already, update it ------------------------')
            console.log(`Update purchase log with User_id: ${User_id} and Store_id: ${Store_id}`);

            try{
                const [current_purchase_count] = await Make_Query(`SELECT Purchase_count FROM Purchase_log WHERE User_id = ${User_id} AND Store_id = ${Store_id}`);
                const new_purchase_count = current_purchase_count?.Purchase_count + 1; // update to 1
                
                await Make_Query(`UPDATE Purchase_log SET Purchase_count = ${new_purchase_count} WHERE User_id = ${User_id} AND Store_id = ${Store_id}`);
                return{
                    success: true,
                    message: `Update Purchase Log for User_id: ${User_id} with Store_id: ${Store_id}`,
                    data: 
                    {
                        Purchase_count: new_purchase_count
                    }
                }
            }catch(error){
                log.warn(error);
                return []
            }

        }
    }
    catch(error){
        log.warn(error)
        return []
    }
    
}

async function getDiscountCode(request, response) {
    const {
        User,
        Store
    } = request.body;

    let userPurchaseCount;
    let discountList = []

    try{
        const [userPurchaseLog] = await Make_Query(`SELECT * FROM Purchase_log WHERE User_id = ${User.User_id}`)
        userPurchaseCount = userPurchaseLog?.Purchase_count
        
        const storeDiscounts = await Make_Query(`SELECT * FROM Discounts INNER JOIN Stores ON Discounts.Store_id = Stores.Store_id WHERE Discounts.Store_id =  ${Store.Store_id}`);
        if(storeDiscounts.length === 0){
            log.debug({
                message: 'Store doesnt has discounts',
                discount: storeDiscounts
            })
            response.json({
                message: 'Store doesnt has discounts',
                discount: storeDiscounts
            })
            return
        }
        
        for(const storeItem of storeDiscounts){
            const storePurchaseCount = storeItem.Purchase_count;
            console.log('---------- check purchase count is match ----------------')
            log.debug({
                user: User.Email,
                store: Store.Store_name,
                requirePurchaseCount: storePurchaseCount,
                userPurchaseCount: userPurchaseCount
            })

            if(userPurchaseCount >= storePurchaseCount){
                discountList.push(storeItem)
            }
        }

        console.log('----------- check discount is done ------------------')
        if(discountList.length === 0){
            log.debug({
                message: 'no discount was found',
                store: Store.Store_name
            })
            response.json({
                message: 'no discount was found',
                store: Store.Store_name
            });
            return
        }

        response.status(200).send({
            success: true,
            message: "Discounts was found",
            data: discountList
            
        })
        return
    }
    catch(error){
        log.debug({
            success: false,
            message: error
        });

        response.status(400).json({
            success: false,
            message: error
        })
    }
}

async function ApplyDiscountCode(request, response) {
    const {
        User,
        Store,
        DiscountCode
    } = request.body;
    console.log(User)
    response.json({
        success: true,
        data: 'Hello'
    })
    return
    try{
        const {
            Email,
            Store_id,
            Discount_code
        } = request.body;
        const get_store_discount_count = await Make_Query(`SELECT * FROM Discounts INNER JOIN Stores ON Discounts.Store_id = Stores.Store_id WHERE Discounts.Store_id =  ${Store_id}`);
        for(const item of get_store_discount_count){
            const store_discount_count = item?.Purchase_count;
            const store_discount_code = item?.Discount_code;
        
            if(store_discount_count === undefined || store_discount_count < 1){
                log.debug({
                    success: false,
                    message: "No discount has been set!",
                    data: []
                });

                response.status(200).json({
                    success: false,
                    message: "No discount has been set!",
                    data: []
                });
                break
            }
            else{

                const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}'`);
                const User_id = get_user_id?.User_id;
                const [check_user_discount_count] = await Make_Query(`SELECT Purchase_count FROM Purchase_log WHERE User_id = ${User_id} AND Store_id = ${Store_id}`);
                const user_purchase_count = check_user_discount_count?.Purchase_count;
                
                if(user_purchase_count >= store_discount_count){
                    if(Discount_code == store_discount_code){
                        log.info({
                            success: true,
                            message: `You get a discount ${item?.Discount_value}% from ${item?.Store_name}`,
                            data: item
                        })

                        response.status(200).json({
                            success: true,
                            message: `You get a discount ${item?.Discount_value}% from ${item?.Store_name}`,
                            data: item
                        })
                        break
                    }else{
                        log.error(`Discount code doesn't match`)
                        response.json({
                            success:false,
                            message: `Discount code doesn't match`,
                            data: Discount_code
                        })
                        return
                    }
                }
                else{
                    console.log({
                        message: "User purchase count doesn't match to store discount count.",
                        data:  `Store discount count: ${store_discount_count} => User purchase count: ${user_purchase_count}`
                    });
                    response.json({
                        success: false,
                        message: "User purchase count dosen't match to store discount count.",
                        data: `Store discount count: ${store_discount_count} => User purchase count: ${user_purchase_count}`
                    })
                    return
                }
            }
        }
        response.json({
            success:false,
            message: `Discount code doesn't match`,
            data: Discount_code
        })
    }   
    catch(error){
        log.err('Failed to apply discount code');
        response.json({
            success: false,
            message: 'Failed to apply discount code',
            data: error
        })
        return
    }
}



async function updatePurchaseLog(User, Store) {

    const User_id = User?.User_id;
    const Store_id = Store?.Store_id;

    const [checkPurchaseLog] = await Make_Query(`
        SELECT * FROM Purchase_log WHERE User_id = ${User_id} AND Store_id = ${Store_id}    
    `);
    if(!checkPurchaseLog){
        log.debug({message: "No Purchase log exist."})
        log.info("Create new Purchase log");
        const createPurchaseLog = await Make_Query(`
            INSERT INTO Purchase_log (User_id, Store_id)
            VALUES(
                ${User_id}, ${Store_id}
            )
        `)

        return []
    };
    log.debug("log exist already, update it.")
    const Purchase_count = checkPurchaseLog.Purchase_count;

    const updatePurchaseLog = await Make_Query(`
        UPDATE Purchase_log
        SET Purchase_count = ${Purchase_count + 1}
        WHERE User_id = ${User_id} AND Store_id = ${Store_id};
    `)
    if(!updatePurchaseLog){
        log.warn({message: "Failed to update purchase log"})
        return []
    }

    log.info('Update purchase log successfully.');
    return [{
        success: true, 
        message: 'Update purchase log successfully.'
    }]
    
}

export { CreatePurchaseLog, getDiscountCode, ApplyDiscountCode, updatePurchaseLog}