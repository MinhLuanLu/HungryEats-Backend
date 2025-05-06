import { Make_Query } from "../../database/databaseConnection.js";
import log from "minhluanlu-color-log";

async function CreateDiscount(request, response) {
    const {Store} = request.body;
    return
    try{
        const {
            Store_name,
            User_id,
            Email,
            Discount_code,
            Discount_type,
            Discount_value,
            Purchase_count,
            Request,
        }= request.body
        
        const [get_store_id] = await Make_Query(`SELECT Store_id FROM Stores WHERE User_id = ${User_id}`);
        const Store_id = get_store_id?.Store_id

        if(Request == "Create"){
            const save_Discount = await Make_Query(
            `INSERT INTO Discounts (Store_id, Discount_code, Discount_type, Discount_value, Purchase_count )
            VALUES(
                ${Number(Store_id)},
                '${Discount_code}',
                '${Discount_type}',
                ${Number(Discount_value)},
                ${Number(Purchase_count)}
            )`)
            response.status(200).send({
                success: true,
                message: `Create Discount setting from ${Store_name} successfully..`
            })
        }

        if(Request == "Update"){
            
            response.status(200).send({
                success: true,
                message: `Update new Discount setting from ${Store_name} successfully..`
            })
        }
    }
    catch(error){
        console.info(error)
    }
}


async function GetDiscounts(req, res) {
    const {id} = req.params;
    log.debug("Recived store Discounts");
    const getDiscount = await Make_Query(`SELECT * FROM Discounts WHERE Store_id = ${id}`);

    if(getDiscount.length == 0){
        log.warn({
            message: "No discounts was found with store",
            storeId: storeID
        });
        res.status(400).json({
            success: false,
            message: "No discounts was found with store",
            storeId: storeID
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

export { CreateDiscount, GetDiscounts}