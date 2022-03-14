import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { bot_token, guild_ids, main_guild_id } from "./loadedConfig.js";
import { commandPropertiesArray } from "./commands.js";

const rest = new REST({ version: "9" }).setToken(bot_token);

export async function RestLoadingApplicationCommands() {
  try {
    const client_id: string = ((await rest.get("/users/@me")) as any).id;

    const commandProperties = commandPropertiesArray();
    const testCommands = commandProperties.filter((commandProps) =>
      !commandProps.global
    );
    const globalCommands = commandProperties.filter((commandProps) =>
      commandProps.global
    );

    /*
    const getGlobalCommands = await rest.get(
      Routes.applicationCommands(client_id),
    ) as [{ id: string }];

    await Promise.all(getGlobalCommands.map(async (cmd) => {
      await rest.delete(
        Routes.applicationCommand(client_id, cmd.id),
      );
    }));

    await Promise.all(guild_ids.map(async (guildId) => {
      const getGuildCommands = await rest.get(
        Routes.applicationGuildCommands(client_id, guildId),
      ) as [{ id: string }];

      await Promise.all(getGuildCommands.map(async (cmd) => {
        await rest.delete(
          Routes.applicationGuildCommand(client_id, guildId, cmd.id),
        );
      }));
    }));

    console.log("cc");
    */

    await rest.put(
      Routes.applicationGuildCommands(client_id, main_guild_id),
      { body: testCommands.map((cmd) => cmd.APIProperties) },
    );

    await rest.put(
      Routes.applicationCommands(client_id),
      { body: globalCommands.map((cmd) => cmd.APIProperties) },
    );
  } catch (error) {
    console.warn(error);
  }
}
