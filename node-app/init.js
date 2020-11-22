const undici = require('undici')

const client = new undici.Client('http://localhost:9925')

const requestFactory = op => client.request({
	path: '/',
	method: 'POST',
	headers: [
		'content-type', 'application/json',
		'authorization', 'Basic SERCX0FETUlOOnBhc3N3b3Jk'
	],
	body: JSON.stringify(op)
})

const dropSchema = () => requestFactory({
	'operation': 'drop_schema',
	'schema': 'dev'
})

const createSchema = () => requestFactory({
	'operation': 'create_schema',
	'schema': 'dev'
})

const createTable = () => requestFactory({
	'operation': 'create_table',
	'schema': 'dev',
	'table': 'animals',
	'hash_attribute': 'id'
})

const describeTable = () => requestFactory({
	'operation': 'describe_table',
	'schema': 'dev',
	'table': 'animals'
})

const readStream = async stream => {
	let res = ''
	for await (let chunk of stream) {
		res += chunk
	}
	return res
}

;(async () => {
	await dropSchema()
	await createSchema()
	await createTable()

	let { body } = await describeTable()
	let result = await readStream(body)
	// sometimes the table creation fails so gotta retry
	if (result.includes('Invalid table')) {
		await createTable()
		;({ body } = await describeTable())
		result = await readStream(body)
	}
	console.log(JSON.parse(result))

	client.close()
})()