(function(panel, $) {

  $.extend(panel, {
    items_putset: function(options) {
      var that = this;
      $('.items_putset_button').removeClass('button-ok button-error');
      $.ajax('http://www.ganjawars.ru/home.do.php?putset=' + options.set_id, {
        success: function(data) {
          /// Проверяем есть ли ссылка на этот комплект на странице
          if($(data).find('a[href*="/home.do.php?putset=' + options.set_id + '"]').length > 0) {
            panel.get('items_set_' + options.set_id, function(set) {
              if(set) {
                panel.loadScript('items/items.js', function() {
                  var dressed = panel.get_set_str($(data));
                  if(set == dressed) {
                    $(that).addClass('button-ok');
                  } else {
                    panel.showFlash('сет не полный, возможно что-то сломалось');
                    $(that).addClass('button-error');
                  }
                });
              } else {
                /// содержимое комплекта не было сохранено, предполагаем что он наделся
                $(that).addClass('button-ok');
              }
            }, true);
          } else {
            $(that).addClass('button-error');
          }
          panel.set('items_current_set', options.set_id, function() {}, true);
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