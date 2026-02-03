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
    await client.INCR(`${SERVICES_KEY}:${serviceName}:total_servers`);
    await client.zAdd(`${SERVICES_KEY}:${serviceName}:servers`, {
      score: currTime,
      value: serviceURL,
    });
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

export async function LoadBalancer(req, res) {
  try {
    const requestMethod = req.method;
    console.log(req.method);
    const { serviceName } = req.params;

    // getting the available servers
    await client.connect();
    const totalServers = await client.get(
      `${SERVICES_KEY}:${serviceName}:total_servers`,
    );
    if (totalServers <= 0) {
      throw new Error(`${serviceName} is fully down`);
    }
    // total requests to the service
    await client.incr(`${SERVICES_KEY}:${serviceName}:number_of_requests`);
    const nthRequest = await client.get(
      `${SERVICES_KEY}:${serviceName}:number_of_requests`,
    );

    if (!nthRequest) {
      throw new Error("Error fetching nth server");
    }
    const serverNumber = nthRequest % totalServers;
    const serverUrl = await client.zRange(
      `${SERVICES_KEY}:${serviceName}:servers`,
      serverNumber,
      serverNumber,
    );
    await client.quit();
    res
      .status(200)
      .json({ message: `Request will be forwarded to server ${serverUrl}` });
  } catch (err) {
    await client.quit();
    console.error(err);
    res.status(500).json({ message: err });
  }
}
