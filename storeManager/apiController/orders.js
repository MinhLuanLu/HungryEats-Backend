import log from "minhluanlu-color-log";
import { Make_Query } from "../../database/databaseConnection.js";
import { response } from "express";
import { orderStatusConfig } from "../../config.js";

async function RecivedOrders(req, res) {
    const data = req.params;
    const id = Number(data.id)

    const getOrders = await Make_Query(`SELECT *
        FROM Orders 
        INNER JOIN Users ON Orders.User_id = Users.User_id
        WHERE Orders.Store_id = ${id} AND Orders.Order_status = '${orderStatusConfig.pending}';`
    );
    
    if(getOrders.length == 0){
        log.debug({
            message: "no orders was found",
            storeID: id
        })

        res.status(400).json({
            success: false,
            message: "no orders was found",
            storeID: id
        });
        return
    }

    getOrders.Password = "*********"

    log.debug("recived pending orders successfully.")
    res.status(200).json({
        success: true,
        message: "recived pending orders successfully.",
        data: getOrders

    });
    return
}


export {
    RecivedOrders
}