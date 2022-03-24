// based on https://github.com/InfusionBot/discord-pagination/

/**
 * Main Pagination file
 *
 * @module Pagination
 */
import {
  ButtonInteraction,
  Collection,
  CommandInteraction,
  EmojiIdentifierResolvable,
  Interaction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageButtonStyleResolvable,
  MessageComponentInteraction,
  MessageEmbed,
  Snowflake,
  TextChannel,
} from "discord.js";

/*
const interactionPolyfill = (message: Message) => {
  return {
    update: async (
      options: ButtonInteraction["update"],
    ): Promise<void> => {
      // @ts-ignore
      return message.edit(options);
    },
  };
};
*/

/** Pagination class */

export class Pagination {
  /**
   * Pagination Options
   * @type {PaginationOptions}
   * @private
   */
  private options: PaginationOptions = {
    buttons: {
      back: {
        label: "Back",
        style: "SUCCESS",
      },
      next: {
        label: "Next",
        style: "PRIMARY",
      },
      page: "Page {{page}} / {{total_pages}}",
    },
    timeout: 300000, // 5 minutes
  };

  /**
   * Unique key for those buttons
   * @type {string}
   * @private
   */
  private _key: string;

  /**
   * The page number
   * @type {number}
   */
  public page: number;

  /**
   * The the action row which will contain the buttons
   * @type {MessageActionRow}
   * @private
   */
  private _actionRow: MessageActionRow;

  /**
   * The same _actionRow but with all buttons disabled
   */
  private _actionRowEnd: MessageActionRow;

  /**
   * Pages
   * @type {Array<MessageEmbed>}
   */
  public pages: Array<MessageEmbed>;

  /**
   * Authorized Users
   * @type {Array<Snowflake>}
   */
  public authorizedUsers: Array<Snowflake>;

  public updatePagesCB?: (pages?: this["pages"]) => this["pages"];
  public transformPageCB?: (page: MessageEmbed) => MessageEmbed;

  constructor(options?: PaginationOptions) {
    if (options && options.buttons) {
      options.buttons = Object.assign(
        this.options.buttons,
        options.buttons,
      );
    }
    this.options = Object.assign(this.options, options);
    this.page = 0;
    this._key = this._generateString(5);
  }

