import StoreList from "./store.js";
import Searching from "./searching.js";
import StoreFavorite from "./storeFavorite.js";
import PendingOrder from "./pendingOrder.js";
import OrderHistory from "./orderHistory.js";
import {Purchase_Log_Check} from '../../userManager/purchase_log.js';
import { ApplyDiscountCode } from "../../userManager/purchase_log.js";


const userController = {
    StoreList,
    Searching,
    StoreFavorite,
    PendingOrder,
    OrderHistory,
    Purchase_Log_Check,
    ApplyDiscountCode
}

export default userController;