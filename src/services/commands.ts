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

	private async selectById(id) {
		try {
			const data: any = await new Promise((resolve, rejects) => {
				pool.query(
					`SELECT * FROM todos WHERE id = ${id} AND userid = '${this.userId}'`,
					(err, res) => {
						// console.log(res)
					}
				)
			})
		} catch (err) {
			console.log(err)
		}
	}

	public async delete(id) {
		try {
			this.selectById(id)
			const data: any = await new Promise((resolve, reject) => {
				pool.query(
					`DELETE FROM todos WHERE id = ${id} AND userid = '${this.userId}'`,
					(err, res) => {
						if (res && res.rowCount == 1) {
							resolve('Your task has been deleted')
						} else if (res.rowCount == 0) {
							resolve(`There is no task with id of ${id}`)
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

	public async showAll() {
		try {
			const data: any = await new Promise((resolve, reject) => {
				pool.query(
					`SELECT * FROM todos WHERE userid = '${this.userId}'`,
					(err, res) => {
						if (res && res.command == 'SELECT') {
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
			const data: any = await new Promise((resolve, reject) => {
				pool.query(
					`INSERT INTO todos ( task , userid) VALUES
                     ('${task}' ,'${this.userId}')`,
					(err, res) => {
						if (res && res.rowCount == 1) {
							resolve({
								data: reminder
									? `Your task has been added i will reminde you after ${rem}`
									: 'Your task has been added ',
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
			})

			return data
		} catch (err) {
			console.log(err)
		}
	}
}
