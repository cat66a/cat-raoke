import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { bot_token, guild_id } from "../config";

const commands = [{
  name: "ping",
  description: "saucisse",
}];

const rest = new REST({ version: "9" }).setToken(bot_token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    const client_id: string = ((await rest.get("/users/@me")) as any).id;

    await rest.put(
      Routes.applicationGuildCommands(client_id, guild_id),
      { body: commands },
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
});
