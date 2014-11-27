(function(panel, $) {
  var slots = {
    'Голова': 'hd',
    'Левая рука': 'lh',
    'Правая рука': 'rh',
    'В руках': 'bh',
    'Корпус': 'bd',
    'Спина': 'bk',
    'Граната': 'gr',
    'Пояс': 'bt',
    'Ноги': 'ft',
    'Транспорт': 'tr',
    'Левый': 'lp',
    'Правый': 'rp',
    'Очки': 'gl',
    'Чипсет': 'ch',
  }
  var is_edit = false;

jQuery.extend(panel, {

  items_sets: function() {
    var $set_id = $('select[name="set_id"]');
    /// вытаскиваем сеты и определяем какой сейчас надет
    panel.get('items_current_set', function(current_set) {
      if(current_set > 0) {
        /// если мы знаем какой комлект сейчас надет, то выбираем его
        $set_id.val(current_set).change();
      } else {
        var dressed = panel.get_set_str();
        /// если не знаем, то пытаемся определить из всех сохранённых комплектов
        for(var i = 1; i <= parseInt($set_id.find('option:last').val()); i++) {
          panel.get('items_set_' + i, function(set) {
            if(dressed == set) {
              $set_id.val(i).change();
              i = 999;
            }
          }, true);
        }
      }
    }, true);
    var $form = $set_id.closest('form');
    var $set_name = $form.find('input[name="set_name"]');
    var current_icon;
    $set_name.focus(function() {
      if($(this).val() == '' && $(this).attr('placeholder') != '(нет комплекта)') {
        $(this).val($(this).attr('placeholder'));
      }
    });

    var pane_id = null;
    var first_pane_with_buttons = null;
    var button_id = null;
    var skill_button;

    /// При изменении селектбокса с комплектами
    $set_id.change(function() {
      $set_name.attr('placeholder', 
        $(this).find('option[value=' + $(this).val() + ']').text().substr(3)
      ).val('');
      var set_id = $(this).val();

      var current_options = panel.getOptions();
      /// ищем есть ли кнопка с этим комплектом в панели
      is_edit = false;

      $.each(panel.getAllButtons('items_putset_button'), function(i, btn) {
        if(first_pane_with_buttons === null) {
          first_pane_with_buttons = btn.paneID;
        }
        if(btn.button.arguments.set_id == set_id) {
          pane_id = btn.paneID;
          button_id = btn.index;
          is_edit = true;
          skill_button = btn.button.arguments.skill_button;
        }
      });

      $form.find('.gwp-upd, .icon-select').remove();
      if(is_edit) {
        $('<p class="gwp-upd">').append(
          $('<input type="checkbox" id="edit-button" checked="checked">')
        ).append(
          $('<label for="edit-button">Обновить кнопки в GWPanel</label>')
        ).appendTo($form);
      } else {
        $('<p class="gwp-upd">').append(
          $('<input type="checkbox" id="add-button" checked="checked">')
        ).append(
          $('<label for="add-button">Добавить кнопку в GWPanel</label>')
        ).appendTo($form);
      }
      var images = $('#itemsbody').find('table:first').find('img[src*="/items/"]').toArray().map(function(item) {
        return $(item).attr('src');
      });
      var right_hand_img = $('#itemsbody').find('table:first').find('tr:contains(Правая рука) img[src*="/items/"]').attr('src') ||
                           $('#itemsbody').find('table:first').find('tr:contains(В руках) img[src*="/items/"]').attr('src');
      if(is_edit && !isNaN(pane_id) && !isNaN(button_id) && images.indexOf(panel.iconURL(current_options.panes[pane_id].buttons[button_id].img)) == -1) {
        images.push(current_options.panes[pane_id].buttons[button_id].img);
      }

      if(is_edit) {
        current_icon = current_options.panes[pane_id].buttons[button_id].img;
      } else {
        current_icon = right_hand_img? right_hand_img: images[0];
      }
      var current_index = images.indexOf(current_icon);

      $('<div class="icon-select"><span style="line-height: 50px; vertical-align: top;">Иконка:&nbsp;</span></div>').append(
        $('<img>', {
          src: panel.iconURL(current_icon)
        }).css({
          cursor: 'pointer'
        }).click(function() {
          current_index++;
          if(current_index >= images.length) current_index = 0;
          current_icon = images[current_index];
          $(this).attr('src', panel.iconURL(current_icon));
        })
      ).appendTo($form);

      /// Привязка к навыкам
      $('.skills-select, .skills-title').remove();

      var $append_to = $form;
      if($('#extras').length) {
        $append_to = $form.closest('td').next();
      }

      $('<h3 class="skills-title">Привязать к набору навыков:</h3>').css({
        color: '#900',
        'font-size': '9pt',
        'text-align': 'center'
      })
        .appendTo($append_to);

      var $skills_div = $('<div class="skills-select pane inline">')
                          .appendTo($append_to);


      $.each(panel.getAllButtons('items_skills_button'), function(i, btn) {
        var $div = $('<div class="button ' + btn.button.type + '">')
                     .appendTo($skills_div);

        $('<label class="img" for="skill-button-' + btn.button.id + '">' + 
          '<img src="' + panel.iconURL(btn.button.img) + '"/>' + 
          '<h3>' + btn.button.title + '</h3>' +
          '</label>').appendTo($div);

        var $input = $('<input type="radio" id="skill-button-' + btn.button.id
                       + '" name="skills-radio">').appendTo($div);

        $input.change(function() {
          $skills_div.find('.button-ok').removeClass('button-ok');
          $(this).closest('.button').addClass('button-ok');
          skill_button = btn.button.id;
          if(is_edit) {
            // Если кнопка уже существует, то сразу меняем у неё набор
            current_options.panes[pane_id].buttons[button_id].arguments.skill_button = skill_button;
            panel.setOptions(current_options);
          }
          // если кнопка не существует, то набор будет записан после сохранения
        });

        if(btn.button.id == skill_button) {
          $input.attr('checked', 'checked');
          $div.addClass('button-ok');
        }
      });
    }).change().closest('form');

    $form.find('input[type=submit]').click(function() {
      if($set_name.val() == '') {
        $set_name.val($set_name.attr('placeholder'));
      }
      /// Запоминаем сет в ЛС
      panel.set('items_set_' + $set_id.val(), 
        panel.get_set_str(),
        function() {
          /// выставляем текущий надетый сет
          panel.set('items_current_set', $set_id.val(), function() {
            var current_options = panel.getOptions();
            panel.loadScript('panel/panel_settings.js', function() {
              if($('#edit-button:checked').length) {
                var btnOptions = current_options.panes[pane_id].buttons[button_id];
                btnOptions.img = current_icon;
                btnOptions.title = $set_name.val();
                btnOptions.arguments = btnOptions.arguments || {};
                btnOptions.arguments.skill_button = skill_button;

                panel.setOptions(current_options);
                $('.pane').remove();
                panel.showFlash('Кнопка изменена', 'message', 3000);
              } else if($('#add-button:checked').length) {
                panel.addButton(first_pane_with_buttons, 
                  'items_putset_button', 
                  $.extend(panel.getSchema().buttons.items_putset_button, {
                    title: $set_name.val(),
                    arguments: {set_id: $set_id.val(), skill_button: skill_button},
                    img: current_icon
                  }
                ));
                panel.setOptions(current_options);
                panel.showFlash('Кнопка добавлена', 'message', 3000);
              }
              $form.submit();
            });
          }, true);
        }, true);
      return false;
    });
  
    /// если страница была вызвана через putset=N, то запоминаем комплект
    panel.get('dress_on_set', function(set_id) {
      if(set_id) {
        panel.set('items_current_set', set_id, function() {
          /// меняем текущий выбранный комплект
          $set_id.val(set_id).change();
          panel.del('dress_on_set', function() {
            panel.set('items_set_' + set_id, panel.get_set_str());
          });
        }, true);
      }
    });

    if(location.search.search(/seek=([^=]+)/) > -1) {
      var seek = decodeURIComponent(RegExp.$1);
      var $first_tr;
      var trFound;
      /// находим все предметы удовлетворяющие условию
      $('a[href*="' + seek + '"]').each(function() {
        var $item_tr = $(this).closest('tr[id*="item_tr"]');
        if(!$first_tr) $first_tr = $item_tr;
        if($item_tr.length > 0 && $item_tr.find('a[href*="workshop.php"]').length > 0) {
          /// точное соответствие найдено
          $item_tr.css({
            'background-color': '#ffe0e0'
          })
          $('html,body').animate({
            scrollTop: $item_tr.offset().top - 40
          }, 1000);
          trFound = true;
        }
      });
      /// соответствие не найдено, переходим к первому похожему
      if(!trFound && $first_tr && $first_tr.length > 0) {
        $('html,body').animate({
          scrollTop: $first_tr.offset().top - 40
        }, 1000);
      } else if(seek && !trFound) {
        /// Предлагаем "Где купить"
        panel.loadScript('items/items_data.js', function() {
          var ar = seek.split('&');
          if(panel.items_synd_grenades.indexOf(ar[0]) > -1) {
            panel.showFlash('В инвентаре не найдена граната. <a href="' + 
                            'http://www.ganjawars.ru/sshop.php?seek=' + 
                            ar[0] + '">Перейти в магазин.</a>', 5000);
          } else {
            panel.showFlash('В инвентаре не найден этот предмет. <a href="' + 
                            'http://www.ganjawars.ru/market.php?buy=1&item_id=' + 
                            ar[0] + '">Где купить?</a>', 5000);
          }
        });
      }
    }

    $(function() {
      var originalPostdo = window.postdo;
      if(originalPostdo.toString().indexOf('originalPostdo') == -1) {
        window.postdo = function(href) {
          var $js_window = $('#js_window').clone();
          $.ajax(href, {
            success: function(data) {
              if(panel.panel_ajaxify) {
                panel.ajaxUpdateContent(data, location.href);
                $js_window.appendTo('#gw-content');
                panel.ajaxTearDown();
                panel.ajaxRefresh();
              } else {
                $('#itemsbody').html(data);
                $js_window.insertBefore('#itemsbody');
              }
            }
          });
          return false;
        }
      }
    });
  },

  get_set_str: function(data) {
    var elem;
    if(data) {
      $elem = $(data);
    } else {
      $elem = $('#itemsbody');
    }
    var ar = $elem.find('table:first')
      .find('a[href*="item.php?"]')
      .map(function() {
        var $parent = $(this).closest('tr');
        var slot;
        for(var key in slots) {
          if($parent.find('td:contains(' + key + ')').length) {
            slot = slots[key];
            break;
          }
        }
        return slot + '=' + this.href.split('item_id=')[1];
      }).toArray();
    return ar.join('+');
  },

  items_set_check: function(options, event) {
    panel.get('items_current_set', function(set_id) {
      panel.get('items_set_' + set_id, function(set) {
        if(set) {
          $(document.body).addClass('ajax-loading');
          $.ajax('http://www.ganjawars.ru/items.php', {
            success: function(data) {
              $(document.body).removeClass('ajax-loading');
              var dressed = panel.get_set_str($(data));
              if(dressed != set) {
                /// определяем разницу
                var ar_dressed = dressed.split('+');
                var ar_set = set.split('+');

                var missed_items = '';

                $.each(ar_set, function(i, item) {
                  if(ar_dressed.indexOf(item) == -1) {
                    var slot = item.substr(0, item.indexOf('='));
                    if(options.nocheck_grenade && slot == 'gr') return;
                    item = item.substr(item.indexOf('=') + 1);
                    var ar = item.split('&');
                    var item_id = ar[0];
                    missed_items += '<a href="http://www.ganjawars.ru/items.php?seek=' + 
                      panel.encodeURIComponent(item) + '"><img src="http://images.ganjawars.ru/img/items/' + item_id + '_s.jpg" /></a>';
                  }
                });

                if(missed_items) {
                //http://images.ganjawars.ru/img/items/warlordboots_s.jpg
                  panel.showFlash('<p>Внимание! В комплекте не найдены:</p><center>' + missed_items + '</center>');
                  if(panel.panel_ajaxify) {
                    $('.panel-flash a').click(function() {
                      panel.gotoHref(this.href);
                      $('.panel-flash').remove();
                      return false;
                    });
                  }
                }
              }
            }
          });
        }
      }, true);
    }, true);
  },

  items_shop_seek: function() {
    var seek = location.search.split('seek=')[1];
    if(seek) {
      $('html,body').animate({
        scrollTop: $('img[src$="' + seek + '_b.jpg"]').parent().offset().top - 40
      }, 1000);
    }
  }

});
})(window.__panel, jQuery);