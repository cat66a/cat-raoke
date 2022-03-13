import {
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { CommandInteraction, GuildMember } from "discord.js";
import { MusicSubscription, subscriptions } from "../music/subscription";
import { Track } from "../music/track";
import { MusicSlashCommand } from "../slashCommand";

class PlayCommand extends MusicSlashCommand {
  constructor() {
    super({
      name: "play",
      description: "Lance une chanson ou l'ajoute dans la file d'attente",
      options: [
        {
          name: "song",
          type: 3,
          description: "L'URL de la piste à jouer",
          required: true,
        },
      ],
    });
  }
  async execute(
    interaction: CommandInteraction,
    subscription: MusicSubscription,
  ): Promise<void> {
    await interaction.deferReply();

    const url = interaction.options.get("song")!.value! as string;

    console.log(url);
    if (!subscription) {
      if (
        interaction.member instanceof GuildMember &&
        interaction.member.voice.channel
      ) {
        const voiceChannel = interaction.member.voice.channel;

        subscription = new MusicSubscription(
          joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          }),
          {
            textChannelId: interaction.channelId,
            guildChannels: interaction.guild.channels,
            voiceChannelId: voiceChannel.id,
          },
        );

        subscription.voiceConnection.on("error", console.warn);
        subscriptions.set(interaction.guildId, subscription);
      }
    }

    if (!subscription) {
      await interaction.followUp(
        "Rejoins un salon vocal et ensuite essaye à nouveau ^^",
      );
      return;
    }

    try {
      await entersState(
        subscription.voiceConnection,
        VoiceConnectionStatus.Ready,
        20e3,
      );
    } catch (error) {
      console.warn(error);
      await interaction.followUp(
        "Je n'ai pas réussi à rejoindre le salon vocal dans les 20 secondes, veuillez réessayer plus tard",
      );
      return;
    }

    try {
      const track = await Track.from(url, {
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
          "Aucune piste trouvée, vous pouvez réessayer avec d'autres mots-clés/un autre lien",
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
