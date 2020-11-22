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

hdbClient.subscribe('dev:animals', data => {
	const record = data.transaction.records[0]
	console.log(`New record ${record.id} inserted`)
})