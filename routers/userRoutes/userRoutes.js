import express from 'express';
import userController from '../../userManager/apiController/index.js';

const router = express.Router();

// Define the route
////////////////////////////////
router.get('/storeList/api', userController.StoreList);
router.get('/paymentMethod/api', userController.PaymentMetodHandler)

////////////////////////////////////////
router.post('/searching/api', userController.Searching);
router.post('/storeFavorite/api', userController.StoreFavorite);
router.post('/pendingOrder/api', userController.PendingOrder);
router.post('/orderHistory/api', userController.OrderHistory);
router.post('/getDiscountCode/api', userController.getDiscountCode);
router.post('/ApplyDiscountCode/api', userController.ApplyDiscountCode);
router.post('/paymentMethod/api', userController.PaymentMetodHandler);
router.post('/find/discounts/api', userController.LookingForDiscount)

export default router;


