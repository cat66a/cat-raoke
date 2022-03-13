import { CommandInteraction } from "discord.js";
import { BaseSlashCommand } from "../slashCommand";

class PingCommand extends BaseSlashCommand {
  constructor() {
    super({ name: "ping", description: "sausage" });
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply(":)");
  }
}

export const command = new PingCommand();
