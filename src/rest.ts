import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { botToken, mainGuildId, whitelistedGuildIds } from "./loadedConfig.js";
import { commandPropertiesArray } from "./commands.js";
import { Snowflake } from "discord.js";
import { BaseSlashCommand } from "./slashCommand.js";

const rest = new REST({ version: "9" }).setToken(botToken);
const client_id: string = ((await rest.get("/users/@me")) as any).id;

export async function restLoadApplicationCommands(
  guildIDs: Snowflake[] = [],
) {
  try {
    const commandProperties = commandPropertiesArray();
    const testCommands = commandProperties.filter((commandProps) =>
      !commandProps.public_
    );
    const publicCommands = commandProperties.filter((commandProps) =>
      commandProps.public_
    );

    await restLoadTestCommands(testCommands);
    await restLoadPublicCommands(publicCommands, guildIDs);

    /*
    await rest.put(
      Routes.applicationCommands(client_id),
      { body: publicCommands.map((cmd) => cmd.APIProperties) },
    );
    */
  } catch (err) {
    console.warn(err);
  }
}

export async function restLoadTestCommands(commandProps: BaseSlashCommand[]) {
  await rest.put(
    Routes.applicationGuildCommands(client_id, mainGuildId),
    { body: commandProps.map((cmd) => cmd.properties) },
  );
}

export async function restLoadPublicCommands(
  commandProps: BaseSlashCommand[],
  guildIDs: Snowflake[],
) {
  await Promise.all(guildIDs.map(async (guildID) => {
    await rest.put(
      Routes.applicationGuildCommands(client_id, guildID),
      { body: commandProps.map((cmd) => cmd.properties) },
    );
  }));
}

// 0 = all, 1 = only global cmds, 2 = only guild cmds
export async function restDeleteApplicationCommands(mode: 0 | 1 | 2) {
  if (mode === 0 || 1) {
    const getGlobalCommands = await rest.get(
      Routes.applicationCommands(client_id),
    ) as [{ id: string }];

    await Promise.all(getGlobalCommands.map(async (cmd) => {
      await rest.delete(
        Routes.applicationCommand(client_id, cmd.id),
      );
    }));
  }

  if (mode === 0 || 2) {
    await Promise.all(whitelistedGuildIds.map(async (guildId) => {
      const getGuildCommands = await rest.get(
        Routes.applicationGuildCommands(client_id, guildId),
      ) as [{ id: string }];

      await Promise.all(getGuildCommands.map(async (cmd) => {
        await rest.delete(
          Routes.applicationGuildCommand(client_id, guildId, cmd.id),
        );
      }));
    }));
  }
}
