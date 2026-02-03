import express from "express";
import { RegisterService } from "./controller/register-service.js";
import { LoadBalancer } from "./controller/load-balancer.js";

const app = express();
app.use(express.json());

app.post("/register-server", RegisterService);
app.post("/load-balance/:serviceName/*path", LoadBalancer);
app.get("/load-balance/:serviceName/*path", LoadBalancer);

app.listen(7878, () => {
  console.log("Service is listening at PORT 7878");
});
