import express, { json, request, response } from 'express';
import cors from 'cors';
import config from '../config.js';
import multer from "multer";
import fs from 'fs';
import log from 'minhluanlu-color-log'

import sharedRoutes from '../routers/sharedRoutes/sharedRoutes.js'
import userRoutes from '../routers/userRoutes/userRoutes.js';
import storeRoutes from '../routers/storeRoutes/storeRoutes.js';
import adminRoutes from '../routers/adminRoutes/adminRoutes.js'

import { Make_Query } from '../database/databaseConnection.js';
import { socketConnection } from '../socketio/socketHandler.js';


async function API() {
    
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
        cb(null, 'upload/images')
        },
        filename: function (request, file, cb) {
        cb(null, file.originalname)
        }
    })
    
    const upload = multer({ storage: storage })

    const api_express = express() // Create A Server
    api_express.use(json())
    api_express.use(cors())
    api_express.use(express.static('upload/images')); 

    const PORT = config.API_PORT;
    api_express.use(cors())
    api_express.listen(
        PORT, '0.0.0.0',
        () => log.info(`Connected to API Server running On http://localhost:${PORT}`)
    )

    socketConnection(api_express) //// Run the SocketIO as Port:3001
    api_express.use(sharedRoutes); // Api for both users and stores
    api_express.use(userRoutes); // Api only for users 
    api_express.use(storeRoutes); // Api only for store
    api_express.use(adminRoutes) // Api only for Admin

    // ============= Handle From Project Management Tool ================================ //
    api_express.post('/edit_store/api', upload.single('image'), async (request, response) => {
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
    });

    // ================================================================================== //
};

export default API;