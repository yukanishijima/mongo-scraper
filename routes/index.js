const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models");

module.exports = function (app) {

  // Route for scraping
  app.get("/", function (req, res) {

    axios.get("https://monocle.com/magazine/").then(function (response) {
      const $ = cheerio.load(response.data);
      $("article .container").each(function (i, element) {
        let result = {};
        result.title = $(this).children("header").children("h2").text();
        result.link = $(this).children("header").children("h2").children("a").attr("href");
        result.intro = $(this).children(".content").children("p").text();
        // result.image = $(this).children(".content").children(".u-ratio").children("img").attr("src");

        // break each loop when there're 10 articles
        if (i > 9) {
          return false;
        }

        // create a document called "article" in database
        db.article.create(result)
          .then(function (dbArticle) {
            console.log(dbArticle);
          })
          .catch(function (err) {
            console.log(err);
          });

      });

    });
    res.render("index");
  });


  // route for getting all articles from database
  app.get("/articles", function (req, res) {

    db.article.find({ saved: false }, null, { limit: 10 })
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
  app.delete("/saved-articles/:articleId/:notesId", function (req, res) {

    db.note.findOneAndRemove({ _id: req.params.notesId })
      .then(function (data) {
        console.log(data);
      })
      .catch(function (err) {
        console.log(err);
      });

    db.article.findOneAndUpdate(
      { _id: req.params.articleId },
      { $set: { saved: false }, $pull: { note: req.params.notesId } },
      { new: true })
      .then(function (data) {
        console.log(data);
      })
      .catch(function (err) {
        console.log(err);
      });


    db.article.findOneAndUpdate({ _id: req.params.articleId }, { $set: { saved: false } }, { new: true })
      .then(function (data) {
        console.log(data);
      })
      .catch(function (err) {
        console.log(err);
      });

    res.send("data deleted");
  });


  // route for grabbing a specific article and populate it with its note
  app.get("/saved-articles/:id", function (req, res) {
    db.article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function (dbArticle) {
        res.json(dbArticle);
        console.log(`after populating: ${dbArticle}`);
      })
      .catch(function (err) {
        res.json(err);
      });
  });


  // route for saving notes
  app.post("/saved-articles/:id", function (req, res) {
    db.note.create(req.body)
      .then(function (dbNote) {
        //insert a new note (not overwrite) by using $push
        return db.article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
      })
      .then(function (dbArticle) {
        res.json(dbArticle);
        console.log(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });
  });


  // route for deleting notes
  app.delete("/notes/:notesId/:articleId", function (req, res) {

    db.note.findOneAndRemove({ _id: req.params.notesId })
      .then(function (data) {
        return db.article.findOneAndUpdate({ _id: req.params.articleId }, { $pull: { note: data._id } }, { new: true });
      })
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
      .catch(function (err) {
        res.json(err);
      });

  });

};