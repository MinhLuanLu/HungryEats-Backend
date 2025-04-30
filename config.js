

export const config = {
    API_PORT: 3000,
    SOCKET_PORT: 3001,
    NATS_LOCATION: "nats://localhost:4222",
};

export const socketConfig = {
    processOrder: "user.newOrderHandler.1",
    confirmRecivedOrder: "store.confirmRecivedOrder.1",
    updateStoreState: "store.updateStoreState.1",
    orderAction: "store.orderAction.1",
    orderUnprocessing: "order.unprocessing.1",
    failedRecivedOrder: 'order.failedRecivedOrder.1'
}

export const orderStatusConfig = {
    unprocessing: 'unprocessing',// default
    pending: "pending", // when store recived the order
    procesing: "processing",// when store recived order
    ready: "ready", // when order is ready
    done: "done", // when order is ready
    cancle : "cancle", // when store cancle order
    failed: "failed"
}

export const ADMIN = {
    business: "business",
    private: "private"
}

export const purchaseLog = {
    available: "available",
    assigned: "assigned",
    redeemed: "redeemed"
}

export const demoAccount = {
    cardNumber: 411111111111,
    CCV: 123
}

export const storeStatus = {
    customer: 1
}

export default config; 
