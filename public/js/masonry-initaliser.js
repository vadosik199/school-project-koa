$(document).ready(function() {
    setTimeout(function() {
        $('.masonry-row').masonry({
            itemSelector: '.masonry-item',
            percentPosition: true,
            gutter: 0,
            stamp: '.gallery-header'
          });
    }, 1000);
});