// @ts-ignore
import { Snowflake } from "discord.js";
import { config as loadConfig } from "dotenv";

try {
  const dotenvResult = loadConfig();

  if (dotenvResult.error) console.log(dotenvResult.error);
} catch (err) {
  console.warn(err);
}

const botToken = process.env.BOT_TOKEN as string;
const mainGuildID = process.env.MAIN_GUILD_ID as Snowflake;
const googleapisToken = process.env.GOOGLEAPIS_TOKEN as string;

let debugMode: boolean = process.env.DEBUG_MODE === "true";

if (!botToken || !mainGuildID || !googleapisToken) {
  throw "An environment variable is missing";
}

export function setDebugMode(on: boolean) {
  on ? process.env.DEBUG_MODE = "true" : process.env.DEBUG_MODE = "false";
  debugMode = on;
}

export { botToken, debugMode, googleapisToken, mainGuildID };
