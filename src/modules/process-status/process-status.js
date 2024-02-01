const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const { Config, Database } = require('@config');

const { DB_NAME_V1 } = Config.APPLICATION;

const conn = Database.getConnection(DB_NAME_V1);

mongoose.connection = conn;

const ProcessSchema = new Schema({

  id: { type: String, require: true, unique: true, index: true },

  key: { type: String, require: true, unique: true, index: true  },

  value: { type: String, require: true },

  description: { type: String },

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('processes_status', ProcessSchema);
