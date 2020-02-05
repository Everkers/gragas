import { config } from 'dotenv'
config()
import { Client } from 'discord.js'
import Extractor from './services/extractor'
import Commands from './services/commands'
const extractor = new Extractor()
const client = new Client()
client.on('ready', () => {
	console.log('Ready to go!')
})
client.on('message', async msg => {
	try {
		if (extractor.hasPrefix(msg.content)) {
			const command = extractor.getCommand(msg.content)
			if (command) {
				const commands = new Commands(msg.author.id)
				let c: string
				let secondCommand: string
				if (command[1] != undefined) {
					c = command.shift()
					secondCommand = command.join(' ')
				}
				const { data, reminder, task } = await commands[c](secondCommand)
				if (reminder) {
					setTimeout(() => {
						msg.author.sendMessage(
							`Hello ${msg.author}, this is a reminder for : \`${task}\``
						)
					}, reminder)
				}
				msg.reply(data)
			}
		}
	} catch (err) {
		console.log(err)
	}
})

client.login(process.env.BOT_TOKEN)
