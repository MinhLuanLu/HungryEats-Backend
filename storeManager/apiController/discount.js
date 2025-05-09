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
        Discount_code,
        Store
      } = Data

    try{
        await Make_Query(`INSERT INTO Discounts (Store_id, Discount_code, Discount_type, Discount_value, Purchase_count)
            VALUES (
            ${Store?.Store_id}, '${Discount_code}', '${Discount_type}', '${Discount_value}', ${Purchase_count}
            )    
        `);

        const getDiscount = await Make_Query(`SELECT * FROM Discounts WHERE Store_id = ${Store.Store_id}`)

        log.debug({
            success: true,
            message:"create discount successfully.",
            data: getDiscount
        })
    }
    catch(error){
        log.err({
            error: error
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
        const getDiscount = await Make_Query(`SELECT * FROM Discounts WHERE Store_id = ${Store_id} AND Discounts_id = ${Discounts_id} `)
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
            message: error,
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
        const [getStore_id] = await Make_Query(`SELECT * FROM Discounts Where Discounts_id = ${id}`);
        await Make_Query(`DELETE FROM Discounts WHERE Discounts_id = ${id}`);

        const Store_id = getStore_id.Store_id;
        const getDiscounts = await Make_Query(`SELECT * FROM Discounts Where Store_id = ${Store_id}`)

        log.debug({
            success: true,
            message: "Delete discount successfully.",
            data: id
        });

        res.status(200).json({
            success: true,
            message: "Delete discount successfully.",
            data: getDiscounts
        });
        return
    }
    catch(error){
        log.err({
            success: false,
            message: error,
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