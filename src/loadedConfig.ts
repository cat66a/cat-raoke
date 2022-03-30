// @ts-ignore
import { Snowflake } from "discord.js";
import { config as loadConfig } from "dotenv";

try {
  const dotenvResult = loadConfig();

  if (dotenvResult.error) console.log(dotenvResult.error);
} catch (err) {
  console.warn(err);
}

const botToken: string = process.env.BOT_TOKEN;
const mainGuildId: Snowflake = process.env.MAIN_GUILD_ID;
const googleapisToken: string = process.env.GOOGLEAPIS_TOKEN;

let debugMode: boolean = process.env.DEBUG_MODE === "true";

if (!botToken || !mainGuildId || !googleapisToken) {
  throw "An environment variable is missing";
}

export function setDebugMode(on: boolean) {
  on ? process.env.DEBUG_MODE = "true" : process.env.DEBUG_MODE = "false";
  debugMode = on;
}

export { botToken, debugMode, googleapisToken, mainGuildId };
