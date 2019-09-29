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

// Drop MongoDB if it exists
mongoose.connection.dropDatabase();
// Connect to Mongo DB 
// If deployed, use the deployed database. Otherwise use the local database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/moongoose-scraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// Route to display html pages
// app.get("/", function (req, res) {
//   res.render("index");
// });

app.get("/saved", function (req, res) {
  res.render("saved");
});


// Route for scraping
app.get("/", function (req, res) {

  axios.get("https://monocle.com/magazine/").then(function (response) {
    const $ = cheerio.load(response.data);

    $("article .container").each(function (i, element) {

      let result = {};
      result.title = $(this).children("header").children("h2").text();
      result.link = $(this).children("header").children("h2").children("a").attr("href");
      result.intro = $(this).children(".content").children("p").text();
      result.image = $(this).children(".content").children(".u-ratio").children("img").attr("src");

      // break each loop when there're 3 articles
      if (i > 10) {
        return false;
      }

      // create a document called "article" in database
      db.article.remove();
      db.article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });

      // if the article is already saved, delete it from database
      db.article.findOneAndRemove({ title: result.title, saved: false })
        .then(function (data) {
          console.log("data already saved and deleted!");
        })
        .catch(function (err) {
          console.log(err);
        });
    });

  });
  // res.send("Scraped!");
  res.render("index");
});


// route for getting all articles from database
app.get("/articles", function (req, res) {

  db.article.find({ saved: false })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});


// route for saving article to database
app.put("/articles/:id", function (req, res) {
  db.article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: true } })
    .then(function (dbArticle) {
      res.json(dbArticle);
      console.log("new article is saved...");
      console.log(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});


// route for getting all saved articles 
app.get("/saved-articles", function (req, res) {

  db.article.find({ saved: true })
    .then(function (dbArticle) {
      res.json(dbArticle);
      console.log("these are the saved articles...");
      console.log(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// route for deleting a saved article
app.delete("/saved-articles/:id", function (req, res) {
  db.article.findOneAndRemove({ _id: req.params.id })
    .then(function (data) {
      res.json(data);
      console.log("data deleted");
    });
});


// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});