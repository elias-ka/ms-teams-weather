import { fetcher } from "itty-fetcher";
import { Env } from "./env";

/**
 * Represents the object returned by the OpenWeatherMap API.
 */
export interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

const openWeatherMap = fetcher({
  base: "https://api.openweathermap.org/data/2.5",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Parses the city and country from the given text.
 * Assumes the text is in the MS Teams format "\<at>Weather\<at> \<city\>, \<country\>".
 *
 * @param text The text to parse.
 * @returns An object with the parsed city and country.
 * @example
 * parseCityAndCountry("<at>Weather<at> New York, US");
 * // => { city: "New York", country: "US" }
 */
export const parseCityAndCountry = (text: string) => {
  // skip the <at>Weather<at> part
  const parts = text.split(" ").slice(1);
  const city = parts[0].trim();
  const country = parts[1] ? parts[1].trim() : "";
  return { city, country };
};

/**
 * Retrieves the weather information for a specific city and country.
 * @param city - The name of the city.
 * @param country - Optional ISO 3166 country code.
 * @param env - The environment configuration object.
 * @returns A promise that resolves to the weather response.
 */
export const getWeather = async (city: string, country: string, env: Env): Promise<WeatherResponse> => {
  const query = `${city}${country ? `,${country}` : ""}`;
  return (await openWeatherMap.get(
    `/weather?q=${query}&appid=${env.OPEN_WEATHER_MAP_API_KEY}&units=metric`
  )) as WeatherResponse;
};

/**
 * Formats a timestamp into a localized time string.
 * @param timestamp - The timestamp to format.
 * @param timezoneOffsetSeconds - The timezone offset in seconds.
 * @returns The formatted time string.
 */
export const formatTime = (timestamp: number, timezoneOffsetSeconds: number) => {
  // If a city is in UTC-5, the local time at that place is 5 hours behind UTC + the timezone offset of the local computer.
  // Not optimal but works as intended, and I'd prefer not to pull in a library for this.
  // Tested manually by Googling the sunrise/sunset times for different cities around the world,
  // but I'm not sure if daylight saving is accounted for.
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = MS_PER_SECOND * 60;
  const date = new Date(timestamp * 1000);
  const offset = date.getTimezoneOffset() * MS_PER_MINUTE;
  const millis = date.getTime() + timezoneOffsetSeconds * MS_PER_SECOND;
  return new Date(millis + offset).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Creates a nice forecast message from the given weather response.
 * @param res - The weather response to create a message from.
 * @returns The forecast message.
 */
export const createForecastMessage = (res: WeatherResponse): string => {
  const { name, sys, weather, main, wind, timezone } = res;
  const description = weather[0].description;
  const sunrise = formatTime(sys.sunrise, timezone);
  const sunset = formatTime(sys.sunset, timezone);
  const windSpeed = wind.speed.toFixed(1);
  const temperature = main.temp.toFixed(1);
  const humidity = main.humidity;
  return `The current weather in ${name}, ${sys.country} is characterized by ${description}, with a temperature of ${temperature}°C. The humidity level is ${humidity}%, and the wind speed is ${windSpeed} m/s. The sun will rise at ${sunrise} and set at ${sunset} local time.`;
};
