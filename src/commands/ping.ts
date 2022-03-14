import { CommandInteraction } from "discord.js";
import { BaseSlashCommand } from "../slashCommand.js";

class PingCommand extends BaseSlashCommand {
  constructor() {
    super({ name: "ping", description: "pong" }, { global: true });
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply("Pong 🏓");
  }
}

export const command = new PingCommand();
