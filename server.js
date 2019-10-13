const express = require("express");
const mongoose = require("mongoose");

// Require all models
const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

//set up handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Drop MongoDB if it exists
mongoose.connection.dropDatabase();
// Connect to Mongo DB 
// If deployed, use the deployed database. Otherwise use the local database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoose-scraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
require("./routes/index.js")(app);

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});