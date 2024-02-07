# ms-teams-weather
Microsoft Teams bot that fetches the current weather for a specified city and country.
Done as a part of a Cloud Services course at Oulu University of Applied Sciences.

 It handles incoming requests to fetch weather data for a specified city and country.
 The bot verifies the request signature, parses the city and country from the request payload,
 fetches the weather data, and returns a forecast message as a response back to the user.

## Example usage
To use the bot, you need to deploy it using the instructions below.
Once deployed, use the bot by mentioning it in a channel and providing the city and country you want to get the weather for.

For example:
> @Weather Helsinki, FI
>
>The current weather in Helsinki, FI is characterized by few clouds, with a temperature of -10.1°C. The humidity level is 79%, and the wind speed is 5.4 m/s. The sun will rise at 08:22 AM and set at 04:46 PM local time.

## Deployment
### Prerequisites
- [CloudFlare](https://www.cloudflare.com/) account
- [OpenWeatherMap](https://openweathermap.org/api) API key
- [Microsoft Teams](https://www.microsoft.com/en-us/microsoft-teams/group-chat-software) team where you have the necessary permissions to install apps

After you have met the prerequisites, you can deploy the bot by following these steps:

1. **Clone the repository:**
```bash
$ git clone git@github.com:elias-ka/ms-teams-weather.git
$ cd ms-teams-weather
```

2. **Install dependencies:**
```bash
$ npm install
```

3. **Set the OpenWeatherMap API key in CloudFlare secrets:**
```bash
$ npx wrangler secret put OPEN_WEATHER_MAP_API_KEY
```

4. **Deploy the bot to CloudFlare and follow the instructions:**
```bash
$ npm run deploy
```

5. **Create an outgoing webhook in Microsoft Teams:**
- Go to your Microsoft Teams team and go to `Manage Team -> Apps -> Create an outgoing webhook`
- Set the following values:
  - Name: Weather
  - Callback URL: https://\<your-worker-name\>.workers.dev/weather
  - Description: Get the current weather at a city. Example: @Weather Helsinki, FI
  - Optionally, you can set a profile picture for the bot.
- Click `Create` to create the webhook.
- Copy the `HMAC token` from the dialogue, as you will need it in the next step.

6. **Set the HMAC token as a CloudFlare secret:**
```bash
$ npx wrangler secret put MS_TEAMS_SECRET
```

7. **Finally, redeploy the bot to CloudFlare:**
```bash
$ npm run deploy
```

For more information, see the [official documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-outgoing-webhook?tabs=urljsonpayload%2Cjavascript#create-outgoing-webhooks-1).
