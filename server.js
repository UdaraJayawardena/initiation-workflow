require('module-alias/register');

const { Config } = require('./config');

const { PORT } = Config.APPLICATION;

const app = require('./src');

const subscriber = require('./src/subscriber');

const onListeningLog = `
  Loan-Initiation Camunda Server is running on port : ${PORT} !!!`;

const onListening = () => console.log(onListeningLog);

app.listen(PORT, onListening());

if (!global.spans) global.spans = [];

subscriber.subscribe();

module.exports = app;