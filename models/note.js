const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NoteSchema = new Schema({
  body: String,
  created_at: { type: Date, default: Date.now }
});

const Note = mongoose.model("note", NoteSchema);

module.exports = Note; 