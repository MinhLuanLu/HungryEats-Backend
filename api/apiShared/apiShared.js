import Login from "../login.js";
import Register from "../register.js";
import {FoodList, uploadFoodImage, createFood, deleteFood} from "../food.js";
import {Menu, updateMenu} from "../menu.js";
import Drink from "../drink.js";
import { newPayment , refundPaymentHandler} from "../payment.js";

const ApiShared = {
    Login,
    Register,
    FoodList,
    uploadFoodImage,
    Menu,
    updateMenu,
    Drink, 
    newPayment,
    refundPaymentHandler,
    createFood,
    deleteFood
}

export default ApiShared;