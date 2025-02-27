import express from 'express'
import multer from "multer";
import fs from 'fs';
import AdminController from '../../adminManager/apiController/adminController.js';

const router = express.Router()

const storage = multer.diskStorage({
        destination: function (req, file, cb) {
        cb(null, 'upload/images')
        },
        filename: function (request, file, cb) {
        cb(null, file.originalname)
        }
    })
    
const upload = multer({ storage: storage })


router.post('/edit_store/api', upload.single('image'), AdminController.AdminUploadImage);

export default router;