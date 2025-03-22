export const config = {
    API_PORT: 3000,
    SOCKET_PORT: 3001,
    NATS_LOCATION: "nats://localhost:4222",
};

export const socketConfig = {
    processOrder: "user.newOrderHandler.1"
}

export const orderStatusConfig = {
    pending: "pending",
    procesing: "processing",
    done: "done"
}

export default config; 
