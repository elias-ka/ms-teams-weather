import { fetcher } from "itty-fetcher";
import { Env } from "./env";

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

export const parseCityAndCountry = (text: string) => {
  const matches = text.match(/<at>Weather<\/at>\s+([^,]+)(?:,([A-Z]{2}))?/);
  if (!matches) {
    return null;
  }
  return { city: matches[1], country: matches[2] };
};

export const getWeather = async (city: string, country: string, env: Env): Promise<WeatherResponse> => {
  const query = `${city}${country ? `,${country}` : ""}`;
  return (await openWeatherMap.get(
    `/weather?q=${query}&appid=${env.OPEN_WEATHER_MAP_API_KEY}&units=metric`
  )) as WeatherResponse;
};

// Format the time to the local timezone of the city.
// e.g. if the city is in UTC-5, the local time at that place is 5 hours behind UTC + the timezone offset of the local computer.
// Not optimal but works as intended, and I'd prefer not to pull in a library for this.
// Tested manually by Googling the sunrise/sunset times for different cities around the world,
// but I'm not sure if daylight saving is accounted for.
export const formatTime = (timestamp: number, timezoneOffsetSeconds: number) => {
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

export const createForecastMessage = (res: WeatherResponse): string => {
  const text = `The current weather in ${res.name},${res.sys.country} is characterized by ${
    res.weather[0].description
  }, with a temperature of ${res.main.temp}°C. The humidity level is ${
    res.main.humidity
  }%, and the wind speed is ${res.wind.speed.toFixed()} m/s. Looking ahead to today, the sun will rise at ${formatTime(
    res.sys.sunrise,
    res.timezone
  )} and set at ${formatTime(res.sys.sunset, res.timezone)} local time.
    `;
  return text;
};