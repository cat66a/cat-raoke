import {
	Client,
	delay,
	event,
	Intents,
	Interaction,
	InteractionResponseType,
	slash,
	SlashCommandOptionType,
	SlashCommandPartial,
	TextChannel,
	walk,
} from './deps.ts';
import { bot_token, guild_id } from './config.ts';
import ping_command from './commands/ping.ts';
import commands from "./commands.ts"

class BotClient extends Client {
	@event()
	async ready() {
		console.log('ready');

		await delay(500);

		const guild = await this.guilds.get(guild_id);
		if (!guild) return console.log('guild not loaded');

		const channel_id = '941804314274459691';
		const channel = await guild.channels.get(channel_id);
		if (!channel) return console.log('channel not loaded');
		if (!channel.isText()) return;
		await channel.send('I\'m ready');
		console.log('i\'m ready');

		 /* for await (const entry of walk('./commands/')) {
			if (entry.isDirectory || entry.isSymlink) continue;
			const { info: command_info }: I_Command = await import(`./${entry.path}`);
			try {
				const cmd = await this.interactions.commands.create(
					command_info,
					guild_id,
				);
				console.log(`Created Slash Command "${cmd.name}"!`);
			} catch {
				console.log(`Failed to create "${command_info.name}" command!`);
			}
		} */

	}

	@slash()
	ping(i: Interaction) {
		ping_command(i);
	}
}

const bot = new BotClient();
bot.connect(bot_token, Intents.None);
