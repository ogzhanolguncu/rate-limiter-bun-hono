import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { TokenBucket } from "./rate-limiters/token-bucket";

const rateLimiter = new TokenBucket();
const app = new Hono();
app.get("/", (c) => c.text("PONG"));

//Middlewares
app.use("*", prettyJSON());

app.use("/limited/:id", async (context, next) => {
  const currentToken = rateLimiter.startRateLimitingForUser(context.req.param("id"));
  if (currentToken === 0) {
    return context.text("Too many requests!", 429);
  }
  rateLimiter.removeToken(context.req.param("id"));
  await next();
});

app.get("/unlimited/:id", (c) => {
  return c.text("Unlimited! Let's Go!");
});
app.get("/limited/:id", (c) => {
  return c.text("Limited, don't over use me!");
});

export default app;
