import { Make_Query } from "../database/databaseConnection.js";
import log from 'minhluanlu-color-log';
import { purchaseLog } from "../config.js";

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
          exist = result === 1;
          
       
        /// Purchase log not exists yet create one ///
        if(!exist){
            log.debug('------------ Purchase log not exist yet, create one --------------------')
            try{
                await Make_Query(
                    `INSERT INTO Purchase_log (User_id , Store_id, Purchase_count, Type, Status) VALUES(
                        ${User_id},
                        ${Store_id},
                        ${1},
                        'none',
                        '${purchaseLog.available}'

                    )`);
                log.debug("Create purchase log successfully.")
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
            log.debug({
                message: `Update purchase log`,
                User: User_id,
                Store: Store_id
            });

            let purchase_log = undefined

            const getPurchaseLog = await Make_Query(`SELECT * FROM Purchase_log WHERE User_id = ${User_id} AND Store_id = ${Store_id}`);

            for(const item of getPurchaseLog){
                const purchase_log_status = item.Status;
                if(purchase_log_status != purchaseLog.redeemed){
                    purchase_log = item
                }

            }
            

            if(purchase_log != undefined){
                log.debug("---------- update purchase log --------");
                try{
                    const [current_purchase_count] = await Make_Query(`SELECT Purchase_count FROM Purchase_log WHERE Purchase_log_id = ${purchase_log?.Purchase_log_id}`);
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

            log.debug({
                message: "All purchase status are redeemed, create a new one.",
                data: getPurchaseLog
            });

            try{
                await Make_Query(
                    `INSERT INTO Purchase_log (User_id , Store_id, Purchase_count, Type, Status) VALUES(
                        ${User_id},
                        ${Store_id},
                        ${1},
                        'none',
                        '${purchaseLog.available}'

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
        userPurchaseCount = userPurchaseLog?.Purchase_count;
        userPurchaseStatus = userPurchaseCount?.Status;
        
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

            if(userPurchaseCount >= storePurchaseCount && userPurchaseStatus === purchaseLog.available){
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
    try{
        const getDiscount = await Make_Query(`SELECT * FROM Discounts WHERE Store_id = ${Store.Store_id}`);
        const [getUserPurchaseLog] = await Make_Query(`SELECT * FROM Purchase_log WHERE User_id = ${User.User_id} AND Status = '${purchaseLog.available}'`)
        
        const userPurchaseCount = getUserPurchaseLog.Purchase_count;
        const userPurchaseStatus = getUserPurchaseLog.Status;
        const userPurchaseID = getUserPurchaseLog.Purchase_log_id;

        for(const item of getDiscount){
            const storePurchaseCount = item.Purchase_count;
            const storeDiscountCode = item.Discount_code;
           
            // if user purchase count is == or more than store purchae count require than chank the discount code //
            if(userPurchaseCount >= storePurchaseCount && userPurchaseStatus != purchaseLog.redeemed ){
                
                if(storeDiscountCode.trim().toLowerCase() !== DiscountCode.trim().toLowerCase() && userPurchaseStatus !== purchaseLog.redeemed) {
                    log.debug({
                        success: false,
                        message: "discount code not vailid",
                        discountCode: DiscountCode,
                        data: item
                    })
                    response.status(200).json({
                        success: false,
                        message: "discount code not vailid",
                        discountCode: DiscountCode,
                    })
                    return
                }
                if(storeDiscountCode.trim().toLowerCase() === DiscountCode.trim().toLowerCase()) {
                    log.debug({
                        success: true,
                        message: "discount code is correct",
                        discountCode: DiscountCode,
                        data: item
                    })

                    response.status(200).json({
                        success: true,
                        message: "Discount code was  found.",
                        discountCode: DiscountCode,
                        data: item
                    });
                    return
            
                }
            }else{
                log.debug({
                    message: 'user purchase log is not match with store require',
                    userPurchase: getUserPurchaseLog,
                    storeRequire: item
                });
                response.status(200).json({
                    success: false,
                    message: 'user purchase log is not match with store require',
                    userPurchase: getUserPurchaseLog,
                    storeRequire: item
                })
                return
            }
        }

        response.status(400).json({
            success: false,
            message: "apply discount code failed",
            discountCode: DiscountCode,
        })

    }catch(error){
        response.status(400).json({
            success: false,
            message: "apply discount code failed",
            discountCode: DiscountCode,
        })
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



async function updatePurchaseLogStatus(User, Store, Status) {
    try{
        const [purchaseLog] = await Make_Query(`SELECT * FROM Purchase_log WHERE User_id = ${User.User_id} AND Store_id = ${Store.Store_id}`);
        if(purchaseLog == undefined){
            log.warn({
                message: "Failed to get Purchase log",
                purchaseLog: purchaseLog
            })
            return false
        }

        if(Object.keys(purchaseLog).length  == 0){
            log.warn({
                message: "Failed to get Purchase log",
                purchaseLog: purchaseLog
            })
            return false
        }

        log,debug("recived purchase log successfully.")
        try{
            const updatePurchaseLog = await Make_Query(`
                UPDATE Purchase_log
                SET Status = '${Status}'
                WHERE User_id = ${User.User_id} AND Store_id = ${Store.Store_id};
            `)

            log.debug({
                message:'update purchaseLog successfully',
                status: Status
            })

            return true
        }catch(error){
            log.err({
                message:'Failed to update purchaseLog ',
                status: Status,
                error: error
            });
            return false
        }


    }catch(error){
        log.err({
            message: "Failed to update Purchase log status",
            error: error
        })
    }
}


async function LookingForDiscount(request, response) {
    console.log('-------- looking for discounts ------------------');

    const {
        User,
        Store
    } = request.body;

    let discountList = []

    try{
        const userPurchaseLog = await Make_Query(`SELECT * FROM Purchase_log WHERE User_id = ${User.User_id} AND Status = '${purchaseLog.available}'`);
        const storeDiscount = await Make_Query(`SELECT * FROM Discounts WHERE Store_id = ${Store.Store_id}`);
        
        for(const user of userPurchaseLog){
            const userPurchaseCount = user.Purchase_count;

            for(const store of storeDiscount){
                const storePurchaseCount = store.Purchase_count;
                
                if(userPurchaseCount >= storePurchaseCount){
                    log.debug({
                        message: "discount was found",
                        data: store
                    })
                    discountList.push(store)
                }
            }
        }

        if(discountList.length === 0){
            log.debug({
                message: "no discount was found",
                user: User,
                store: Store
            });

            response.status(404).json({
                success: false,
                message:'no discount was found',
                data: discountList
            })
            return
        };

        return response.status(200).json({
            success: true,
            message: "discounts was found",
            data: discountList
        })
    }catch(error){
        log.err({
            success: false,
            message: error
        })
    }
}

export { 
    CreatePurchaseLog, 
    getDiscountCode, 
    ApplyDiscountCode, 
    updatePurchaseLog, 
    updatePurchaseLogStatus,
    LookingForDiscount
}