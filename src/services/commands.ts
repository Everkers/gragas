import { Pool } from 'pg'
import Helpers from './helpers'
import { resolve } from 'dns'
import { rejects } from 'assert'
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

	public async deleteAll() {
		try {
			const data: any = await new Promise((resolve, reject) => {
				pool.query(
					`DELETE FROM todos WHERE userid = '${this.userId}'`,
					(err, res) => {
						if (res && !err) {
							resolve('Your tasks has been deleted')
						} else {
							resolve(
								'An error occurred while trying to delete your task from the database'
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

	public async delete(ids) {
		try {
			const data: any = await new Promise((resolve, reject) => {
				ids.forEach(id => {
					pool.query(
						`DELETE FROM todos WHERE taskid = ${id} AND userid = '${this.userId}'`,
						(err, res) => {
							if (res.rowCount == 0) {
								resolve(`There is no task with id of ${id}`)
							}
							if (res && !err) {
								resolve('Your task has been deleted')
							} else {
								resolve(
									'An error occurred while trying to delete your task from the database'
								)
							}
						}
					)
				})
			})
			return data
		} catch (err) {
			console.log(err)
		}
	}

	public async showAll() {
		try {
			const data: any = await new Promise((resolve, reject) => {
				pool.query(
					`SELECT * FROM todos WHERE userid = '${this.userId}'`,
					(err, res) => {
						if (res && !err) {
							resolve(res.rows)
						} else {
							resolve(
								'An error occurred while trying to retrieve the data from the database'
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

	private async getCurrentId() {
		try {
			const data: any = await new Promise((resolve, rejects) => {
				pool.query(
					`SELECT taskid FROM todos WHERE userid='${this.userId}'`,
					(err, res) => {
						if (res && !err && res.rowCount >= 1) {
							const { taskid } = res.rows.pop()
							resolve(taskid)
						} else if (res && res.rowCount == 0) {
							resolve(0)
						} else {
							resolve('An error occurred while trying to get last task id')
						}
					}
				)
			})
			return data
		} catch (err) {
			console.log(err)
		}
	}

	public async done(ids) {
		try {
			const data: any = await new Promise((resolve, rejects) => {
				ids.forEach(id => {
					pool.query(
						`UPDATE todos SET done = true WHERE userid ='${this.userId}' AND taskId = ${id}`,
						(err, res) => {
							if (res && !err && res.rowCount >= 1) {
								resolve('Your task has been set to done.')
							} else if (res && res.rowCount == 0) {
								resolve(`There is no undone task with id of ${id}`)
							} else {
								resolve('An error occurred while trying to get last task id')
							}
						}
					)
				})
			})
			return data
		} catch (err) {
			console.log(err)
		}
	}

	public async showDone() {
		try {
			const data: any = await new Promise((resolve, reject) => {
				pool.query(
					`SELECT * FROM todos WHERE userid ='${this.userId}' AND done = true`,
					(err, res) => {
						if (res.rowCount == 0) {
							resolve(undefined)
						} else if (res && !err) {
							resolve(res.rows)
						}
					}
				)
			})
			return data
		} catch (err) {
			console.log(err)
		}
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
			const data: any = await new Promise(async (resolve, reject) => {
				if (reminder && rem.match(/(?:m|d|s|h)/)) {
					const currentId = await this.getCurrentId()
					pool.query(
						`INSERT INTO todos ( taskid, task , userid) VALUES
						 (${currentId + 1} , '${task}' ,'${this.userId}')`,
						(err, res) => {
							if (res && !err) {
								resolve({
									data: `Your task has been added, i will reminde you after ${rem}`,
									reminder,
									task,
								})
							} else {
								resolve(
									'An error occurred while trying to add your task to the database'
								)
							}
						}
					)
				} else if (!reminder) {
					const currentId = await this.getCurrentId()
					pool.query(
						`INSERT INTO todos ( taskid, task , userid) VALUES
						 (${currentId + 1} , '${task}' ,'${this.userId}')`,
						(err, res) => {
							if (res && !err) {
								resolve({
									data: 'Your task has been added ',
								})
							} else {
								resolve(
									'An error occurred while trying to add your task to the database'
								)
							}
						}
					)
				} else {
					resolve({
						data: `Unsupported time measure of **${rem}**,
						 use \`~help\` to learn more about reminders.`,
					})
				}
			})

			return data
		} catch (err) {
			console.log(err)
		}
	}
}
