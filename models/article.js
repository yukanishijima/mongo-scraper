const mongoose = require("mongoose");

//schema constructor
const Schema = mongoose.Schema;

//create a new schema object
const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  intro: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  saved: {
    type: Boolean,
    default: false
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "note"
  }
});

const article = mongoose.model("article", ArticleSchema);

module.exports = article;