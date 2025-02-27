import { connect } from "nats";
import config from "../config.js";
// Function to connect to NATS server (returns the connection);

async function QueueClient() {
    try {
        const nats = await connect({ servers: config.NATS_LOCATION });
        console.log(`Connected to NATS server running On ${config.NATS_LOCATION} `);
        return nats;
    } catch (error) {
        console.error("Error connecting to NATS:", error);
    }
}

export { QueueClient };
