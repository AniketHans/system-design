import { createClient } from "redis";
const client = createClient();

client.on("error", (err) => console.log("Unable to connect to redis", err));
const tokens = Number(process.env.NUMBER_OF_TOKENS) || 5;
const tokensPer10Second = Number(process.env.NUMBER_OF_TOKENS) || 2;

// Using number as rate-limiter
async function UpdateTokenNumbers() {
  try {
    await client.connect();
    await client.setEx("Rate-Limiter:Tokens", 60, String(tokens)); // The token will expire in 60 seconds
    setInterval(async () => {
      await client.setEx("Rate-Limiter:Tokens", 60, String(tokens)); // The token will expire in 60 seconds
      console.log("Refilling");
      console.log("Curr tokens", await client.get("Rate-Limiter:Tokens"));
    }, 60 * 1000);
  } catch (err) {
    console.error("Unable to connect to the client", err);
  }
}

// Using token number as rate limiter
async function UpdateTokens() {
  let tokenAddInterval;
  try {
    let tokenList = [];
    for (let i = 0; i < tokens; i++) {
      tokenList.push(`token-${i}`);
    }
    console.log(tokenList);
    const KEY = "Rate-Limiter:Tokens";
    await client.connect();

    // Use a transaction (MULTI/EXEC) for atomicity
    await client.multi().sAdd(KEY, tokenList).expire(KEY, 60).exec();
    tokenAddInterval = setInterval(async () => {
      console.log("Refilling");
      await client.multi().sAdd(KEY, tokenList).expire(KEY, 60).exec();
    }, 60000);
  } catch (err) {
    console.error("Unable to connect to the redis client", err);
    clearInterval(tokenAddInterval);
    await client.quit();
  }
}

// Using token number as rate limiter
async function UpdateTokensAtFixedRate() {
  let tokenAddInterval;
  try {
    let tokenList = [];
    for (let i = 0; i < tokensPer10Second; i++) {
      tokenList.push(`token-${i}`);
    }
    console.log(tokenList);
    const KEY = "Rate-Limiter:TokensAtFixedRate";
    await client.connect();
    await client.sAdd(KEY, tokenList);
    tokenAddInterval = setInterval(async () => {
      const tokenRefillList = [];
      const leftTokens = await client.sCard(KEY);
      console.log("Total tokens present", leftTokens);
      if (leftTokens < tokensPer10Second) {
        console.log("Refilling");
        for (let i = 0; i < tokensPer10Second - leftTokens; i++) {
          tokenRefillList.push(`token-${Date.now()}-${i}`);
        }
        console.log(tokenRefillList);
        await client.sAdd(KEY, tokenRefillList);
      }
    }, 10000);
  } catch (err) {
    console.error("Unable to connect to the redis client", err);
    clearInterval(tokenAddInterval);
    await client.quit();
  }
}

UpdateTokensAtFixedRate();
