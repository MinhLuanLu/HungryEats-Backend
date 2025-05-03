import Login from "../login.js";
import Register from "../register.js";
import FoodList from "../food.js";
import Menu from "../menu.js";
import Drink from "../drink.js";
import { newPayment , refundPaymentHandler} from "../payment.js";

const ApiShared = {
    Login,
    Register,
    FoodList,
    Menu,
    Drink, 
    newPayment,
    refundPaymentHandler
}

export default ApiShared;