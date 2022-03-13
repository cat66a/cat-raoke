import { CommandInteraction } from "discord.js";
import { BaseSlashCommand } from "../slashCommand";

class PingCommand extends BaseSlashCommand {
  constructor() {
    super({ name: "ping", description: "pong" }, {
      admin: false,
      global: true,
    });
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply("Pong 🏓");
  }
}

export const command = new PingCommand();
