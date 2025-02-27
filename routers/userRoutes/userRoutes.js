import express from 'express';
import userController from '../../userManager/apiController/index.js';

const router = express.Router();

// Define the route
router.get('/storeList/api', userController.StoreList);
router.post('/searching/api', userController.Searching);
router.post('/storeFavorite/api', userController.StoreFavorite);
router.post('/pendingOrder/api', userController.PendingOrder);
router.post('/orderHistory/api', userController.OrderHistory);
router.post('/purchaseLog/api', userController.Purchase_Log_Check);
router.post('/discountcode/api', userController.ApplyDiscountCode)

export default router;


