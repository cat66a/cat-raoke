import {
  ApplicationCommandOptionType,
  BaseApplicationCommandOptionsData,
  CacheType,
  CommandInteraction,
} from "discord.js";
import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
} from "discord.js/typings/enums";
import { MusicSubscription, subscriptions } from "./music/subscription";

export interface IApplicationCommandProperties {
  type: ApplicationCommandTypes;
  name: string;
  description: string;
  options?: [
    BaseApplicationCommandOptionsData & { type: ApplicationCommandOptionTypes },
  ];
}

export class BaseSlashCommand {
  properties: IApplicationCommandProperties;
  constructor(properties: Omit<IApplicationCommandProperties, "type">) {
    this.properties = properties as IApplicationCommandProperties;
    this.properties.type = 1;
  }

  preExec(interaction: CommandInteraction<CacheType>): Promise<void> {
    return this.execute(interaction);
  }

  execute(interaction: CommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export class MusicSlashCommand extends BaseSlashCommand {
  constructor(properties: Omit<IApplicationCommandProperties, "type">) {
    super(properties);
  }

  preExec(interaction: CommandInteraction): Promise<void> {
    let subscription = subscriptions.get(interaction.guildId);

    return this.execute(interaction, subscription);
  }

  // @ts-ignore
  execute(
    interaction: CommandInteraction<CacheType>,
    subscription: MusicSubscription,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
