import { CommandInteraction, MessageEmbed } from "discord.js";
import {
  getFlagNames,
  getFlagUrl,
  PrideFlags,
} from "../pfp_lgbtapi_wrapper.js";
import { BaseSlashCommand } from "../slashCommand.js";

class PrideFlagCommand extends BaseSlashCommand {
  constructor() {
    super({
      name: "pride",
      description: "Commandes en rapport avec la fierté LGBTI",
      options: [
        {
          name: "flag",
          type: 1,
          description:
            "Permet de sélectionner un drapeau de fierté LGBTI (trans, nb, ace, etc...) et de l'afficher",
          options: [{
            name: "type",
            type: 3,
            description:
              "Permet de sélectionner le type de drapeau (trans, nb, etc...)",
            required: true,
          }],
        },
        {
          name: "flaglist",
          description: "Affiche la liste des drapeaux disponibles",
          type: 1,
        },
      ],
    }, { global: true });
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "flaglist") {
      const flagNames = await getFlagNames();

      const text = "`" + flagNames.join("` **|** `") + "`";

      await interaction.followUp(text);
      return;
    } else if (subcommand === "flag") {
      const embed = new MessageEmbed();

      const flagType = interaction.options!.data[0].options[0]!
        .value as PrideFlags;

      embed.setImage(getFlagUrl(flagType));
      embed.setFooter({ text: "Powered by pfp.lgbt" });

      await interaction.followUp({ embeds: [embed] });
    }
  }
}

export const command = new PrideFlagCommand();
