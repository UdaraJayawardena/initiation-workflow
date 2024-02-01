const mongoose = require('mongoose');

const { Config, Database } = require('@config');

const Schema = mongoose.Schema;

const { DB_NAME_V1 } = Config.APPLICATION;

const conn = Database.getConnection(DB_NAME_V1);

mongoose.connection = conn;

const counterSchema = new Schema({

  _id: { type: String },

  seq: { type: Number, default: 0 },

}, { timestamps: true });

counterSchema.statics.getNextSequence = async function (name) {
  const ret = await this.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true
    }
  );

  return ret.seq.toString().padStart(6, '0');
};

module.exports = mongoose.model('counter', counterSchema);