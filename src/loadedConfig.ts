// @ts-ignore
import config from "../config.json" assert { type: "json" };

export const botToken: string = config.bot_token;
export const mainGuildId: string = config.main_guild_id;
export const botOwnerId: string = config.bot_owner_id;
export const whitelistedGuildIds: [string] = config.guild_ids;

export const googleapisToken: string = config.googleapis_token;
