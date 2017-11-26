/**
 * @module Index
 */
/**
 * ignore
 */
// Import modules
import 'source-map-support/register';
import * as Discord from 'discord.js';
import * as commands from './commands';
import * as _ from 'lodash';
import * as meSpeak from 'mespeak';

meSpeak.loadVoice(require('mespeak/voices/en/en-us.json'));
import {botLog, config, currentStatus} from './utils';
import {join} from 'path';
import * as fs from 'fs';
import {tmpdir} from 'os';

const AudioSprite = require('audiosprite-pkg');
// Create an instance of a Discord client
export const client = new Discord.Client();
const {allowedChannels, allowedServers, token} = config;
// The token of your bot - https://discordapp.com/developers/applications/me

process.on('uncaughtException', (err: Error) => {
	console.log(err);
});

process.on('unhandledRejection', (err: Error) => {
	console.log(err);
});
meSpeak.loadConfig(require('mespeak/src/mespeak_config.json'));
meSpeak.loadVoice(require('mespeak/voices/en/en-us.json'), () => {
});
const ax3 = ['139931372247580672', '156911063089020928', '120257529740525569', '111992757635010560', '145883108170924032', '254833351846920192', '299390680000626688', '108550009296818176', '119614799062499328', '121791193301385216', '108273981655642112'];
client.on('voiceStateUpdate', (oldUser: Discord.GuildMember, newUser: Discord.GuildMember) => {
	if (client.voiceConnections.array().length > 0) {
		return;
	}
	if (newUser.voiceChannel === undefined) {
		return;
	}
	if (oldUser.voiceChannel === undefined && newUser.voiceChannel !== undefined) {
		if (_.random(1, 100) < 90) return;
		newUser.user.username = _.escapeRegExp(newUser.user.username);
		console.log(`Joining ${newUser.voiceChannel.name} to tell ${newUser.user.username} to STFU`);
		botLog(`Joining ${newUser.voiceChannel.name} to tell ${newUser.user.username} to STFU`);
		setTimeout(() => {
			if (newUser.voiceChannel) {
				const buf = meSpeak.speak(`Shut the fuck up ${newUser.user.username}`, {rawdata: 'buffer'});
				fs.writeFileSync(join(tmpdir(), `stfu-${newUser.user.username}.wav`), buf);
				const as = new AudioSprite();
				as.inputFile(join(tmpdir(), `stfu-${newUser.user.username}.wav`), function (err) {
					if (err) {
						console.log(err);
					}
					as.outputFile(join(tmpdir(), `stfu-${newUser.user.username}.mp3`), {format: 'mp3'}, function (err) {
						if (err) {
							console.log(err);
						}
						stfu(newUser);
					});
				});
			}
		}, _.random(1000, 5000));
	}
});

function stfu(newUser) {
	newUser.voiceChannel.join()
		.then(voice => {
			const voiceDis = voice.playStream(fs.createReadStream(join(tmpdir(), `stfu-${newUser.user.username}.mp3`)));
			voiceDis.on('start', () => {
				console.log('Start');
			});
			voiceDis.on('end', () => {
				console.log('End');
				setTimeout(() => {
					voice.disconnect();
				}, 10000);
				voice.disconnect();
			});
			voiceDis.on('speaking', yesorno => {
				console.log('Speaking');
			});
			voiceDis.on('error', err => {
				console.log(err);
			});
		})
		.catch(err => {
			console.log(err);
		});
}

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
	console.log('I am ready!');
	client.user.setGame('in moderation');
});

// Create an event listener for messages
client.on('message', (message: Discord.Message) => {
	if (message.author.id === client.user.id) {
		return;
	}
	if (message.channel.type === 'dm') {
		commands.isItOof(message);
		commands.modReport(message);
		currentStatus.currentDms[message.author.id] = message;
		return;
	}
	if (_.indexOf(allowedServers, message.guild.id) === -1) {
		return;
	}
	if (!currentStatus.currentSpams[message.author.id]) {
		currentStatus.currentSpams[message.author.id] = {
			messages: [],
			roleMentions: {},
			userMentions: {},
			muted: false,
			currentTime: new Date()
		};
	}

	setTimeout(() => {
		currentStatus.currentSpams[message.author.id].currentTime = new Date();
		currentStatus.currentSpams[message.author.id].messages = [];
	}, 60000);

	currentStatus.currentSpams[message.author.id].messages.push(message);
	message.mentions.roles.array().forEach(elem => {
		if (!currentStatus.currentSpams[message.author.id].roleMentions[elem.id]) {
			currentStatus.currentSpams[message.author.id].roleMentions[elem.id] = 0;
		}
		currentStatus.currentSpams[message.author.id].roleMentions[elem.id]++;
	});
	message.mentions.users.array().forEach(elem => {
		if (!currentStatus.currentSpams[message.author.id].userMentions[elem.id]) {
			currentStatus.currentSpams[message.author.id].userMentions[elem.id] = 0;
		}
		currentStatus.currentSpams[message.author.id].userMentions[elem.id]++;
	});
	if (commands.isItOof(message)) {
		commands.noOof(message);
	}
	commands.noSpamPls(message);
	if (_.indexOf(allowedChannels, message.channel.id) === -1) {
		return;
	}
	//TODO add some replies
	// if (message.isMentioned(client.user)) {
	// 	_.shuffle(currentStatus.replies);
	// 	message.reply(currentStatus.replies[0]);
	// }
	// If the message is "!start"
	if (message.content === '!start') {
		// Send "pong" to the same channel
		commands.start(message);
	}
	if (message.content.startsWith('!register') || message.content.startsWith('!reg')) {
		// Send "pong" to the same channel
		commands.register(message);
	}
	if (message.content.startsWith('!unregister') || message.content.startsWith('!unreg')) {
		// Send "pong" to the same channel
		commands.unregister(message);
	}
	if (message.content === '!who') {
		// Send "pong" to the same channel
		commands.who(message);
	}
	if (message.content.startsWith('!teams')) {
		// Send "pong" to the same channel
		commands.teams(message);
	}
	if (message.content.startsWith('!rating')) {
		// Send "pong" to the same channel
		commands.rating(message);
	}
	if (message.content.startsWith('!remove')) {
		// Send "pong" to the same channel
		commands.remove(message);
	}
	if (message.content === '!instanced' || message.content === '!i') {
		// Send "pong" to the same channel
		commands.instanced(message);
	}
	if (message.content === '!ready' || message.content === '!r') {
		// Send "pong" to the same channel
		commands.ready(message);
	}
	if (message.content.startsWith('!ir')) {
		// Send "pong" to the same channel
		commands.instanced(message);
		commands.ready(message);
	}
	if (message.content === '!go') {
		// Send "pong" to the same channel
		commands.go(message);
	}
	if (message.content === '!reset') {
		// Send "pong" to the same channel
		commands.reset(message);
	}
	if (message.content === '!help') {
		// Send "pong" to the same channel
		commands.help(message);
	}
});
console.log(commands);
// Log our bot in
client.login(token);
