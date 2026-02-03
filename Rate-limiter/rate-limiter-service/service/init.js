import { createClient } from "redis";

export const client = createClient();
client.on("error", (err) => console.log("Unable to connect to redis", err));
