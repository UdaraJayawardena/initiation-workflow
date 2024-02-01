const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const { Config, Database } = require('@config');

const { DB_NAME_V1 } = Config.APPLICATION;

const conn = Database.getConnection(DB_NAME_V1);

mongoose.connection = conn;

const ProcessSchema = new Schema({

  id: { type: String, require: true, unique: true, index: true },

  name: { type: String, require: true },

  key: { type: String, require: true, unique: true, index: true },

  status: { type: String, enum: ['active', 'in-active'], default: 'active'},
  
  businessKey: {
    name: { type: String },
    placeholder: { type: String },
    hint: { type: String }
  },

  identifiers: [{ 
    name: { type: String },
    apiIn: { type: String }
  }],

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('process', ProcessSchema);
