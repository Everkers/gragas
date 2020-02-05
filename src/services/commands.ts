import { Pool } from 'pg'
import Helpers from './helpers'
const helpers = new Helpers()
const connectionString = process.env.DATABASE_URL
const pool = new Pool({
	connectionString,
})
export default class Commands {
	userId: Number
	constructor(userId) {
		this.userId = userId
	}

	public async add(task: string) {
		let reminder: number
		let rem: string
		try {
			if (task.includes('(') && task.includes(')')) {
				const text = task.match(/\(([^)]+)\)/)[1]
				task = task.split('(')[0]
				const timemeasure = text.match(/[a-zA-Z]+/g)[0]
				const time = text.match(/[0-9]+/g)[0]
				rem = time + timemeasure
				reminder = helpers.getTime(+time, timemeasure)
			}
			const data = await new Promise((resolve, reject) => {
				pool.query(
					`INSERT INTO todos (tasks , userid) VALUES
                     ('${task}' ,'${this.userId}')`,
					(err, res) => {
						if (res) {
							if (res.command == 'INSERT') {
								resolve({
									data: reminder
										? `Your task has been added i will reminde you after ${rem}`
										: 'Your task has been added ',
									reminder,
									task,
								})
							}
						} else {
							resolve(
								'An error occurred while trying to add your task to the database'
							)
						}
					}
				)
			})

			return data
		} catch (err) {
			console.log(err)
		}
	}
}
