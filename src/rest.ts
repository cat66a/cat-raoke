import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { bot_token, main_guild_id } from "./loadedConfig";
import { commandPropertiesArray } from "./commands";

const rest = new REST({ version: "9" }).setToken(bot_token);

export async function RestLoadingApplicationCommands() {
  const client_id: string = ((await rest.get("/users/@me")) as any).id;

  const commandProperties = commandPropertiesArray();
  const testCommands = commandProperties.filter((commandProps) =>
    !commandProps.global
  );
  const globalCommands = commandProperties.filter((commandProps) =>
    commandProps.global
  );

  rest.put(
    Routes.applicationGuildCommands(client_id, main_guild_id),
    { body: testCommands.map((cmd) => cmd.APIProperties) },
  ).catch(console.warn);

  rest.put(
    Routes.applicationCommands(client_id),
    { body: globalCommands.map((cmd) => cmd.APIProperties) },
  ).catch(console.warn);
}
