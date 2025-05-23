import express from 'express';
import multer from "multer";
import fs from 'fs';
import path from 'path';
import ApiShared from '../../api/apiShared/apiShared.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'upload/images')
    },
    filename: function (request, file, cb) {
    cb(null, file.originalname)
    }
})
const upload = multer({
    storage: storage,
    limits: {
      fieldSize: 10 * 1024 * 1024 // 10 MB field size limit
    }
  });



const router = express.Router();

router.get('/payments/refund/:id', ApiShared.refundPaymentHandler)

/////////////////////////////////////////////////////
router.post('/register/api', ApiShared.Register);
router.post('/login/api', ApiShared.Login); 
router.post('/drink/api', ApiShared.Drink);
router.post('/payment/api', ApiShared.newPayment);

////////////////////////////////////////////////////
router.post('/foodList/api', ApiShared.FoodList);
router.patch("/v1/store/upload/food/image", upload.single('image'), ApiShared.uploadFoodImage);
router.post("/v1/food",upload.single('image') , ApiShared.createFood);
router.delete("/v1/food/:id", ApiShared.deleteFood);
//////////////////////////////////////////////////////


////////////////////////////////////////////////////
router.post('/menu/api', ApiShared.Menu);
router.patch('/v1/menu',upload.single('image') ,ApiShared.updateMenu)

/////////////////////////////////////////////////////


export default router;