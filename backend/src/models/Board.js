const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardSchema = new Schema({
  title: String,
  description: String,
  list: String,
  board: { type: Schema.Types.ObjectId, ref: 'Board' },
  labels: [String],
  dueDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const ListSchema = new Schema({
  title: String,
  board: { type: Schema.Types.ObjectId, ref: 'Board' },
  position: Number
});

const BoardSchema = new Schema({
  title: { type: String, required: true },
  lists: [ListSchema],
  cards: [CardSchema],
  members: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Board', BoardSchema);
