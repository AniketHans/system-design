import { createClient } from "redis";
import { SERVICES_KEY } from "../load-balancer-service/constant.js";
import axios from "axios";

const client = createClient();
await client.connect();

setInterval(async () => {
  const services = await client.sMembers(SERVICES_KEY);
  console.log("***********************");
  services.forEach(async (service) => {
    const servers = await client.zRange(
      `${SERVICES_KEY}:${service}:servers`,
      0,
      -1,
    );
    console.log(service, servers);
    servers.forEach(async (server) => {
      let res;
      try {
        res = await axios.get(`${server}/heath-check`);
        if (res.status < 200 || res.status >= 300) {
          throw Error("Server inaccessible");
        }
      } catch (err) {
        console.log(`Error with ${service}:${server}`);
        await client.zRem(`${SERVICES_KEY}:${service}:servers`, server);
      }
    });
  });
}, 5000);
