const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const { Config, Database } = require('@config');

const { DB_NAME_V1, APP_KEY, APP_CLUSTER } = Config.APPLICATION;

const conn = Database.getConnection(DB_NAME_V1);

mongoose.connection = conn;

const NONE = 'none';

const LOG_TYPES = ['action', 'event', 'log'];

const LogSchema = new Schema({

  id: { type: String },

  cluster: { type: String, require: true, index: true, default: APP_CLUSTER  },

  app: { type: String, require: true, index: true, default: APP_KEY },

  module: { type: String, index: true, default: NONE },

  type: { type: String, enum: LOG_TYPES, require: true, index: true, default: 'log' },

  level: { type: String, enum: ['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG', 'NOT_SET'], default: 'INFO' },

  clientIP: { type: String },

  clientUser: { type: String },

  clientSentBytes: { type: Number },

  clientUserArgent: { type: String },

  serverIP: { type: String },

  serverPort: { type: Number },

  serverReceivedBytes: { type: Number },

  logData: {
    errorStack: { type: Schema.Types.Mixed, default: {} },
    infoStack: { type: Schema.Types.Mixed, default: {} },
    debugStack: { type: Schema.Types.Mixed, default: {} }
  },

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('log', LogSchema);
