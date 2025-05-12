import express, { json, request, response } from 'express';
import cors from 'cors';
import config from '../config.js';
import multer from "multer";
import fs from 'fs';
import path from 'path';
import log from 'minhluanlu-color-log';

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
    api_express.use(json({ limit: '10mb' }))
    api_express.use(cors())
    api_express.use(express.static('upload/images')); 
    api_express.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
};

export default API;