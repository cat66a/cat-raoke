import { ChannelType } from "discord-api-types/v9";
import {
  ClientApplication,
  CommandInteraction,
  Snowflake,
  Team,
  User,
} from "discord.js";
import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
} from "discord.js/typings/enums";
import { MusicSubscription, subscriptions } from "./music/subscription.js";

export interface IApplicationCommandsOptionsData {
  type: ApplicationCommandOptionTypes;
  name: string;
  description: string;
  required?: boolean;
  choices?: { name: string; value: string | number }[];
  options?: IApplicationCommandsOptionsData[];
  channel_types?: ChannelType[];
  min_value?: number;
  max_value?: number;
  autocomplete?: boolean;
}
export interface IApplicationCommandProperties {
  type: ApplicationCommandTypes;
  name: string;
  description: string;
  options?: IApplicationCommandsOptionsData[];
  default_permission?: boolean;
}

export interface IOtherProps {
  admin?: boolean;
  public_?: boolean;
}
export class BaseSlashCommand implements IOtherProps {
  public readonly properties: IApplicationCommandProperties;
  public readonly admin: boolean;
  public readonly public_: boolean;

  constructor(
    APIProperties: Omit<IApplicationCommandProperties, "type">,
    otherProps?: IOtherProps,
  ) {
    this.properties = APIProperties as IApplicationCommandProperties;
    this.properties.type = 1;

    this.admin = otherProps?.admin ?? false;
    this.public_ = otherProps?.public_ ?? false;
  }

  async preExec(interaction: CommandInteraction): Promise<void> {
    if (this.admin) {
      let pass: boolean = false;

      const application =
        await (interaction.client.application as ClientApplication).fetch();
      const botOwner = application.owner;
      const user = interaction.user;

      if (botOwner instanceof Team) {
        if ((botOwner as Team).owner?.id === user.id) pass = true;
      } else if (botOwner instanceof User) {
        if (botOwner.id === user.id) pass = true;
      }

      if (!pass) {
        return interaction.reply(
          "Cette commande est réservée au/à la propriétaire du bot, tu ne peux pas l'utiliser",
        );
      }
    }

    return this.prepare(interaction);
  }

  prepare(interaction: CommandInteraction) {
    return this.execute(interaction);
  }

  execute(_interaction: CommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export class MusicSlashCommand extends BaseSlashCommand {
  constructor(
    APIProperties: Omit<IApplicationCommandProperties, "type">,
    otherProps?: IOtherProps,
  ) {
    super(APIProperties, otherProps);
  }

  override prepare(interaction: CommandInteraction): Promise<void> {
    let subscription = subscriptions.get(interaction.guildId as Snowflake);

    return this.execute(interaction, subscription as MusicSubscription);
  }

  // @ts-ignore
  execute(
    _interaction: CommandInteraction,
    _subscription: MusicSubscription,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export class AdminSlashCommand extends BaseSlashCommand {
  constructor(
    APIProperties: Omit<IApplicationCommandProperties, "type">,
  ) {
    super(APIProperties, { admin: true, public_: false });
  }
}
