import { AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import { MusicSubscription } from "../music/subscription.js";
import { Track } from "../music/track.js";
import { MusicSlashCommand } from "../slashCommand.js";

const titleMaxLength = 45;

class QueueCommand extends MusicSlashCommand {
  constructor() {
    super({ name: "queue", description: "Permet de voir la file d'attente" }, {
      public_: true,
    });
  }
  async execute(
    interaction: CommandInteraction,
    subscription: void | MusicSubscription,
  ): Promise<void> {
    if (subscription) {
      const current =
        subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
          ? "Rien n'est actuellement en cours de lecture"
          : `En cours de lecture : \`${
            (subscription.audioPlayer.state.resource as AudioResource<Track>)
              .metadata.data.title
          }\``;

      const queue = subscription.queue
        .slice(0, 7)
        .map(({ data }, index) => {
          let title: string;
          data.title.length > titleMaxLength
            ? title = data.title.slice(0, titleMaxLength) + "..."
            : title = data.title;

          return `**${index + 1}** • \`${title}\``;
        })
        .join("\n");

      await interaction.reply(`${current}\n\n${queue}`);
    } else {
      await interaction.reply(
        "Je ne suis pas en train de jouer de la musique sur ce serveur !",
      );
    }
  }
}

export const command = new QueueCommand();
