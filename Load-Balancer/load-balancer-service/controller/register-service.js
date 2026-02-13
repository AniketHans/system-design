import { createClient } from "redis";
import { SERVICES_KEY } from "../constant.js";

const client = createClient();
client.on("error", (err) => console.log("Unable to connect to redis", err));

export async function RegisterService(req, res) {
  try {
    const currTime = Date.now();
    const { serviceName, serviceURL } = req.body;
    // here we are using redis but you can use persistent storage as well
    await client.connect();
    // await client.INCR(`${SERVICES_KEY}:${serviceName}:total_servers`);
    await client.zAdd(`${SERVICES_KEY}:${serviceName}:servers`, {
      score: currTime,
      value: serviceURL,
    });
    await client.sAdd(SERVICES_KEY, serviceName);
    await client.quit();
    res
      .status(200)
      .json({ message: `New Server registered for ${serviceName}` });
  } catch (err) {
    console.error(err);
    await client.quit();
    res
      .status(500)
      .json({ message: "Internal Server Error while registering the service" });
  }
}
