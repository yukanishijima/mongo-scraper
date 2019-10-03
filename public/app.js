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
            <div data-id="${element._id}">${element.body}</div>
            <button class="btn btn-secondary" id="delete-notes" data-id="${element._id}">Delete</button>
            `);
          });
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

        $.ajax({
          method: "GET",
          url: "/saved-articles/" + articleId
        })
          .then(function (data) {
            let content = "";
            data.note.forEach(element => {
              content = `
              <div data-id="${element._id}">${element.body}</div>
              <button class="btn btn-secondary" id="delete-notes" data-id="${element._id}">Delete</button>
              `;
            });
            $("#existing-notes").append(content);
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