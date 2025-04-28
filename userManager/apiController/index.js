import StoreList from "./store.js";
import Searching from "./searching.js";
import StoreFavorite from "./storeFavorite.js";
import PendingOrder from "./pendingOrder.js";
import OrderHistory from "./orderHistory.js";
import {getDiscountCode} from '../../userManager/purchase_log.js';
import { ApplyDiscountCode } from "../../userManager/purchase_log.js";
import PaymentMetodHandler from "./paymentMethod.js";
import { LookingForDiscount } from "../../userManager/purchase_log.js";


const userController = {
    StoreList,
    Searching,
    StoreFavorite,
    PendingOrder,
    OrderHistory,
    getDiscountCode,
    ApplyDiscountCode,
    PaymentMetodHandler,
    LookingForDiscount
}

export default userController;