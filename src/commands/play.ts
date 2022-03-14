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
} from "../music/subscription.js";
import { Track } from "../music/track.js";
import { MusicSlashCommand } from "../slashCommand.js";

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
    }, { global: true });
  }
  async execute(
    interaction: CommandInteraction,
    subscription: void | MusicSubscription,
  ): Promise<void> {
    console.log("beginning");
    await interaction.deferReply();

    const query = interaction.options.get("query")!.value! as string;
    console.log(query);

    subscription = await joinVCAndCreateSubscription(subscription, interaction);
    if (!subscription) return;

    console.log("1");
    try {
      const track = await Track.from(query, {
        onStart() {},
        onFinish() {},
        async onError(error) {
          console.warn(error);
          (await (subscription as MusicSubscription).textChannel).send(
            `Erreur: ${error.message}`,
          );
        },
      });

      console.log("5");
      subscription.enqueue(track);
      console.log("6");
      await interaction.followUp(`Piste rajoutée : \`${track.data.title}\``);
      console.log("7");
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
