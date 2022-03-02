import {
  CacheType,
  CommandInteraction,
  CommandInteractionOption,
} from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";

export interface IApplicationCommandProperties {
  type: ApplicationCommandTypes;
  name: string;
  description: string;
  options?: [CommandInteractionOption];
}

export class IBaseSlashCommand {
  properties: IApplicationCommandProperties;
  constructor(properties: Omit<IApplicationCommandProperties, "type">) {
    this.properties = properties as IApplicationCommandProperties;
    this.properties.type = 1;
  }

  execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
