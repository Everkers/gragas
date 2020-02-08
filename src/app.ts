import { config } from 'dotenv'
config()
import { Client, RichEmbed } from 'discord.js'
import Extractor from './services/extractor'
import Commands from './services/commands'
import { Pool } from 'pg'
const extractor = new Extractor()
const client = new Client()
client.on('ready', () => {
	console.log('Ready to go!')
})
client.on('message', async msg => {
	try {
		if (extractor.hasPrefix(msg.content)) {
			const command = extractor.getCommand(msg.content)
			const commands = new Commands(msg.author.id)
			let secondCommand: string
			let c: string
			if (command[1] != undefined) {
				c = command.shift()
				secondCommand = command.join(' ')
			} else {
				c = command[0]
			}
			if (c == 'add') {
				const { data, reminder, task } = await commands.add(secondCommand)
				if (reminder) {
					setTimeout(() => {
						msg.author.sendMessage(
							`Hello ${msg.author}, this is a reminder for : \`${task}\``
						)
					}, reminder)
				}
				msg.reply(data)
			} else if (c == 'showAll') {
				const data = await commands.showAll()
				const embed = new RichEmbed()
					.setTitle(`Todos for ${msg.author.username}`)
					.setColor('#e67e22')
					.addField(
						'Todos',
						`${
							data.length
								? data
										.map(
											task =>
												`[${task.id}] : ${task.task}     ${
													task.done
														? ':white_check_mark:'
														: ':negative_squared_cross_mark:'
												}\n \n`
										)
										.join('')
								: `You don't have any todos`
						}`
					)
				msg.channel.send(embed)
			} else if (c == 'delete') {
				if (secondCommand == undefined) {
					msg.reply('please add the task number')
				} else {
					const data = await commands.delete(secondCommand)
					msg.reply(data)
				}
			}
		}
	} catch (err) {
		console.log(err)
	}
})

client.login(process.env.BOT_TOKEN)
