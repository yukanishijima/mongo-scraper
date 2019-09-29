$(function () {

  $("#scrape").on("click", function (e) {

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
          <button type="button" id="notes" data-id="${element._id}">Notes</button>
          </div>            
        `);
        });
      });
  });


  $(document.body).on("click", "#delete", function (e) {
    const articleId = $(this).attr("data-id");
    // console.log(articleId);

    $.ajax({
      method: "DELETE",
      url: "/saved-articles/" + articleId
    })
      .then(function (data) {
        console.log("article deleted!");
        $(`#${articleId}`).remove();
      });
  });



});