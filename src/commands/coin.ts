import { CommandInteraction } from "discord.js";
import { BaseSlashCommand } from "../slashCommand.js";

class CoinCommand extends BaseSlashCommand {
  constructor() {
    super({ name: "coin", description: "Coin 🦆 🦆 🦆" }, { public_: true });
  }
  override async execute(interaction: CommandInteraction): Promise<void> {
    return interaction.reply("Coin 🦆 🦆 🦆");
  }
}

export const command = new CoinCommand();
