'use strict';
$(document).ready(function () {

  /**
   * ============ VARIABLES AND FUNCTIONS ============ 
   */

  // API URLs
  const NYT_TOP_URL = 'https://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=' + FEEDR_NYT_API;
  const NYT_BOOKS_URL = 'https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=' + FEEDR_NYT_API;
  const newsapiUrl = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=' + FEEDR_NEWS_API;

  function handleDefaultResponse(allData) {
    $.each(allData, function () {
      if (this.title !== '') {
        // Define DOM elements to build an article         
        let $image = $('<img>').attr('src', this.thumbnail_standard);
        let $link = $('<a>').attr('href', this.url);
        let $title = $('<h3>').text(this.title);
        let $topic = $('<h6>').text(this.key_topics);
        let $author = $('<small>').text(this.byline);
        let $description = $('<p>').text(this.abstract).addClass('hidden');
        let NYTTopObj = {
          image: $image,
          link: $link,
          title: $title,
          author: $author,
          description: $description
        }
        appendToDom(NYTTopObj);
      }
    });
    displayArticle();
  }


  function handleNYTBooksResponse(allData) {
    // clear #main from other contents
    $('#main').empty();
    $.each(allData, function () {
      if (this.title !== '') {
        let $image = $('<img>').attr('src', this.book_image);
        let $link = $('<a>').attr('href', this.amazon_product_url);
        let $title = $('<h3>').text(this.title);
        let $author = $('<h6>').text(this.author);
        let $description = $('<p>').text(this.description).addClass('hidden');
        let NYTBooksObj = {
          image: $image,
          link: $link,
          title: $title,
          author: $author,
          description: $description
        }
        appendToDom(NYTBooksObj);
      }
    });
    displayArticle();
  }

  // function handleNewsAPIResponse(allData) {
  //   // clear #main from other contents
  //   $('#main').empty();
  //   $.each(allData, function () {
  //     if (this.title !== '') {
  //       let $image = $('<img>').attr('src', this.urlToImage);
  //       let $link = $('<a>').attr('href', this.url);
  //       let $title = $('<h3>').text(this.title);
  //       let $author = $('<h6>').text(this.author);
  //       let $description = $('<p>').text(this.description).addClass('hidden');
  //       let NewsObj = {
  //         image: $image,
  //         link: $link,
  //         title: $title,
  //         author: $author,
  //         description: $description
  //       }
  //       appendToDom(NewsObj);
  //     }
  //   });
  //   displayArticle();
  // }

  function appendToDom(data) {
    $('#main').append(
      $('<article class="article">').append(
        $('<section class="featuredImage">').append(data.image)
      ).append(
        $('<section class="articleContent">').append((data.link).append(data.title)
        ).append(data.author).append(data.description)
      ).append(
        $('<section class="impressions">', { 'text': '#' })
      ).append(
        $('<div class="clearfix">')
      )
    );
  }


  function displayArticle() {
    // when the user clicks on article title, display the article popup
    $('.article .articleContent h3').on('click', function (e) {
      e.preventDefault();
      $('#popUp').removeClass('loader hidden');
      // insert article contents inside popup
      let articleTitle = $(this).text();
      let articleLink = $(this).parent('a').attr('href');
      let articleDescr = $(this).parent('a').siblings().last().text();

      $('#popUp .container h1').text(articleTitle);
      $('#popUp .container p').text(articleDescr);
      $('#popUp .container a').attr('href', articleLink);
    });
  }

  // Default feed - NYT Top Stories
  function getDefault() {
    $.ajax({
      url: NYT_TOP_URL,
      data: {
        format: "json"
      },
      error: function () {
        $('#main').html('<p>NYT Wire: An error has occurred. </p>');
      },
      success: function (response) {
        handleDefaultResponse(response.results);
      }
    });
  }

  function emptyMain() {
    if ($('#main').children().length > 0) {
      $('#main').empty();
    }
  }

  /**
   *  ============ PROGRAM EXECUTION ============ 
   */

  // Set up a loading indicator using Ajax Events
  $(document).ajaxStart(function () {
    $('#popUp').removeClass('hidden');
  })
    .ajaxStop(function () {
      $('#popUp').addClass('hidden');
    });

  // Load default feed on document load
  getDefault();

  // Load default feed on dropdown click 
  $('#nyttop').on('click', function () {
    emptyMain(); // purge #main from previously loaded contents
    getDefault();
    $('#source').text($(this).text());
  });
  $('#logo').on('click', function () {
    emptyMain();
    getDefault();
  })


  // NYT Books
  $('#nytbooks').on('click', function () {
    $('#source').text($(this).text());
    $.ajax({
      url: NYT_BOOKS_URL,
      data: {
        format: 'json'
      },
      error: function () {
        $('#main').html('<p>An error has occurred</p>');
      },
      success: function (response) {
        handleNYTBooksResponse(response.results.books);
      },
      type: 'GET'
    });
  });


  // DOM helpers
  $('#popUp').on('click', '.closePopUp', function (e) {
    e.preventDefault();
    $(this).parent().addClass('loader hidden');
  });

  $('#search-icon').on('click', function (e) {
    e.preventDefault();
    $(this).parent('#search').toggleClass('active');
  });

  // Search - bonus
  $("#search input").on('keyup', function (e) {
    var value = $(this).val().toLowerCase();
    $('#main .article').filter(function () {
      $(this).toggle($(this).find('h3').text().toLowerCase().indexOf(value) > -1)
    });
    // close search field on enter
    if (e.keyCode === 13) {
      $('#search').toggleClass('active');
    }
  });

});