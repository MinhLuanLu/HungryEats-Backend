import Login from "../login.js";
import Register from "../register.js";
import {FoodList, uploadFoodImage, createFood} from "../food.js";
import Menu from "../menu.js";
import Drink from "../drink.js";
import { newPayment , refundPaymentHandler} from "../payment.js";

const ApiShared = {
    Login,
    Register,
    FoodList,
    uploadFoodImage,
    Menu,
    Drink, 
    newPayment,
    refundPaymentHandler,
    createFood
}

export default ApiShared;