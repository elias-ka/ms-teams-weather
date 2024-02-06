import { IRequestStrict, Router, error, json } from "itty-router";
import { createForecastMessage, getWeather, parseCityAndCountry } from "./weather";
import { Env } from "./env";
import { verifySignature } from "./signature";

const USAGE =
  "usage: Mention the bot with the city name and country code (e.g. @Weather Helsinki,FI). Note that the country code is optional, but recommended to avoid ambiguity.";
const INVALID_SIGNATURE = "Invalid signature";
const ERROR_FETCHING_WEATHER = "Error fetching weather data";

const router = Router();

router.post("/weather", async (request: IRequestStrict, env: Env) => {
  if (!verifySignature(request, env.MS_TEAMS_SECRET)) {
    return new Response(INVALID_SIGNATURE, { status: 401 });
  }

  const json = await request.json();
  if (!json) {
    return new Response(USAGE, { status: 400 });
  }

  // @ts-ignore
  const parsed = parseCityAndCountry(json.text);
  if (!parsed) {
    return new Response(USAGE, { status: 400 });
  }

  const { city, country } = parsed;
  const res = await getWeather(city, country, env);
  if (res.cod !== 200) {
    return new Response(ERROR_FETCHING_WEATHER, { status: 500 });
  }

  return Response.json({ type: "message", text: createForecastMessage(res) });
});

router.all("*", () => new Response("Not Found!", { status: 404 }));

export default {
  fetch(request: Request, env: Env, ...args: any) {
    return router
      .handle(request, env, ...args)
      .then(json)
      .catch(error);
  },
};
