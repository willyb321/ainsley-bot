/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import {botLog} from "../utils";


export const pvpVideoID = '382661612223332353';

export function moderatePVP(message: Discord.Message) {
	if (message.channel.id !== pvpVideoID) {
		return;
	}
	setTimeout(() => {
		if (message.embeds.length === 0) {
			message.delete()
				.then(() => {
					message.author.createDM()
						.then(dmChannel => {
							dmChannel.send(`Don't clog up #pvp-videos. Use another channel for discussion eg #training\nFor reference, your message was: \`\`\`${message.content}\`\`\``);
							botLog(`Deleted message in #pvp-videos by ${message.author.tag} since it did not contain any embed after 5 seconds. Content was: \`\`\`${message.content}\`\`\` `)
						})
						.catch(err => {
							console.log(err);
						});
				})
				.catch(err => {
					console.log(err);
				});
		}
	}, 5000);
}
