import {
  FIXED_RATE_TOKEN_KEY,
  KEY,
  REQUEST_TIME_SET,
  TOKENS_PER_10_SEC,
} from "../constant.js";
import { client } from "./init.js";

export async function getToken(req, res) {
  try {
    await client.connect();
    const tokenNumber = await client.sPop(KEY);
    await client.quit();
    res.json({ status: 200, message: { token: tokenNumber } });
  } catch (err) {
    console.error(err);
    res.json({ status: 500, message: "Something went wrong" });
  }
}

export async function getTokenWithTimer(req, res) {
  try {
    const totalAllowedRequestsInOneMin = TOKENS_PER_10_SEC * 6;
    const reqTime = Date.now();
    await client.connect();
    let token;

    // Clear values older than 60 secs from the sorted sets before adding new request
    await client.zRemRangeByScore(REQUEST_TIME_SET, 0, reqTime - 60 * 1000);

    // get total number of left-timestamps
    const totalRequestsInLast1min = await client.zCard(REQUEST_TIME_SET);

    if (totalRequestsInLast1min + 1 <= totalAllowedRequestsInOneMin) {
      token = await client.sPop(FIXED_RATE_TOKEN_KEY);
      if (!token) {
        console.log("No tokens left");
        throw new Error(429);
      }
      await client.zAdd(REQUEST_TIME_SET, {
        score: reqTime,
        value: `User-${reqTime}`,
      });
    } else {
      console.log("More requests in past 1 min than the allowed limit");
      throw new Error(429);
    }
    await client.quit();
    res.status(200).json({ message: { token: token } });
  } catch (err) {
    await client.quit();
    if (err?.message == 429) {
      res.status(429).json({
        message: "Too Many Requests, Try after some time",
      });
    } else {
      console.error(err);
      res.status(500).json({ status: 500, message: "Something went wrong" });
    }
  }
}
