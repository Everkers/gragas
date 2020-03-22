/* eslint-disable max-len */
import { config } from 'dotenv'
config()
import { Client, RichEmbed } from 'discord.js'
import Extractor from './services/extractor'
import Helpers from './services/helpers'
const helpers = new Helpers()
import Commands from './services/commands'
import { Pool } from 'pg'
const extractor = new Extractor()
const client = new Client()
client.on('ready', () => {
	client.user.setPresence({
		game: {
			name: '~help',
		},
	})
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
												`[${task.taskid}] : ${task.task}     ${
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
			} else if (c == 'deleteAll') {
				const data = await commands.deleteAll()
				msg.reply(data)
			} else if (c == 'done') {
				if (secondCommand == undefined) {
					msg.reply('please add the task number')
				} else {
					const numbers = secondCommand.split(' ').map(num => parseInt(num, 10))
					const data = await commands.done(numbers)
					msg.reply(data)
				}
			} else if (c == 'delete') {
				if (secondCommand == undefined) {
					msg.reply('please add the task number')
				} else {
					const numbers = secondCommand.split(' ').map(num => parseInt(num, 10))
					const data = await commands.delete(numbers)
					msg.reply(data)
				}
			} else if (c == 'help') {
				const messageEmbed = new RichEmbed()
					.setTitle('Gragas Commands')
					.addField(
						'~add <your task here> <optional reminder> \n e.g: ~add read a book (20m)',
						'add a task'
					)
					.addField('~showAll', 'show all your tasks')
					.addField('~deleteAll', 'delete all your tasks with one command')
					.addField('~delete <task id>', 'delete a specific task with id')
					.addField('~done <task id>', 'set a task to done with id')
					.addField('~showDone', 'show all completed tasks')
					.addField('~team-reminder <role> , <task> , <reminder>', 'reminder the a role members of specific task ')
					.addField(
						'supported time measures',
						'm : minutes , h : hours , s : seconds , d : days'
					)
					.addField('multiple select', 'e.g: ~delete 1 2 4 6')
				msg.channel.send(messageEmbed)
			} else if (c == 'showDone') {
				const data = await commands.showDone()
				const embed = new RichEmbed()
					.setTitle(`Completed tasks for ${msg.author.username}`)
					.setColor('#e67e22')
					.addField(
						'Done tasks',
						`${
							data
								? data
										.map((task, index) => `[${task.taskid}] : ${task.task}`)
										.join('')
								: 'there is no completed tasks'
						}`
					)
				msg.channel.send(embed)
			}
			else if(c == 'team-reminder'){
				if(secondCommand){
					let [role , task , reminder] = secondCommand.split(',')
					if(!reminder || !task){
						msg.reply('Please double check your inputs, something is missing ')
					}
					else if ( role && reminder && task ){
						const r = role.split(' ').filter(item => item)
						r.forEach(rl =>{
						const roleEdited = rl.replace(/[<>@&]/g , '')
						let validRole =null
						msg.guild.roles.forEach(role =>{
							if(roleEdited.match(role.id)){
								validRole = role
							}
						})
						if(validRole && reminder){
								const timemeasure = reminder.match(/[a-zA-Z]+/g)[0]
								const time = reminder.match(/[0-9]+/g)[0]
								const reminderNum = helpers.getTime(+time, timemeasure)
								 msg.channel.send(`I'll reminde all the members with the role of <@&${validRole.id}> to \`${task}\` after ${reminder}`)
								 const members = validRole.members.map(m => m)
								 setTimeout(()=>{
									 msg.channel.send(`Yo What's up <@&${validRole.id}>, this is a reminder for \`${task}\`, don't be lazy and go achieve the f* task!`)
									members.forEach(member=>{
										if(!member.user.bot){
											client.fetchUser(member.user.id , false).then(user =>{
												user.sendMessage(`Hey ${user.username} i hope you are doing well, this is a team-reminder for \`${task}\``)
											})
										}
									})
								 } , reminderNum)
						}
						else if (!validRole){
							msg.reply('Please add a valid role and try again!')
						}
						})
									
					}
				}
				else{
					msg.reply('Please add a role,reminder and a task')
				}
			}
		}
	} catch (err) {
		console.log(err)
	}
})

client.login(process.env.BOT_TOKEN)
