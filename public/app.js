$(function () {

  $("#scrape").on("click", function (e) {
    e.preventDefault();

    $.ajax({
      method: "GET",
      url: "/articles"
    })
      .then(function (data) {
        $("#article").empty();
        data.forEach(element => {
          // console.log(data);
          const link = element.link;
          const title = element.title;
          const intro = element.intro;
          const image = element.image;
          const id = element._id;

          $("#article").append(`
            <div id="${id}">
            <a href="${link}" class="title">${title}</a>
            <p>${intro}</p>
            <img src="${image}" class="image" height="100">
            <button type="button" id="save" data-id="${id}">Save</button>
            </div>            
          `);
        });
      });
  });


  $(document.body).on("click", "#save", function (e) {
    e.preventDefault();

    const articleId = $(this).attr("data-id");
    console.log(articleId);

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

    $.ajax({
      method: "GET",
      url: "/saved-articles"
    })
      .then(function (data) {
        $("#saved-articles").empty();
        // console.log(data);

        data.forEach(element => {
          $("#saved-articles").append(`
          <div id="${element._id}">
            <a href="${element.link}" class="title">${element.title}</a>
            <p>${element.intro}</p>
            <img src="${element.image}" class="image" height="100">
            <button type="button" id="delete" data-id="${element._id}">Delete</button>
            <button type="button" id="notes" data-id="${element._id}" data-toggle="modal" data-target="#modalWindow">Notes</button>
          </div>    
        `);

          $("#add-notes").attr("data-id", `${element._id}`);
        });
      });
  });


  $(document.body).on("click", "#delete", function (e) {
    e.preventDefault();
    const articleId = $(this).attr("data-id");

    $.ajax({
      method: "DELETE",
      url: "/saved-articles/" + articleId
    })
      .then(function (data) {
        console.log("article deleted!");
        $(`#${articleId}`).remove();
      });
  });


  $(document.body).on("click", "#notes", function (e) {
    e.preventDefault();
    $("#latest-notes").empty();
    const notesId = $(this).attr("data-id");
    $.ajax({
      method: "GET",
      url: "/saved-articles/" + notesId
    })
      .then(function (data) {
        if (data.note.body) {
          $("#latest-notes").append(`<div>${data.note.body}</div>`);
          $("#delete-notes").attr("data-id", `${data.note._id}`);
        }
      });
  });


  $(document.body).on("click", "#add-notes", function (e) {
    e.preventDefault();
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
        // console.log(data.note);

        $.ajax({
          method: "GET",
          url: "/saved-articles/" + articleId
        })
          .then(function (data) {
            $("#latest-notes").append(`
              <div>${data.note[0].body}</div>
              <button class="btn btn-secondary" id="delete-notes" data-id="${data.note[0]._id}">Delete</button>
              `);
          });

        $("#new-notes").val("");
      });
  });


  $(document.body).on("click", "#clear", function (e) {
    e.preventDefault();
    $("#new-notes").val("");
  });

  $(document.body).on("click", "#delete-notes", function (e) {
    e.preventDefault();

    const notesId = $(this).attr("data-id");
    $.ajax({
      method: "DELETE",
      url: "/notes/" + notesId
    })
      .then(function (data) {
        // to fix
        $("#latest-notes").empty();
        $("#delete-notes").removeAttr("data-id");
      });
  });

});