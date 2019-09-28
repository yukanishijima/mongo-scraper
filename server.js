const express = require("express");
const mongoose = require("mongoose");

const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");
const PORT = 3000;

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

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/moongoose-scraper", { useNewUrlParser: true });

// Routes

// Route for index.handlebars
app.get("/", function (req, res) {
  res.render("index");
});

// Route for scraping
app.get("/scrape", function (req, res) {
  axios.get("https://torontosun.com/category/news/weird").then(function (response) {
    const $ = cheerio.load(response.data);

    $("article").each(function (i, element) {
      const result = {};
      result.title = $(this).children("header").text();
      result.link = $(this).children(".thumbnail").children("a").attr("href");

      // create a document called "article"
      db.article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});


// route for getting all articles from database
app.get("/articles", function (req, res) {
  db.article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});


// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});