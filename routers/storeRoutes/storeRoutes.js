import express from 'express';
import storeController from '../../storeManager/apiController/index.js';

const router = express.Router();

router.get('/v1/store/orders/:id', storeController.RecivedOrders);
router.get('/v1/store/menufood/:id', storeController.MenuFood);
router.get('/v1/store/discounts/:id', storeController.GetDiscounts);

/////////////////////////////////////////////
router.post('/v1/discounts', storeController.CreateDiscount)

router.post('/get_today_order/api', storeController.GetTodayOrder);




export default router;