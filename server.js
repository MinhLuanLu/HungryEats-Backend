import API from "./api/api.js";
import Subscribe from "./queue/subscribe/subscribe.js"
import { QueueClient } from "./queue/queue.js";

//const queueClient = await QueueClient()

await API();
//await Subscribe(queueClient);