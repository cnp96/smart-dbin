const MongoClient = require('mongodb').MongoClient

// Connection URL
const url = process.env.dbUrl
let connection

// Database Name
const dbName = process.env.dbName

// Methods
const connect = function () {
  return new Promise((resolve, reject) => {
    if (connection && connection.isConnected()) {
      resolve(connection.db(dbName))
    } else {
      MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(client => {
          connection = client
          const db = client.db(dbName)
          resolve(db)
        }).catch(e => reject(e))
    }
  })
}

const getCollection = (colName) => {
  return new Promise((resolve, reject) => {
    if (connection && connection.isConnected()) {
      resolve(connection.db(dbName).collection(colName))
    } else {
      connect()
        .then(() => {
          resolve(connection.db(dbName).collection(colName))
        })
        .catch(() => reject('Error connecting to DB'))
    }
  })
}

module.exports = {
  connect,
  close: function () {
    if (connection && connection.isConnected()) {
      try {
        connection.close()
        connection = null
        return 1
      } catch (e) {
        return 0
      }
    } else {
      return -1
    }
  },
  getDustbinCollection: () =>
    getCollection('dustbin'),
  getUsersCollection: () =>
    getCollection('users')
}
