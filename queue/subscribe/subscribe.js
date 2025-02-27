

async function Subscribe(queueClient) {
    queueClient.subscribe("user_purchase.1");
    
}

export default Subscribe;