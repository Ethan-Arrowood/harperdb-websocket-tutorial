import { useState, useEffect, useCallback } from 'react'
import HarperDBWebSocketClient from 'harperdb-websocket-client'

const client = new HarperDBWebSocketClient({
  hostname: 'localhost',
  socketClusterOptions: {
    rejectUnauthorized: false,
    autoReconnect: false,
    ackTimeout: 10000,
    secure: true,
  },
  port: 12345,
  username: 'cluster_user',
  password: 'password',
  implicitInit: true,
  debug: true
})

const hdbOpFactory = op => fetch('http://localhost:9925', {
	method: 'POST',
	headers: {
		'Authorization': 'Basic SERCX0FETUlOOnBhc3N3b3Jk',
		'Content-Type': 'application/json'
	},
	body: JSON.stringify(op)
})

const dropSchema = () => hdbOpFactory({
	'operation': 'drop_schema',
	'schema': 'dev'
})

const createSchema = () => hdbOpFactory({
	'operation': 'create_schema',
	'schema': 'dev'
})

const createTable = () => hdbOpFactory({
	'operation': 'create_table',
	'schema': 'dev',
	'table': 'animals',
	'hash_attribute': 'id'
})

const describeTable = () => hdbOpFactory({
	'operation': 'describe_table',
	'schema': 'dev',
	'table': 'animals'
})

const generateAnimal = () => {
	const getRandInt = m => Math.floor(Math.random() * Math.floor(m))

	const types = [
		'dog',
		'cat',
		'hamster',
		'elephant',
		'octopus',
		'zebra'
	]
	
	const sizes = [
		'large',
		'medium',
		'small'
	]
	
	const color = '#' + Math.random().toString(16).substr(2,6)

	return {
		id: Math.random().toString(16).substr(2),
		type: types[getRandInt(types.length)],
		size: sizes[getRandInt(sizes.length)],
		color
	}
}

function App() {
  useEffect(() => {
    dropSchema()
      .then(() => createSchema())
      .then(() => createTable())
      .catch(err => {
        console.log(err)
        if (err.message === 'Schema \'dev\' does not exist') {
          createSchema().then(() => createTable())
        } else {
          console.error(err)
        }
      })
  }, [])

  const [data, setData] = useState([])

  const addAnimal = useCallback(
    animal => setData([...data, animal]),
    [setData, data]
  )

  useEffect(() => {
    client.subscribe('dev:animals', addAnimal)
  }, [addAnimal])

  return (
    <div>
      <p>Click the button below to generate some random animals.</p>
      <button onClick={() => {
        const animal = generateAnimal()
        client.insert('dev:animals', [animal])
      }}>Generate</button>
	    <hr/>
      <ul>
        {
          data.map(d => (
            <li style={{ color: d.color }}>
              {`${d.size} ${d.type}`}
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default App;
