'use strict';
$(document).ready(function() {

  /**
   * ============ VARIABLES AND FUNCTIONS ============ 
   */

  // API URLs
  const mashableUrl = 'https://api.mashable.com/v1/posts/';
  const nytUrl = 'https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key='+nytApiKey;
  const newsapiUrl = 'http://newsapi.org/v2/top-headlines?country=us&apiKey='+newsApiKey;

  function handleDefaultResponse(allData) {
      $.each(allData, function() {
          if(this.title !== '') {
            // Define DOM elements to build an article         
            let $image = $('<img>').attr('src', this.images.i120x120);
            let $link = $('<a>').attr('href', this.link);
            let $title = $('<h3>').text(this.title);
            let $topic = $('<h6>').text(this.key_topics);
            let $author = $('<small>').text(this.author);
            let $description = $('<p>').text(this.content.excerpt).addClass('hidden');
            let MashableObj = {
              image: $image,
              link: $link,
              title: $title,
              author: $author,
              description: $description
            }
            appendToDom(MashableObj);
          }  
      });
      displayArticle();
    }

  function handleNYTResponse(allData) {
    // clear #main from other contents
    $('#main').empty();
    $.each(allData, function() {
      if(this.title !== '') {                  
        let $image = $('<img>').attr('src', this.book_image);
        let $link = $('<a>').attr('href', this.amazon_product_url);
        let $title = $('<h3>').text(this.title);
        let $author = $('<h6>').text(this.author);
        let $description = $('<p>').text(this.description).addClass('hidden');
        let NYTObj = {
          image: $image,
          link: $link,
          title: $title,
          author: $author,
          description: $description
        }
        appendToDom(NYTObj);
      }  
  });
  displayArticle();
  }

  function handleNewsAPIResponse(allData) {
    // clear #main from other contents
    $('#main').empty();
    $.each(allData, function() {
      if(this.title !== '') {                  
        let $image = $('<img>').attr('src', this.urlToImage);
        let $link = $('<a>').attr('href', this.url);
        let $title = $('<h3>').text(this.title);
        let $author = $('<h6>').text(this.author);
        let $description = $('<p>').text(this.description).addClass('hidden');      
        let NewsObj = {
          image: $image,
          link: $link,
          title: $title,
          author: $author,
          description: $description
        }
        appendToDom(NewsObj);
      }  
  });
  displayArticle();
  }

  function appendToDom(data) {
    $('#main').append(
      $('<article class="article">').append(
        $('<section class="featuredImage">').append(data.image)
      ).append(
        $('<section class="articleContent">').append((data.link).append(data.title)
        ).append(data.author).append(data.description)
      ).append(
        $('<section class="impressions">', {'text':'#'})
      ).append(
        $('<div class="clearfix">')
      )
    );
  }


  function displayArticle() {
    // when the user clicks on article title, display the article popup
    $('.article .articleContent h3').on('click', function(e){
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

// Default feed - Mashable 
function getDefault() {
  $.ajax({
    url: mashableUrl,
    data: {
        format: "json"
    },
    error: function() {
      $('#main').html('<p>An error has occurred. </p>' +  textStatus + ' ' + errorThrown);
    },
    success: function(response) {
      handleDefaultResponse(response.posts);  
    }
  });
}

/**
 *  ============ PROGRAM EXECUTION ============ 
 */

// Set up a loading indicator using Ajax Events
$(document).ajaxStart(function() {
    $('#popUp').removeClass('hidden');    
})
.ajaxStop(function() {
  $('#popUp').addClass('hidden');
});

// Load default feed on document load
getDefault();

// Load default feed on dropdown click 
$('#mashable').on('click', function() {
  getDefault();
  $('#source').text($(this).text());
});
$('#logo').on('click', function() {
  getDefault();
})


// NYT Books
$('#nyt').on('click',function() {
  $('#source').text($(this).text());
  $.ajax({
     url: nytUrl,
     data: {
        format: 'json'
     },
     error: function() {
        $('#main').html('<p>An error has occurred</p>');
     },
     success: function(response) {
      handleNYTResponse(response.results.books);
     },
     type: 'GET'
  });
});

// News API Org
$('#newsapi').on('click',function() {
  $('#source').text($(this).text());
  $.ajax({
     url: newsapiUrl,
     data: {
        format: 'json'
     },
     error: function() {
        $('#main').html('<p>An error has occurred</p>');
     },
     success: function(response) {
      handleNewsAPIResponse(response.articles);      
     },
     type: 'GET'
  });
});


  // DOM helpers
  $('#popUp').on('click', '.closePopUp', function(e){
    e.preventDefault();
    $(this).parent().addClass('loader hidden');
  });

  $('#search-icon').on('click', function(e) {
    e.preventDefault();
    $(this).parent('#search').toggleClass('active');
  });

  // Search - bonus
  $("#search input").on('keyup', function(e) { 
    var value = $(this).val().toLowerCase();   
    $('#main .article').filter(function() {
      $(this).toggle($(this).find('h3').text().toLowerCase().indexOf(value) > -1)
    });
    // close search field on enter
    if(e.keyCode === 13) {
      $('#search').toggleClass('active');
    }
  });

});