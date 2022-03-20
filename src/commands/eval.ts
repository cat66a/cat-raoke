import { CommandInteraction } from "discord.js";

const { clean } = await import("../utils.js");
const { AdminSlashCommand, BaseSlashCommand, MusicSlashCommand } = await import(
  "../slashCommand.js"
);
const { MusicSubscription, joinVCAndCreateSubscription, subscriptions } =
  await import("../music/subscription.js");
const { Track } = await import("../music/track.js");
const { commandPropertiesArray, commands, loadCommands } = await import(
  "../commands.js"
);
const botConfig = await import("../loadedConfig.js");
const {
  restLoadApplicationCommands,
  restLoadPublicCommands: restLoadProdCommands,
  restLoadTestCommands,
  restDeleteApplicationCommands,
} = await import("../rest.js");
const lgbt = await import("../pfpLgbtApiWrapper.js");

class EvalCommand extends AdminSlashCommand {
  constructor() {
    super({
      name: "eval",
      description: ":)",
      options: [{
        name: "code",
        description: "Code to execute",
        type: 3,
        required: true,
      }],
      default_permission: true,
    });
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();
    // In case something fails, we to catch errors
    // in a try/catch block
    let cleaned: string;
    const client = interaction.client;

    try {
      // Evaluate (execute) our input
      const evaled = eval((interaction.options.get("code").value) as string);

      // Put our eval result through the function
      // we defined above
      cleaned = await clean(evaled);

      // Reply in the channel with our result
      await interaction.followUp(`\`\`\`js\n${cleaned}\n\`\`\``);
    } catch (err) {
      cleaned = await clean(err);
      // Reply in the channel with our error
      await interaction.followUp(`\`ERROR\` \`\`\`xl\n${cleaned}\n\`\`\``);
    }
  }
}

export const command = new EvalCommand();
