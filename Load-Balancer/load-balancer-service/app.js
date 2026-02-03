import express from "express";
import { LoadBalancer, RegisterService } from "./controller/controller.js";

const app = express();
app.use(express.json());

app.post("/register-server", RegisterService);
app.post("/load-balance/:serviceName", LoadBalancer);

app.listen(7878, () => {
  console.log("Service is listening at PORT 7878");
});
