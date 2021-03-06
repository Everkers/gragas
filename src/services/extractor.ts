import * as data from '../../botConfig.json'
import * as dataCommands from '../../commands.json'
export default class Extractor {
	prefix: string
	constructor() {
		this.prefix = data.bot.prefix
	}

	public hasPrefix(command: string) {
		if (command.startsWith(this.prefix)) {
			return true
		}
		return false
	}

	public extractCommand(command: string) {
		const content = command
			.split(this.prefix)
			.pop()
			.split(' ')
		return content
	}

	public getCommand(text: string) {
		const { commands } = dataCommands
		const commandData = this.extractCommand(text)
		let validCommand: string[]
		commands.forEach(command => {
			if (command.name == commandData[0]) {
				validCommand = commandData
			}
		})
		return validCommand
	}
}
