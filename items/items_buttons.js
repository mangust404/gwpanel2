(function(panel, $) {

  $.extend(panel, {
    items_putset: function(options) {
      var that = this;
      $.ajax('http://www.ganjawars.ru/home.do.php?putset=' + options.set_id, {
        success: function(data) {
          /// Проверяем есть ли ссылка на этот комплект на странице
          if($(data).find('a[href*="/home.do.php?putset=' + options.set_id + '"]').length > 0) {
            $(that).addClass('button-ok');
          } else {
            $(that).addClass('button-error');
          }
          panel.set('items_current_set', options.set_id);
        }, 
        error: function() {
          $(that).addClass('button-error');
        }
      });
    },
    items_undress: function() {
      var that = this;
      $.ajax('http://www.ganjawars.ru/items.php', {
        success: function(data) {
          /// Проверяем есть ли ссылка на этот комплект на странице
          var link = $(data).find('a[href*="/home.do.php?dress_off="]');
          if(link.length > 0) {
            $.ajax(link.attr('href'), {
              success: function() {
                $(that).addClass('button-ok');
              },
              error: function() {
                $(that).addClass('button-error');
              }
            });
          } else {
            $(that).addClass('button-error');
          }
        }, 
        error: function() {
          $(that).addClass('button-error');
        }
      });
    }
  });
})(window.__panel, jQuery);