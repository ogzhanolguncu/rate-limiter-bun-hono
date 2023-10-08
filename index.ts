import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();
app.get("/", (c) => c.text("PONG"));

//Middlewares
app.use("*", prettyJSON());

//Listen limited requests to rate limit
app.use("/limited/:id", async (_, next) => {
  console.log("middleware 1 start");
  await next();
  console.log("middleware 1 end");
});

app.get("/unlimited/:id", (c) => {
  return c.text("Unlimited! Let's Go!");
});
app.get("/limited/:id", (c) => {
  return c.text("Limited, don't over use me!");
});

export default app;
