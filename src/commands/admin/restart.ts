/**
 * @module Commands
 */
/**
 * ignore
 */
import {config} from '../../utils';
import {client} from '../../index';
import * as Raven from 'raven';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();
import * as Commando from 'discord.js-commando';

export class RestartCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'restart',
			group: 'misc',
			memberName: 'restart',
			description: 'restart.',
			details: 'restart.',
			examples: ['restart']
		});
	}
	hasPermission(message) {
		return !!message.member && !!message.member.roles.find(elem => config.allowedRoles.includes(elem.id));
	}
	async run(message) {

		console.log('Restarting');
		return message.channel.send(':wave:')
			.then(() => {
				client.destroy()
				process.exit(0);
			}).catch(err => {
			Raven.captureException(err);
			process.exit(1);
		});
	}
}
