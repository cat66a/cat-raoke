import { CommandInteraction, MessageEmbed } from "discord.js";
import { getFlagNames, getFlagUrl } from "../pfpLgbtApiWrapper.js";
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
    }, { public_: true });
  }
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "flaglist":
        const flagNames = await getFlagNames();

        const text =
          "**Voici la liste des drapeaux disponibles pour la commande `/pride flag`** :\n" +
          "`" + flagNames.join("` **|** `") + "`";

        await interaction.followUp(text);
        break;
      case "flag":
        const embed = new MessageEmbed();

        const flagType = interaction.options!.data[0].options[0]!
          .value as string;

        embed.setImage(getFlagUrl(flagType));
        embed.setFooter({ text: "Powered by pfp.lgbt" });

        await interaction.followUp({ embeds: [embed] });
        break;
    }
  }
}

export const command = new PrideFlagCommand();
