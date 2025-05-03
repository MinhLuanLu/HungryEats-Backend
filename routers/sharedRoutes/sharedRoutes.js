import express from 'express';
import ApiShared from '../../api/apiShared/apiShared.js';

const router = express.Router();

router.get('/payments/refund/:id', ApiShared.refundPaymentHandler)


router.post('/register/api', ApiShared.Register);
router.post('/login/api', ApiShared.Login); 
router.post('/foodList/api', ApiShared.FoodList);
router.post('/menu/api', ApiShared.Menu);
router.post('/drink/api', ApiShared.Drink);
router.post('/payment/api', ApiShared.newPayment)


export default router;