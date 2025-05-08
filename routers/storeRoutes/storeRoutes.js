import express from 'express';
import storeController from '../../storeManager/apiController/index.js';

const router = express.Router();

router.get('/v1/store/orders/:id', storeController.RecivedOrders);
router.get('/v1/store/menufood/:id', storeController.MenuFood);

//////////////////////////////////////////////////
router.get('/v1/store/discounts/:id', storeController.GetDiscounts);
router.post('/v1/store/discounts', storeController.CreateDiscount);
router.patch('/v1/store/discounts', storeController.UpdateDiscount);
router.delete('/v1/store/discounts/:id', storeController.DeleteDiscount)
/////////////////////////////////////////////


router.post('/get_today_order/api', storeController.GetTodayOrder);




export default router;