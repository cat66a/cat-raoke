import {
	Interaction,
	SlashCommandOptionType,
	SlashCommandPartial,
} from '../deps.ts';

export default function execute(I: Interaction) {
	I.respond({ content: `Gateway ping: ${I.client.gateway.ping}` });
}