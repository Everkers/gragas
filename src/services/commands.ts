import { Pool } from 'pg'
const connectionString = process.env.DATABASE_URL
const pool = new Pool({
	connectionString,
})
export default class Commands {
	userId: Number
	constructor(userId) {
		this.userId = userId
	}

	async add(task: string) {
		try {
			const data = await new Promise((resolve, reject) => {
				pool.query(
					`INSERT INTO todos (tasks , userid) VALUES ('${task}' ,'${this.userId}')`,
					(err, res) => {
						if (res.command == 'INSERT') {
							resolve('Your task has been registered')
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
