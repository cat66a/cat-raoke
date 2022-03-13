import { CommandInteraction, GuildMember } from "discord.js";
import { MusicSubscription } from "../music/subscription";
import { MusicSlashCommand } from "../slashCommand";

class SkipCommand extends MusicSlashCommand {
  constructor() {
    super({
      name: "skip",
      description: "Permet de passer une piste et lancer la prochaine",
    });
  }
  async execute(
    interaction: CommandInteraction,
    subscription: MusicSubscription,
  ): Promise<void> {
    if (subscription) {
      if (
        interaction.member instanceof GuildMember &&
        interaction.member.voice.channel
      ) {
        // Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
        // listener defined in music/subscription.ts, transitions into the Idle state mean the next track from the queue
        // will be loaded and played.
        subscription.audioPlayer.stop();
        await interaction.reply("La piste a été skippée !");
      } else {
        await interaction.reply(
          "Tu dois rejoindre un salon vocal pour utiliser cette commande",
        );
      }
    } else {
      await interaction.reply(
        "Je ne suis pas en train de jouer de la musique sur ce serveur !",
      );
    }
  }
}

export const command = new SkipCommand();
