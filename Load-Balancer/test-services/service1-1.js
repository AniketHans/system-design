import express from "express";

const app = express();

app.get("/heath-check", (req, res) => {
  res.json({ status: 200, message: Date.now(), service: "Service:1-1" });
});

app.get("/demodata", (req, res) => {
  res.json(`Holaa!!! from Service-1-1`);
});

app.listen(3434, () => {
  console.log("Listening at PORT 3434");
});
