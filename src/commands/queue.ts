import { AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { MusicSubscription } from "../music/subscription.js";
import { Track } from "../music/track.js";
import { Pagination } from "../utils/pagination.js";
import { MusicSlashCommand } from "../slashCommand.js";

const titleMaxLength = 50;
const pageSize = 10;

export function makePages(queue: Track[]): MessageEmbed[] {
  const copiedQueue = Array.from(queue);
  const pages: Array<MessageEmbed> = [];

  if (copiedQueue.length === 0) {
    const page = new MessageEmbed({
      fields: [{ name: "** **", value: "**La file d'attente est ✨ vide ✨**" }],
    });

    pages.push(page);

    return pages;
  }

  let indexQueue = 0;
  let oldIndexQueue = 0;

  while (indexQueue < (copiedQueue.length)) {
    indexQueue = indexQueue + pageSize;
    const elements = copiedQueue.slice(
      indexQueue - pageSize < 0 ? 0 : indexQueue - pageSize,
      indexQueue,
    );

    const formattedQueue = elements.map(({ data }, index) => {
      let title: string;
      data.title.length > titleMaxLength
        ? title = data.title.slice(0, titleMaxLength) + "..."
        : title = data.title;

      return `**${index + oldIndexQueue + 1}** • \`${title}\` (${data.length})`;
    })
      .join("\n");

    const page = new MessageEmbed({
      fields: [{ name: "** **", value: formattedQueue }],
    });

    pages.push(page);

    oldIndexQueue = indexQueue;
  }

  return pages;
}

class QueueCommand extends MusicSlashCommand {
  constructor() {
    super({ name: "queue", description: "Permet de voir la file d'attente" }, {
      public_: true,
    });
  }
  override async execute(
    interaction: CommandInteraction,
    subscription: void | MusicSubscription,
  ): Promise<void> {
    if (!subscription) {
      return await interaction.reply(
        "Je ne suis pas en train de jouer de la musique sur ce serveur !",
      );
    }

    const curryMakePages = () => makePages(subscription.queue);

    const pagination = new Pagination();

    pagination.setAuthorizedUsers([interaction.user.id])
      .setPages(curryMakePages())
      .setUpdatePagesCB(curryMakePages)
      .setTransformPageCB((page) => {
        let current: string;
        if (subscription.audioPlayer.state.status === AudioPlayerStatus.Idle) {
          current = "**Rien n'est actuellement en cours de lecture**";
        } else {
          const currentTrackData =
            (subscription.audioPlayer.state.resource as AudioResource<Track>)
              .metadata.data;

          current =
            `**En cours de lecture** : \`${currentTrackData.title}\` (${currentTrackData.length})`;
        }

        return page.setDescription(current).setTitle(
          "File d'attente pour ce serveur",
        );
      });

    await pagination.send(interaction);
  }
}

export const command = new QueueCommand();
