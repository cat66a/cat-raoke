import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { bot_token, guild_id } from "./loadedConfig";
import { commandPropertiesArray } from "./commands";

const rest = new REST({ version: "9" }).setToken(bot_token);

export async function RestLoadingApplicationCommands() {
  const client_id: string = ((await rest.get("/users/@me")) as any).id;

  await rest.put(
    Routes.applicationGuildCommands(client_id, guild_id),
    { body: commandPropertiesArray() },
  );
}
