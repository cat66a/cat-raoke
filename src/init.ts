import { Client, CommandInteraction, Intents } from "discord.js";
import { commands, loadCommands } from "./loadCommands.js";
import { botToken, debugMode } from "./config.js";
import { restLoadApplicationCommands } from "./rest.js";
import { BaseSlashCommand } from "./slashCommand.js";

const { FLAGS } = Intents;

export async function init() {
  if (debugMode) {
    console.log("Bot launched in debug mode");
  }

  console.log('Loading commands inside "commands" dir');
  await loadCommands();
  console.log("Commands successfully loaded");
  console.log(Array.from(commands.keys()).join(" - "));

  console.log("Started reloading application (/) commands.");
  await restLoadApplicationCommands();
  console.log("Successfully reloaded application (/) commands.");

  const client = new Client({
    intents: [FLAGS.GUILDS, FLAGS.GUILD_VOICE_STATES, FLAGS.GUILD_MEMBERS],
  });

  client.on("ready", async () => {
    console.log(`Ready as ${client.user?.tag}`);
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

        console.log(commandName);
        const command = commands.get(commandName) as BaseSlashCommand;

        await command.preExec(interaction);
      } catch (error) {
        await interactionErrorHandler(interaction, error);
      }
    } catch (error2) {
      console.warn(error2);
    }
  });

  await client.login(botToken);
  console.log("Bot successfully login");
}

async function interactionErrorHandler(
  interaction: CommandInteraction,
  error: any,
) {
  if (!interaction.deferred) await interaction.deferReply();
  await interaction.followUp(
    "Une erreur est survenue lors de l'exécution de cette commande :/",
  );

  console.warn(error);
}
