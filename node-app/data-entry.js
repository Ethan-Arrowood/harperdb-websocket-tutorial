const readline = require('readline')

const HarperDBWebSocketClient = require('harperdb-websocket-client')

const hdbClient = new HarperDBWebSocketClient({
	hostname: 'localhost',
	socketClusterOptions: {
		rejectUnauthorized: false,
		autoReconnect: false,
		ackTimeout: 10000,
		secure: true
	},
	port: 12345,
	username: 'cluster_user',
	password: 'password',
	implicitInit: true
})

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: '\x1b[34mEnter new animal record, in the format <type>,<name>,<size>\nExample:\x1b[89m \x1b[36mdog,harper,medium\x1b[89m \n\x1b[91m>\x1b[39m '
})

rl.prompt()
rl.on('line', line => {
	const [ type, name, size ] = line.trim().split(',').map(v => v.trim())

	console.log(`\x1b[33mInserting new animal record: ${JSON.stringify({ type, name, size })}\x1b[89m`)

	hdbClient.insert('dev:animals', [
		{ type, name, size }
	])

	rl.prompt()
}).on('close', () => {
	console.log('\n\x1b[92mThank you for using HarperDB Animal Data Entry CLI\x1b[39m')
	process.exit(0)
})