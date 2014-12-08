(function(panel, $) {

  $.extend(panel, {
    items_putset: function(options) {
      var that = this;
      $('.items_putset_button').removeClass('button-ok button-error');
      $.ajax('http://www.ganjawars.ru/home.do.php?putset=' + options.set_id, {
        success: function(data) {
          panel.loadScript('items/items.js', function() {
            var $data = $(data);
            panel.get_set_str($data, function(dressed) {
              /// Проверяем есть ли ссылка на этот комплект на странице
              panel.get('items_set_' + options.set_id, function(set) {
                if(set) {
                  // комплект был сохранён
                  function updateData() {
                    panel.set('items_current_set', options.set_id, function() {}, true);
                    if(panel.panel_ajaxify && 
                        (location.pathname == '/me/' || location.pathname == '/items.php')) {
                      panel.gotoHref(location.href, null, true);
                    }
                  }

                  function success() {
                    if(options.skill_button) {
                      // Если указана кнопка комплектов, то программно кликаем по ней
                      try {
                        panel.clickButton(options.skill_button, function() {
                          updateData();
                          $(that).addClass('button-ok');
                        }, function() {
                          $(that).addClass('button-error');
                        });
                      } catch(e) {
                        console.log(e);
                        $(that).addClass('button-error');
                      }
                    } else {
                      updateData();
                      $(that).addClass('button-ok');
                    }
                  }

                  if(set == dressed) {
                    success();
                  } else {
                    /*if($data.find('#extras').length == 0) {
                      panel.showFlash('Пожалуйста, включите новый вариант оформления экипировки чтобы узнавать наделся ли комплект (галочка "Старое оформление экипировки" в <a href="http://www.ganjawars.ru/info.edit.php">настройках игры</a> не должна стоять');
                      return false;
                    }*/
                    var ar_dressed = dressed.split('+');
                    var ar_set = set.split('+');

                    var missed_items = '';

                    $.each(ar_set, function(i, item) {
                      if(ar_dressed.indexOf(item) == -1) {
                        item = item.substr(3);
                        var ar = item.split('&');
                        var item_id = ar[0];
                        missed_items += '<a href="http://www.ganjawars.ru/items.php?seek=' + 
                          encodeURIComponent(item) + '"><img src="http://images.ganjawars.ru/img/items/' + item_id + '_s.jpg" /></a>';
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
                      success();
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
    },

    items_skills: function(options, callback, failover) {
      var $that = $(this);
      $('.items_skills_button').removeClass('button-ok button-error');

      panel.loadScript('panel/panel_ajax.js', function() {
        $.ajax('http://www.ganjawars.ru/home.skills.php', {
          success: function(data) {
            var $form = $('<div>').hide().appendTo(document.body)
              .html(data)
              .find('input[name=saveperks]').closest('form');

            var currentSkills = {};

            if($form.length > 0) {
              try {
                $.each(options, function(key, value) {
                  if($.type(value) == 'string') {
                    var $elem = $form.find('input[name=' + key + '][checked]');
                    if($elem.length > 0) {
                      currentSkills[$elem.attr('name')] = $elem.attr('value');
                    }
                    $elem.removeAttr('checked');
                    if(value != '') {
                      $form.find('input[name=' + key + '][value="' + value + '"]')
                        .attr('checked', 'checked');
                    }
                  }
                });
              } catch(e) {
                console.log(e);
              }

              $form.sendForm({
                success: function(data) {
                  /// Проверка установленных значений
                  var $form = $('<div>').hide().appendTo(document.body)
                    .html(data)
                    .find('input[name=saveperks]').closest('form');
                  var changed = {};
                  $form.find('input[type=radio][checked]').each(function() {
                    var name = this.name;
                    if(currentSkills[name] != options[name]) {
                      var __title = $(this).parents('tr').last().prev().text();
                      var __value = $(this).closest('td').next().find('b').text() || 'нет';
                      changed[__title] = __value;
                    }
                    if(this.value != options[name]) {
                      $that.addClass('button-error');
                      if(failover) {
                        panel.showFlash('Не удалось установить указанный в настройках набор навыков');
                      }
                      if(failover) failover();
                    }
                  });
                  if(!$that.hasClass('button-error')) {
                    if(Object.keys(changed).length > 0) {
                      var msg = '<p>Изменены навыки:</p><ul>';
                      for(var title in changed) {
                        msg += '<li>' + title + ' &ndash; <b>' + changed[title] + '</b></li>';
                      }
                      msg += '</ul>';
                      panel.showFlash(msg, 'message', 3000);
                    }
                    $that.addClass('button-ok');
                    if(callback) {
                      callback();
                    }
                  }
                  $form.remove();
                }
              });
            } else {
              $that.addClass('button-error');
              if(failover) failover();
            }
            $form.remove();
          },
          error: function() {
            $that.addClass('button-error');
          }
        });
      });
    }
  });
})(window.__panel, jQuery);