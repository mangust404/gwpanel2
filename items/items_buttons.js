(function(panel, $) {

  $.extend(panel, {
    items_putset: function(options) {
      var that = this;
      $('.items_putset_button').removeClass('button-ok button-error');
      $.ajax('http://www.ganjawars.ru/home.do.php?putset=' + options.set_id, {
        success: function(data) {
          panel.loadScript('items/items.js', function() {
            var $data = $(data);
            var dressed = panel.get_set_str($data);
            /// Проверяем есть ли ссылка на этот комплект на странице
            panel.get('items_set_' + options.set_id, function(set) {
              if(set) {
                // комплект был сохранён
                if(set == dressed) {
                  $(that).addClass('button-ok');
                } else {
                  if($data.find('#extras').length == 0) {
                    panel.showFlash('Пожалуйста, включите новый вариант оформления экипировки чтобы узнавать наделся ли комплект (галочка "Старое оформление экипировки" в <a href="http://www.ganjawars.ru/info.edit.php">настройках игры</a> не должна стоять');
                    return false;
                  }
                  var ar_dressed = dressed.split('+');
                  var ar_set = set.split('+');

                  var missed_items = '';

                  $.each(ar_set, function(i, item) {
                    if(ar_dressed.indexOf(item) == -1) {
                      item = item.split('=')[1];
                      var ar = item.split('&');
                      var item_id = ar[0];
                      missed_items += '<a href="http://www.ganjawars.ru/items.php?seek=' + 
                        item + '"><img src="http://images.ganjawars.ru/img/items/' + item_id + '_s.jpg" /></a>';
                    }
                  });

                  if(missed_items) {
                    panel.showFlash('<p>Cет не полный, не хватает вещей:</p><center>' + 
                      missed_items + '</center>');
                    if(panel.panel_ajaxify) {
                      $('.panel-flash a').click(function() {
                        panel.gotoHref(this.href);
                        $('.panel-flash').remove();
                        return false;
                      });
                    }

                    $(that).addClass('button-error');
                  } else {
                    $(that).addClass('button-ok');
                  }
                }
                if($(that).hasClass('button-ok')) {
                  panel.set('items_current_set', options.set_id, function() {}, true);
                  if(panel.panel_ajaxify && 
                      (location.pathname == '/me/' || location.pathname == '/items.php')) {
                    panel.gotoHref(location.href, null, true);
                  }
                }
              } else {
                /// содержимое комплекта не было сохранено, предполагаем что он наделся если на него есть ссылка
                if($(data).find('a[href*="/home.do.php?putset=' + options.set_id + '"]').length > 0) {
                  $(that).addClass('button-ok');
                  panel.set('items_current_set', options.set_id, function() {}, true);
                  panel.set('items_set_' + options.set_id, dressed, function() {}, true);
                } else {
                  $(that).addClass('button-error');
                }
              }
            }, true);
          });
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