import { Client, CommandInteraction, Intents } from "discord.js";
import { commands, loadCommands } from "./commands.js";
import { bot_token } from "./loadedConfig.js";
import { RestLoadingApplicationCommands } from "./rest.js";

const { FLAGS } = Intents;

const client = new Client({
  intents: [FLAGS.GUILDS, FLAGS.GUILD_VOICE_STATES, FLAGS.GUILD_MEMBERS],
});

console.log('Loading commands inside "commands" dir');
await loadCommands();
console.log("Commands successfully loaded");

console.log("Started reloading application (/) commands.");
await RestLoadingApplicationCommands();
console.log("Successfully reloaded application (/) commands.");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isCommand()) return;

    try {
      const { commandName } = interaction;
      if (!commands.has(commandName)) {
        await interaction.reply(
          `Une erreur étrange est survenue, je n'ai pas trouvé la commande au nom de ${commandName} dans mon code o_O`,
        );
      }

      const command = commands.get(commandName);

      await command.preExec(interaction);
    } catch (error) {
      await interactionErrorHandler(interaction, error);
    }
  } catch (error2) {
    console.warn(error2);
  }
});

async function interactionErrorHandler(
  interaction: CommandInteraction,
  error: Error,
) {
  console.warn(error);
}

await client.login(bot_token);
