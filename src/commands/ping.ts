import { CommandInteraction } from "discord.js";
import { IBaseSlashCommand } from "../ISlashCommand";

class ClassCommand extends IBaseSlashCommand {
  constructor() {
    super({ name: "ping", description: "sausage" });
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    interaction.reply(":)");
  }
}

export const command = new ClassCommand();
