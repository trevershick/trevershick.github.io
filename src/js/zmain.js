(function( $, window, undefined ) {
  // Menu
  $("a#slide").click(function(){
    $("#sidebar,a#slide,#fade").addClass("slide");
    $("#open").hide();
    $("#search").hide();
    $("#close").show();
  });

  $("#fade").click(function(){
    $("#sidebar,a#slide,#fade").removeClass("slide");
    $("#open").show();
    $("#search").show();
    $("#close").hide();
  });

  // Search
  var bs = {
    close: $(".icon-remove-sign"),
    searchform: $(".search-form"),
    canvas: $("body"),
    dothis: $('.dosearch')
  };

  var showSearchForm = function() {
    $('.search-wrapper').css({ transform: "translateY(0)" });
    bs.searchform.toggleClass('active');
    bs.searchform.find('input').focus();
    bs.canvas.toggleClass('search-overlay');
    $('.search-field').simpleJekyllSearch();
  };
  var hideSearchForm = function() {
    $('.search-wrapper').removeAttr( 'style' );
    bs.searchform.toggleClass('active');
    bs.canvas.removeClass('search-overlay');
  };

  bs.dothis.on('click', showSearchForm);
  bs.close.on('click', hideSearchForm);

  $(window).on('keydown', function(x) {
      console.log(x);
  });
  // Scroll
  smoothScroll.init({
    updateURL: false
  });

})( Zepto, window );
