// @ts-ignore
import { config as loadConfig } from "dotenv";

const dotenvResult = loadConfig();
if (dotenvResult.error) throw dotenvResult.error;

const config = dotenvResult.parsed;

console.log(config);
export const botToken: string = config.BOT_TOKEN;
export const mainGuildId: string = config.MAIN_GUILD_ID;
export const botOwnerId: string = config.BOT_OWNER_ID;

export const googleapisToken: string = config.GOOGLEAPIS_TOKEN;
