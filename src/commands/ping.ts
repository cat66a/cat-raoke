import { CommandInteraction } from "discord.js";
import { BaseSlashCommand } from "../slashCommand.js";

class PingCommand extends BaseSlashCommand {
  constructor() {
    super({ name: "ping", description: "pong" }, { public_: true });
  }
  override async execute(interaction: CommandInteraction): Promise<void> {
    return interaction.reply("Pong 🏓");
  }
}

export const command = new PingCommand();
