export default class Helpers {
	constructor() {}
	public getTime(time: number, timemeasure: string) {
		let returntime: number = time
		switch (timemeasure) {
			case 's':
				returntime = returntime * 1000
				break

			case 'm':
				returntime = returntime * 1000 * 60
				break

			case 'h':
				returntime = returntime * 1000 * 60 * 60
				break

			case 'd':
				returntime = returntime * 1000 * 60 * 60 * 24
				break

			default:
				returntime = returntime * 1000
				break
		}
		return returntime
	}
}
