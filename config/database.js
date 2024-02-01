const mongoose = require('mongoose');

const chalk = require('chalk');

const { APPLICATION } = require('./config');

const DB_URI = APPLICATION.DB_URI;

const connections = [];

const connect = (database) => {

  const oldConnection = connections.find((c) => c.database === database);

  if (!oldConnection) {

    const dbURL = `${DB_URI.replace('<DB_NAME>', database)}`;

    const error = chalk.bold.yellow;

    const connection = mongoose.createConnection(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    connections.push({
      database: database,
      dbURL: dbURL,
      conn: connection
    });

    connection.on('connected', () => {

      const success = chalk.bold.green;

      console.log(success('Connection is open to', database));

    });

    connection.on('error', (err) => {

      console.log(error('Connection has occurred ' + err + 'error'));
    });

    connection.on('disconnected', () => {

      const disconnected = chalk.bold.red;

      console.log(disconnected('Connection is disconnected'));
    });

    process.on('SIGINT', () => {

      connection.close(() => {

        const termination = chalk.bold.magenta;

        console.log(termination('connection is disconnected due to application termination'));

        process.exit(0);
      });
    });

    return connection;
  }

  return oldConnection;
};

const getConnection = (database) => connect(database);

const disconnect = (database) => {
  return new Promise((resolve, reject) => {

    const connection = connections.find((c) => c.database === database);

    if (connection) {

      connection.conn.close(() => {

        const index = connections.findIndex((c) => c.database === database);

        connections.splice(index, 1);

        return resolve('Disconnected');
      });

    } else {

      return reject('Can not find existing connection');
    }
  });
};

module.exports = {

  connect: connect,

  getConnection: getConnection,

  disconnect: disconnect,
};