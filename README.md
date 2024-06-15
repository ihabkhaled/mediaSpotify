## Installation

FFMPEG library is mandatory to exist on server and callable by command "ffmpeg"

```bash
$ npm install -g @nestjs/cli
```

```bash
$ npm install
```

Environment variables are used to store configuration settings that your application needs to function properly. These settings can include database connection strings, API keys, or any other configuration data.

## Creating the .env File

1. **Copy `.env.dev` in the root directory of your project**
2. **Rename it to `.env` in the root directory of your project**
3. **Fill it with Spotify API variables (client_secret, client_id, redirect_uri)**

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```