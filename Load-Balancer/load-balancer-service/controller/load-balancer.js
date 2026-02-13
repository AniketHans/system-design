import axios from "axios";
import { createClient } from "redis";
import { SERVICES_KEY } from "../constant.js";

const client = createClient();
client.on("error", (err) => console.log("Unable to connect to redis", err));
await client.connect();

export async function LoadBalancer(req, res) {
  try {
    const requestMethod = req.method;
    console.log(req.method);
    const { serviceName } = req.params;

    // getting the available servers
    // const totalServers = await client.get(
    //   `${SERVICES_KEY}:${serviceName}:total_servers`,
    // );
    const servers = await client.zRange(
      `${SERVICES_KEY}:${serviceName}:servers`,
      0,
      -1,
    );

    const totalServers = servers.length;
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

    // forwarding the request using axios
    const targetUrl =
      serverUrl + req.originalUrl.replace(`/load-balance/${serviceName}`, "");

    console.log("***", targetUrl);

    const axiosConfig = {
      method: req.method, // Use the original request method (GET, POST, etc.)
      url: targetUrl,
      headers: { ...req.headers, host: new URL(targetUrl).host }, // Forward original headers and set the correct host
      data: req.body, // Forward the original request body (for POST, PUT, PATCH)
      responseType: "stream", // Crucial for handling responses as streams
    };

    const axiosResponse = await axios(axiosConfig);
    // await client.quit();
    // res.status(axiosResponse.status).send(axiosResponse.data);
    axiosResponse.data.pipe(res);

    // res
    //   .status(200)
    //   .json({ message: `Request will be forwarded to server ${serverUrl}` });
  } catch (err) {
    // await client.quit();
    console.error(err);
    res.status(500).json({ message: err });
  }
}
