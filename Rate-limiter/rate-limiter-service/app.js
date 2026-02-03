import express from "express";
import { getToken, getTokenWithTimer } from "./service/getToken.js";

const app = express();

app.get("/token", getToken);
app.get("/fixed-rate-tokens-and-timer", getTokenWithTimer);

app.listen(5656, () => {
  console.log("Listening at port 5656");
});
