import { Make_Query } from "../../database/databaseConnection.js";


async function AdminUploadImage(request, response) {
    const File = request.file
            const file_name = File["originalname"]
    
            const {data} = request.body; 
            const Data = JSON.parse(data)
            let Store_id = Data?.Store_id
            let Store_name = Data?.Store_name
            let Request = Data?.Request
            let Food_id = Data?.Food_id
            let Food_name = Data?.Food_name
    
            let message = ""
            
            if (!request.file) {
                return response.status(400).json({ message: "The file upload has failed." });
            }
        
            // Handle to change Store Image Cover
            if(Request === "Change Store Image"){
                let [get_previous_store_image] = await Make_Query(`SELECT Store_image, Store_name FROM Stores WHERE Store_id = ${Store_id}`)
                let old_store_image = get_previous_store_image?.Store_image
                let get_store_name = get_previous_store_image?.Store_name
                let filePath = `upload/images/${old_store_image}`;
    
                if(old_store_image != "" || old_store_image != "none"){
                    if(old_store_image != file_name && get_store_name == Store_name){
                        fs.unlink(filePath, async (err) => {
                            if (err) {
                            console.debug("Error occurred while deleting the file.", err);
                            } else {
                            console.info(`File ${old_store_image} deleted successfully!`);
                            }
                        });
                    }else{
                        console.debug("The uploaded file is the same as the old image file.")
                    }
                }
    
                const save_image = await Make_Query(`UPDATE Stores SET Store_image = '${file_name}' WHERE Store_id = ${Store_id};`)
                message = "Store image uploaded successfully."
            }
    
            // Handle to change Food Image Cover
            if(Request === "Change Food Image"){
                let [get_previous_food_image] = await Make_Query(`SELECT Food_image, Food_name FROM Food WHERE Food_id = ${Food_id}`)
                let old_food_image = get_previous_food_image?.APIFood_image
                let get_food_name = get_previous_food_image?.Food_name
                let filePath = `upload/images/${old_food_image}`;
    
                if(old_food_image != "" || old_food_image != "none"){
                    if(old_food_image != file_name && get_food_name == Food_name){
                        fs.unlink(filePath, async (err) => {
                            if (err) {
                            console.debug("Error occurred while deleting the file.", err);
                            } else {
                            console.info(`File ${old_food_image} deleted successfully!`);
                            }
                        });
                    }else{
                        console.debug("The uploaded file is the same as the old image file.")
                    }
                }
                const save_image = await Make_Query(`UPDATE Food SET Food_image = '${file_name}' WHERE Food_id = ${Food_id};`)
                message = "Food image uploaded successfully.";
            }
    
            console.info(message)
    
            response.status(200).send({
                message: message
                
            })
}

export default AdminUploadImage;