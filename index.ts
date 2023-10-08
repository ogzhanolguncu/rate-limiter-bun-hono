import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { SlidingWindowLog } from "./rate-limiters/sliding-window-log";
import { SlidingWindowCounter } from "./rate-limiters/sliding-window-counter";

// const rateLimiter = new TokenBucket();
// const rateLimiter = new FixedWindow();
// const rateLimiter = new SlidingWindowLog();
const rateLimiter = new SlidingWindowCounter();

const app = new Hono();
app.get("/", (c) => c.text("PONG"));

//Middlewares
app.use("*", prettyJSON());

app.use("/limited/:id", async (context, next) => {
  const userId = context.req.param("id");
  const isAllowed = rateLimiter.isRequestAllowed(userId);
  if (!isAllowed) {
    return context.text("Too many requests!", 429);
  }
  await next();
});

app.get("/unlimited/:id", (c) => {
  return c.text("Unlimited! Let's Go!");
});
app.get("/limited/:id", (c) => {
  return c.text("Limited, don't over use me!");
});

export default app;
