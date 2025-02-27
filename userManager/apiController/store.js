import { Make_Query } from "../../database/databaseConnection.js";


export const StoreList = async (request, response) => {
    try{
        const store_list = await Make_Query("SELECT * FROM Stores");
        response.status(200).send(
            {   
                success: true,
                message: "The user has successfully requested the store list.",
                data: store_list
            }
        );
    }
    catch(error){
        response.status(400).send(
            {
                success: false,
                message: error,
            }
        )
    }
};
  

export default StoreList;