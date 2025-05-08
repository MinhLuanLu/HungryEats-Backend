import { Make_Query } from "../../database/databaseConnection.js";
import log from "minhluanlu-color-log";

async function CreateDiscount(request, response) {
    const {Data} = request.body;
    log.debug("---------------- Recived create discount event ------------------")
    console.log(Data)
    const {
        Discount_type,
        Discount_value,
        Purchase_count, 
        Discount_code
      } = Data

    try{
        await Make_Query(``)
    }
    catch(error){
        log.err({
            
        })
    }
    
}


async function GetDiscounts(req, res) {
    const {id} = req.params;
    log.debug("Recived store Discounts");
    const getDiscount = await Make_Query(`SELECT * FROM Discounts WHERE Store_id = ${id}`);

    if(getDiscount.length == 0){
        log.warn({
            message: "No discounts was found with store",
            storeId: id
        });
        res.status(400).json({
            success: false,
            message: "No discounts was found with store",
            storeId: id
        });
        return
    }

    log.debug({
        message: "Recived store discounts successfully.",
        data: getDiscount
    });

    res.status(200).json({
        success: true,
        message: "Recived store discounts successfully.",
        data: getDiscount
    });
    return

}


async function UpdateDiscount(req, res) {
    const {Data} = req.body;
    log.debug("------------- Recived update discount event ---------------------");
    const {
        Discounts_id,
        Store_id,
        Discount_code,
        Discount_type,
        Discount_value,
        Purchase_count
      } = Data;

    try{
        await Make_Query(`UPDATE Discounts SET Discount_code = '${Discount_code}', Discount_type = '${Discount_type}', Discount_value = ${Discount_value}, Purchase_count = ${Purchase_count}  WHERE Store_id = ${Store_id} AND Discounts_id = ${Discounts_id}`);
        const getDiscount = await Make_Query(`SELECT * FROM Discount WHERE Store_id = ${Store_id} AND Discounts_id = ${Discounts_id} `)
        log.debug({
            success: true,
            message: "update discount successfully.",
            data: getDiscount
        });

        res.status(200).json({
            success: true,
            message: "update discount successfully.",
            data: getDiscount
        });
        return
    }
    catch(error){
        log.debug({
            success: false,
            message: "failed update discounts.",
            data: []
        });

        res.status(400).json({
            success: false,
            message: "failed update discounts.",
            data: []
        });
        return
    }
}


async function DeleteDiscount(req, res) {
    const {id} = req.params
    log.debug("------------- Recived delete discount event ---------------------");
    
    try{
        await Make_Query(`DELETE FROM Discounts WHERE Discounts_id = ${id}`);

        log.debug({
            success: true,
            message: "Delete discount successfully.",
            data: id
        });

        res.status(200).json({
            success: true,
            message: "Delete discount successfully.",
            data: id
        });
        return
    }
    catch(error){
        log.err({
            success: false,
            message: "Failed to delete discount.",
            data: id
        });

        res.status(400).json({
            success: false,
            message: "Failed to delete discount.",
            data: id
        });
    }
}

export { 
    CreateDiscount, 
    GetDiscounts,
    UpdateDiscount,
    DeleteDiscount
}