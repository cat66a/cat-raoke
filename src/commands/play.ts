import {
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { CommandInteraction, GuildMember } from "discord.js";
import {
  joinVCAndCreateSubscription,
  MusicSubscription,
  subscriptions,
} from "../music/subscription";
import { Track } from "../music/track";
import { MusicSlashCommand } from "../slashCommand";

class PlayCommand extends MusicSlashCommand {
  constructor() {
    super({
      name: "play",
      description: "Lance une chanson ou l'ajoute dans la file d'attente",
      options: [
        {
          name: "query",
          type: 3,
          description:
            "Des mots-clés ou une URL correspondant à la piste à jouer",
          required: true,
        },
      ],
    });
  }
  async execute(
    interaction: CommandInteraction,
    subscription: void | MusicSubscription,
  ): Promise<void> {
    await interaction.deferReply();

    const query = interaction.options.get("query")!.value! as string;

    console.log(query);
    subscription = await joinVCAndCreateSubscription(subscription, interaction);
    if (!subscription) return;

    try {
      const track = await Track.from(query, {
        onStart() {},
        onFinish() {},
        onError(error) {
          console.warn(error);
          interaction.followUp(`Erreur: ${error.message}`).catch(console.warn);
        },
      });

      subscription.enqueue(track);
      await interaction.followUp(`Piste rajoutée : \`${track.data.title}\``);
    } catch (error) {
      console.warn(error);

      if (((error.message) as string).includes("No video id found")) {
        await interaction.followUp(
          "Aucune piste trouvée, vous pouvez réessayer avec d'autres mots-clés/un autre lien, ou réessayer plus tard",
        );
      } else {
        await interaction.followUp(
          "Impossible de jouer cette piste, veuillez réessayer plus tard",
        );
      }
    }
  }
}

export const command = new PlayCommand();
