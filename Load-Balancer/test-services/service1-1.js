import express from "express";

const app = express();

app.get("/demodata", (req, res) => {
  res.json(`Holaa!!! from Service-1-1`);
});

app.listen(3434, () => {
  console.log("Listening at PORT 3434");
});
