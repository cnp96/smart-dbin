const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://admin:password1@ds137368.mlab.com:37368/smart-dustbin';
let connection;

// Database Name
const dbName = 'smart-dustbin';

module.exports = {
  connect: function () {
    return new Promise((resolve) => {
      if (connection) resolve(connection);
      else {
        MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function (err, client) {

          if (err) reject(err)
          else {
            connection = client;
            const db = client.db(dbName);
            resolve(db);
          }
        });
      }
    })
  },
  close: function () {
    if (connection) {
      try {
        connection.close();
        return 1;
      } catch (e) {
        return 0;
      }
    } else {
      return -1;
    }
  }
}