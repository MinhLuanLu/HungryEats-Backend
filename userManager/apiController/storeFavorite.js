import { Make_Query } from "../../database/databaseConnection.js";

async function StoreFavorite(request, response) {
    try{
        const {
            Email,
            Store_name,
            Request
        } = request.body;

        const [get_user_id] = await Make_Query(`SELECT User_id FROM Users WHERE Email = '${Email}'`)
        const [get_Store_id] = await Make_Query(`SELECT Store_id FROM Stores WHERE Store_name = '${Store_name}'`)
        let User_id = get_user_id["User_id"]
        let Store_id = get_Store_id["Store_id"]

        if(Request == false){
            let result = false
            let message = `Remove ${Store_name} from favorites.`
            
            const check_favorite = await(Make_Query(`SELECT * FROM Store_favorite WHERE User_id = ${User_id} AND Store_id = ${Store_id}`))
            if(check_favorite.length == 0){
                const save_to_favorite = await Make_Query(`INSERT INTO Store_favorite(User_id, Store_id, Favorite_status) VALUES (${User_id}, ${Store_id}, 'true')`)
                console.info(`Set ${Store_name} as a favorite..`)
                result = true
                message = `Set ${Store_name} as a favorite..`
            }else{
                const delete_favorite = await Make_Query(`DELETE FROM Store_favorite WHERE User_id = ${User_id} AND Store_id = ${Store_id}`)
                console.info(`Remove ${Store_name} from favorites.`)
            }

            response.status(200).send({
                success: true,
                message: message,
                data: result
            })
        }

        if(Request == true){
            const get_favorite = await Make_Query(`SELECT * FROM Store_favorite WHERE User_id = ${User_id} AND Store_id = ${Store_id}`)
            let result = true
            let message = `${Store_name} has been set as a favorite by ${Email}.`
            if(get_favorite.length == 0){
                result = false
                message = `${Store_name} hasn't been set as a favorite by ${Email}.`
            }

            response.status(200).send({
                success: true,
                message: message,
                data: result
            })
        }

    }
    catch(error){
        response.status(400)({
            success: false,
            message: error,
            Result: result
        })
    }
}

export default StoreFavorite;