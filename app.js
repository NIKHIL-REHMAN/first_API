const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB error : ${error.message}`)
    process.exit(1)
  }
}
initialiseDBAndServer()

const convertDBObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
//API1

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id;`
  const playerArray = await db.all(getPlayersQuery)
  response.send(
    playerArray.map(eachPlayer => convertDBObjectToResponseObject(eachPlayer)),
  )
})
//API2

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const createPlayerQuery = `
  INSERT INTO
   cricket_team(player_name,jersey_number,role)
   VALUES
   (
    
    '${playerName}',
    ${jerseyNumber},
    '${role}'
   );`
  const dbResponse = await db.run(createPlayerQuery)
  response.send('Player Added to Team')
})
//API3

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayerQUery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`
  const dbResponse = await db.get(getplayerQUery)
  response.send(convertDBObjectToResponseObject(dbResponse))
})
//API4

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const upadtePlayerQuery = `
  UPDATE 
  cricket_team 
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE player_id = ${playerId};`
  await db.run(upadtePlayerQuery)
  response.send('Player Details Updated')
})

//API5

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE  FROM cricket_team WHERE player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
