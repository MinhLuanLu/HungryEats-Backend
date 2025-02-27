import { Make_Query } from "../../database/databaseConnection.js";


async function Searching(request, response) {
    try{
        const 
        {   PostCode,
            SearchName
        } = request.body;

        if (PostCode) {
            console.info("Received search value:", PostCode);
            let query = await Make_Query(`SELECT * FROM Stores WHERE PostCode LIKE "${PostCode}%" `)
            //console.log(query)
            if(query.length != 0){
                response.status(200).send({
                    message: 'Search request handled successfully!',
                    result: query
                });
            }
        }

        if(SearchName){
            console.info("Received search value:", SearchName);
            let query = await Make_Query(`SELECT * FROM Stores WHERE Store_Name LIKE "${SearchName}%" `)
            //console.log(query)
            if(query.length != 0){
                response.status(200).send({
                    message: 'Search request handled successfully!',
                    result: query
                });
            }
        }
    }
    catch(error){
        response.status(400).send(
            {
                success: false,
                message: error
            }
        )
        return{
            success: true,
            message: error
        }
    }
}


export default Searching;