  /**
   * Generate random string
   * https://stackoverflow.com/a/1349426
   * @private
   */
  private _generateString(length: number) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * charactersLength),
      );
    }
    return result;
  }

  /**
   * Get page label
   * @private
   */
  private _getPageLabel() {
    const label = this.options.buttons.page
      .replace("{{page}}", `${this.page + 1}`)
      .replace("{{total_pages}}", `${this.pages.length}`);
    return label;
  }

  /**
   * Set Array of pages to paginate
   * @param array - Those pages
   * @return {boolean}
   */
  public setPages(array: Array<MessageEmbed>): Pagination {
    this.pages = array;
    return this;
  }

  /**
   * Set an array of user IDs who can switch pages
   * @param users - A array of user IDs
   * @return {boolean}
   */
  public setAuthorizedUsers(users: Array<Snowflake>): Pagination {
    this.authorizedUsers = users;
    return this;
  }

  public setUpdatePagesCB(callback: this["updatePagesCB"]): Pagination {
    this.updatePagesCB = callback;
    return this;
  }

  public setTransformPageCB(callback: this["transformPageCB"]): Pagination {
    this.transformPageCB = callback;
    return this;
  }

  public updatePages() {
    this.updatePagesCB ? this.setPages(this.updatePagesCB()) : void 0;
  }

  public getPage() {
    const page = this.pages[this.page];

    return this.transformPageCB ? this.transformPageCB(page) : page;
  }

  /**
   * Send the embed
   * @param channel - If you want to send it to a channel instead of repling to interaction, give the channel here
   * @param interaction - If you are not providing channel, set channel to false and provide a command interaction here
   * @return {boolean}
   */
  public async send(i: CommandInteraction, channel?: TextChannel) {
    if (!this.pages) throw new Error("Pages not set");
    if (!this.authorizedUsers) throw new Error("Authorized Users not set");
    if (!channel && !(i && i?.isCommand?.())) {
      throw new Error(
        "You should either provide channel or command interaction, set channel to false if you are providing interaction",
      );
    }
    if (i && !i.deferred && !i.replied) await i.deferReply();
    const { buttons } = this.options;
    this._actionRow = new MessageActionRow();
    const backButton = new MessageButton()
      .setLabel(`${buttons.back.label}`)
      .setStyle(buttons.back.style)
      .setCustomId(`back-${this._key}`);
    if (buttons.back.emoji !== "") backButton.setEmoji(buttons.back.emoji);
    const pageButton = new MessageButton()
      .setLabel(this._getPageLabel())
      .setStyle("SECONDARY")
      .setCustomId(`page-${this._key}`)
      .setDisabled(true);
    const nextButton = new MessageButton()
      .setLabel(`${buttons.next.label}`)
      .setStyle(buttons.next.style)
      .setCustomId(`next-${this._key}`);
    if (buttons.next.emoji) nextButton.setEmoji(buttons.next.emoji);
    this._actionRow.addComponents(backButton, pageButton, nextButton);
    let sentMessage: Message;
    if (channel) {
      sentMessage = await channel.send({
        embeds: [this.getPage()],
        components: [this._actionRow],
      });
    } else if (i) {
      sentMessage = await i.followUp({
        embeds: [this.getPage()],
        components: [this._actionRow],
      }) as Message;
    } else {
      return false;
    }
    sentMessage = sentMessage as Message;

    const ids = [`next-${this._key}`, `back-${this._key}`];
    const filter = ((i: any) =>
      ids.includes(i.customId) &&
      this.authorizedUsers.includes(i.user.id)).bind(this);
    const collector = sentMessage.createMessageComponentCollector({
      filter,
      componentType: "BUTTON",
      time: this.options.timeout,
    });

    collector.on("collect", (interaction: ButtonInteraction) => {
      const handlePage = (() => {
        if (this._actionRow.components[1] instanceof MessageButton) {
          this._actionRow.components[1].setLabel(
            this._getPageLabel(),
          );
        }
      }).bind(this); //Update page label

      this.updatePages();

      switch (interaction.customId) {
        case `next-${this._key}`:
          this.page = this.page + 1 < this.pages.length
            ? ++this.page
            : this.pages.length - 1;
          handlePage();
          interaction
            .update({
              embeds: [this.getPage()],
              components: [this._actionRow],
            })
            .catch(() => true);
          break;
        case `back-${this._key}`:
          this.page = this.page > 0 ? --this.page : 0;
          handlePage();
          interaction
            .update({
              embeds: [this.getPage()],
              components: [this._actionRow],
            })
            .catch(() => true);
          break;
      }
    });
    collector.on(
      "end",
      async (collected: Collection<Snowflake, Interaction>) => {
        // const interaction = collected.last() as ButtonInteraction ||
        //  interactionPolyfill(msg);

        /*
        for (let i = 0; i < this._actionRow.components.length; i++) {
          this._actionRow.components[i].setDisabled(true);
        }
        */

        this._actionRow.components.forEach((component) =>
          component.setDisabled(true)
        );

        /*
        await interaction
          // @ts-ignore
          .update({
            embeds: [this.pages[this.page]],
            components: [this._actionRow],
          })
          .catch(() => true);
        */

        await sentMessage
          .edit({
            embeds: [this.pages[this.page]],
            components: [this._actionRow],
          })
          .catch(() => true);
      },
    );
    return true;
  }
}

/** Options for Pagination class **/
export interface PaginationOptions {
  /** Options for other buttons */
  buttons: {
    /** Back Button options */
    back: {
      /** Label for the button, default: `Back` */
      label: string;
      /** One of [MessageButtonStyleResolvable](https://discord.js.org/#/docs/main/master/typedef/MessageButtonStyleResolvable), default: `SUCCESS` */
      style: MessageButtonStyleResolvable;
      /** Emoji (optional) */
      emoji?: EmojiIdentifierResolvable;
    };
    /** Next Button options */
    next: {
      /** Label for the button, default: `Next` */
      label: string;
      /** One of [MessageButtonStyleResolvable](https://discord.js.org/#/docs/main/master/typedef/MessageButtonStyleResolvable), default: `PRIMARY` */
      style: MessageButtonStyleResolvable;
      /** Emoji (optional) */
      emoji?: EmojiIdentifierResolvable;
    };
    /** A disabled button which shows current page, default: Page {{page}} / {{total_pages}} */
    page: string;
  };
  /** Time in milliseconds after which all buttons are disabled, default: `30000` (30 seconds) */
  timeout: number;
}
