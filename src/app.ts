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
				const commandResult = await commands[c](secondCommand)
				msg.reply(commandResult)
			}
		}
	} catch (err) {
		console.log(err)
	}
})

client.login(process.env.BOT_TOKEN)
