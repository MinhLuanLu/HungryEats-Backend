import express from 'express';
import storeController from '../../storeManager/apiController/index.js';

const router = express.Router();


router.post('/get_today_order/api', storeController.GetTodayOrder);
router.post('/discounts/api', storeController.CreateDiscount)



export default router;