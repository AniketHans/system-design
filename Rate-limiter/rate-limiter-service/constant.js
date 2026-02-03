export const KEY = "Rate-Limiter:Tokens";
export const FIXED_RATE_TOKEN_KEY = "Rate-Limiter:TokensAtFixedRate";
export const REQUEST_TIME_SET = "Rate-Limiter:RequestTimeSet";
export const TOKENS_PER_10_SEC = Number(process.env.NUMBER_OF_TOKENS) || 2;
