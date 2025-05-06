import GetTodayOrder from "./getTodayOrder.js";
import {CreateDiscount, GetDiscounts} from "./discount.js";
import { RecivedOrders } from "./orders.js";
import MenuFood from "./menuFood.js";

const storeController = {
    GetTodayOrder,
    CreateDiscount,
    GetDiscounts,
    RecivedOrders,
    MenuFood
}

export default storeController;