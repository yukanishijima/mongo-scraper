$(function () {


  $("#home").on("click", function (e) {
    e.preventDefault();
    $("#home-msg").text("Let's scrape articles!");
    $("#article").hide();
    $("#saved-articles").hide();
  });


  $("#scrape").on("click", function (e) {
    e.preventDefault();
    $("#home-msg").text("Successfully scraped!");
    $("#saved-articles").hide();
    $("#article").show();

    $.ajax({
      method: "GET",
      url: "/articles"
    })
      .then(function (data) {
        $("#article").empty();
        data.forEach(element => {

          $("#article").append(`
          <div id="${element._id}" class="col-md-6">
            <div class="article-wrap">
              <a href="${element.link}" class="title">${element.title}</a>
              <p>${element.intro}</p>
              <button type="button" id="save" data-id="${element._id}" class="btn btn-primary">Save</button>
            </div>
          </div>            
          `);
        });
      });
  });


  $(document.body).on("click", "#save", function (e) {
    e.preventDefault();
    const articleId = $(this).attr("data-id");

    $.ajax({
      method: "PUT",
      url: "/articles/" + articleId
    })
      .then(function (data) {
        $(`#${articleId}`).remove();

      });
  });


  $("#saved").on("click", function (e) {
    e.preventDefault();
    $("#home-msg").text("Saved articles...");
    $("#article").hide();
    $("#saved-articles").show();

    $.ajax({
      method: "GET",
      url: "/saved-articles"
    })
      .then(function (data) {
        $("#saved-articles").empty();
        if (data.length === 0) {
          $("#home-msg").text("No saved articles...");
        } else {
          data.forEach(element => {
            $("#saved-articles").append(`
            <div id="${element._id}" class="col-md-6">
              <div class="article-wrap">
                <a href="${element.link}" class="title">${element.title}</a>
                <p>${element.intro}</p>
                <button type="button" id="delete" data-id="${element._id}" class="btn btn-secondary">Delete</button>
                <button type="button" id="notes" data-id="${element._id}" data-toggle="modal" data-target="#modalWindow" class="btn btn-primary">Notes</button>
              </div>
            </div>    
            `);

            $("#add-notes").attr("data-id", `${element._id}`);
          });
        }
      });
  });


  $(document.body).on("click", "#delete", function (e) {
    e.preventDefault();
    const articleId = $(this).attr("data-id");
    const notesId = $("#existing-notes div").attr("data-id");

    $.ajax({
      method: "DELETE",
      url: "/saved-articles/" + articleId + "/" + notesId
    })
      .then(function (data) {
        console.log("article deleted!");
        $(`#${articleId}`).remove();
      });
  });


  $(document.body).on("click", "#notes", function (e) {
    e.preventDefault();
    $("#existing-notes").empty();
    const notesId = $(this).attr("data-id");

    $.ajax({
      method: "GET",
      url: "/saved-articles/" + notesId
    })
      .then(function (data) {
        if (data.note.length > 0) {
          data.note.forEach(element => {
            $("#existing-notes").append(`
            <div data-id="${element._id}">
            <p>${element.body}</p>
            <p>${(element.created_at).slice(0, 10)}</p>
            <button class="btn btn-secondary" id="delete-notes" data-id="${element._id}">Delete</button>
            </div>`);
          });
        } else {
          $("#existing-notes").append(`<p>No notes yet...</p>`);
        }
      });
  });


  $(document.body).on("click", "#add-notes", function (e) {
    e.preventDefault();
    if ($("#new-notes").val().length > 0) {
      $("#existing-notes > p").remove();
      const articleId = $(this).attr("data-id");

      $.ajax({
        method: "POST",
        url: "/saved-articles/" + articleId,
        data: {
          body: $("#new-notes").val()
        }
      })
        .then(function (data) {
          console.log("new note added to db!");

          $.ajax({
            method: "GET",
            url: "/saved-articles/" + articleId
          })
            .then(function (data) {
              let content = "";
              data.note.forEach(element => {
                content = `
              <div data-id="${element._id}">
              <p>${element.body}</p>
              <p>${(element.created_at).slice(0, 10)}</p>
              <button class="btn btn-secondary" id="delete-notes" data-id="${element._id}">Delete</button>
              </div>`;
              });

              $("#existing-notes").append(content);

            });
          $("#new-notes").val("");
        });
    }
  });


  $(document.body).on("click", "#clear", function (e) {
    e.preventDefault();
    $("#new-notes").val("");
  });


  $(document.body).on("click", "#delete-notes", function (e) {
    e.preventDefault();

    const notesId = $(this).attr("data-id");
    const articleId = $("#add-notes").attr("data-id");
    $.ajax({
      method: "DELETE",
      url: "/notes/" + notesId + "/" + articleId
    })
      .then(function (data) {
        console.log("note deleted!");
        $(`div[data-id="${notesId}"`).remove();
        $(`button[data-id="${notesId}"`).remove();
      });
  });

});