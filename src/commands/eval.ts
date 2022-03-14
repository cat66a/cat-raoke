import { CommandInteraction } from "discord.js";
import { clean } from "../utils";
import {
  AdminSlashCommand,
  BaseSlashCommand,
  MusicSlashCommand,
} from "../slashCommand";
import { MusicSubscription, subscriptions } from "../music/subscription";
import { Track } from "../music/track";
import { commandPropertiesArray, commands, loadCommands } from "../commands";
import * as config from "../loadedConfig";
import { RestLoadingApplicationCommands } from "../rest";

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
    } catch (error) {
      cleaned = await clean(error);
      // Reply in the channel with our error
      await interaction.followUp(`\`ERROR\` \`\`\`xl\n${cleaned}\n\`\`\``);
    }
  }
}

export const command = new EvalCommand();
