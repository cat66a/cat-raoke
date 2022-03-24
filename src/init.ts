import { Client, CommandInteraction, Intents } from "discord.js";
import { commands, loadCommands } from "./commands.js";
import { botToken } from "./loadedConfig.js";
import { restLoadApplicationCommands } from "./rest.js";

const { FLAGS } = Intents;

export async function init() {
  console.log('Loading commands inside "commands" dir');
  await loadCommands();
  console.log("Commands successfully loaded");

  const client = new Client({
    intents: [FLAGS.GUILDS, FLAGS.GUILD_VOICE_STATES, FLAGS.GUILD_MEMBERS],
  });

  client.on("ready", async () => {
    console.log(`Ready as ${client.user.tag}`);

    console.log("Started reloading application (/) commands.");
    try {
      await client.guilds.fetch();
      await restLoadApplicationCommands(Array.from(client.guilds.cache.keys()));
    } catch (err) {
      console.warn(err);
    }
    console.log("Successfully reloaded application (/) commands.");
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
        const command = commands.get(commandName);

        await command.preExec(interaction);
      } catch (error) {
        await interactionErrorHandler(interaction, error);
      }
    } catch (error2) {
      console.warn(error2);
    }
  });

  await client.login(botToken);
}

async function interactionErrorHandler(
  interaction: CommandInteraction,
  error: Error,
) {
  if (!interaction.deferred) await interaction.deferReply();
  await interaction.followUp(
    "Une erreur est survenue lors de l'exécution de cette commande :/",
  );

  console.warn(error);
}
