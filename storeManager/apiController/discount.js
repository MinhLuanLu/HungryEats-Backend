import { Make_Query } from "../../database/databaseConnection.js";

async function CreateDiscount(request, response) {
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

export default CreateDiscount