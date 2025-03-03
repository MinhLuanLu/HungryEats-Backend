import { Make_Query } from "../database/databaseConnection.js";
import log from 'minhluanlu-color-log'

async function CreatePurchaseLog(order) {
    try{
        const User_id = order[0]["User_id"];
        const Store_id = order[0]["Store_id"];
        const [check_log] = await Make_Query(`SELECT EXISTS (SELECT 1 FROM Purchase_log WHERE User_id = ${User_id} AND Store_id = ${Store_id})`);
        const result = Object.keys(check_log)[0];
        if(!check_log[result]){
            console.log(`Create new purchase log with User_id:${User_id} and Store_id:${Store_id}`);
            const save_purchase_log = await Make_Query(
                `INSERT INTO Purchase_log (User_id , Store_id, Purchase_count) VALUES(
                    ${User_id},
                    ${Store_id},
                    ${1}
                )`);
            return{
                success: true,
                message: `Create Purchase Log for User_id:${User_id} with Store_id: ${Store_id}`,
                data: 
                {
                    Purchase_count: 1
                }
            }
        }

        if(check_log[result]){
            console.log(`Update purchase log with User_id: ${User_id} and Store_id: ${Store_id}`);
            const [current_purchase_count] = await Make_Query(`SELECT Purchase_count FROM Purchase_log WHERE User_id = ${User_id} AND Store_id = ${Store_id}`);
            const new_purchase_count = current_purchase_count?.Purchase_count + 1; // update to 1
            const update_purchase_count = await Make_Query(`UPDATE Purchase_log SET Purchase_count = ${new_purchase_count} WHERE User_id = ${User_id} AND Store_id = ${Store_id}`);
            return{
                success: true,
                message: `Update Purchase Log for User_id: ${User_id} with Store_id: ${Store_id}`,
                data: 
                {
                    Purchase_count: new_purchase_count
                }
            }

        }
    }
    catch(error){
        return{
            success: false,
            message: error
        }
    }
    
}

async function Purchase_Log_Check(request, response) {
    try{
        const {
            Email,
            Store_id
        } = request.body;
        const get_store_discount_count = await Make_Query(`SELECT * FROM Discounts INNER JOIN Stores ON Discounts.Store_id = Stores.Store_id WHERE Discounts.Store_id =  ${Store_id}`);
        
        for(const item of get_store_discount_count){
            const store_discount_count = item?.Purchase_count;
        
            if(store_discount_count === undefined || store_discount_count < 1){
                response.status(200).json({
                    success: false,
                    message: "No discount has been set!",
                    data: []
                });
            }
            else{

                const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}'`);
                const User_id = get_user_id?.User_id;
                const [check_user_discount_count] = await Make_Query(`SELECT Purchase_count FROM Purchase_log WHERE User_id = ${User_id} AND Store_id = ${Store_id}`);
                const user_purchase_count = check_user_discount_count?.Purchase_count;
                
                if(store_discount_count === user_purchase_count){
                    response.status(200).json({
                        success: true,
                        message: `You get a discount ${item?.Discount_value}% from ${item?.Store_name}`,
                        data: item
                    })
                    break
                }
            }
        }
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
            }
            else{

                const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}'`);
                const User_id = get_user_id?.User_id;
                const [check_user_discount_count] = await Make_Query(`SELECT Purchase_count FROM Purchase_log WHERE User_id = ${User_id} AND Store_id = ${Store_id}`);
                const user_purchase_count = check_user_discount_count?.Purchase_count;
                
                if(store_discount_count === user_purchase_count){
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
                    }
                }
            }
        }
    }   
    catch{
        log.error('Failed to apply discount code');
        response.status(400).json({
            success: false,
            message: 'Failed to apply discount code',
        })
    }
}

export { CreatePurchaseLog, Purchase_Log_Check, ApplyDiscountCode}