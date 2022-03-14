const import_path = "../config";

const config = require(import_path);

const bot_token: string = config.bot_token;
const main_guild_id: string = config.main_guild_id;
const bot_owner_id: string = config.bot_owner_id;
const guild_ids: [string] = config.guild_ids;

const googleapis_token: string = config.googleapis_token;

export { bot_owner_id, bot_token, googleapis_token, guild_ids, main_guild_id };
