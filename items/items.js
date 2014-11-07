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
    var dressed = panel.get_set_str();
    for(var i = 1; i <= parseInt($set_id.find('option:last').val()); i++) {
      panel.get('items_set_' + i, function(set) {
        if(dressed == set) {
          $set_id.val(i).change();
          i = 999;
        }
      }, true);
    }
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

    /// При изменении селектбокса с комплектами
    $set_id.change(function() {
      $set_name.attr('placeholder', 
        $(this).find('option[value=' + $(this).val() + ']').text().substr(3)
      ).val('');
      var set_id = $(this).val();

      var current_options = panel.getOptions();
      /// ищем есть ли кнопка с этим комплектом в панели
      is_edit = false;

      for(var i = 0; i < current_options.panes.length; i++) {
        if($.type(current_options.panes[i]) != 'object') continue;
        if($.type(current_options.panes[i].buttons) != 'array') continue;
        if(first_pane_with_buttons === null && 
           current_options.panes[i].buttons.length > 0) {
          first_pane_with_buttons = i;
        }
        for(var b = 0; b < current_options.panes[i].buttons.length; b++) {
          if(current_options.panes[i].buttons[b].type == 'items_putset_button'
             && current_options.panes[i].buttons[b].arguments.set_id == set_id) {
            pane_id = i;
            button_id = b;
            is_edit = true;
            break;
          }
        }
      }
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
    }).change().closest('form');

    $form.find('input[type=submit]').click(function() {
      if($set_name.val() == '') {
        $set_name.val($set_name.attr('placeholder'));
      }
      /// Запоминаем сет в ЛС
      panel.set('items_set_' + $set_id.val(), 
        panel.get_set_str(),
        function() {
        panel.set('items_current_set', $set_id.val());

        var current_options = panel.getOptions();
        panel.loadScript('panel/panel_settings.js', function() {
          if($('#edit-button:checked').length) {
            current_options.panes[pane_id].buttons[button_id].img = current_icon;
            current_options.panes[pane_id].buttons[button_id].title = $set_name.val();
            panel.setOptions(current_options);
            $('.pane').remove();
            panel.showFlash('Кнопка изменена');
          } else if($('#add-button:checked').length) {
            panel.addButton(first_pane_with_buttons, 
              'items_putset_button', 
              $.extend(panel_apply.buttons.items_putset_button, {
                title: $set_name.val(),
                arguments: {set_id: $set_id.val()},
                img: current_icon
              }
            ));
            panel.setOptions(current_options);
            panel.showFlash('Кнопка добавлена');
          }
          $form.submit();
        });
      }, true);
      return false;
    });
  
    /// если страница была вызвана через putset=N, то запоминаем комплект
    panel.get('dress_on_set', function(set_id) {
      if(set_id) {
        panel.del('dress_on_set', function() {
          panel.set('items_set_' + set_id, panel.get_set_str());
        });
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

  items_set_check: function() {
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
                    item = item.split('=')[1];
                    var ar = item.split('&');
                    var item_id = ar[0];
                    missed_items += '<a href="http://www.ganjawars.ru/item.php?item_id=' + 
                      item + '"><img src="http://images.ganjawars.ru/img/items/' + item_id + '_s.jpg" /></a>';
                  }
                });

                //http://images.ganjawars.ru/img/items/warlordboots_s.jpg
                panel.showFlash('<p>Внимание! В комплекте, который сейчас надет, не найдены:</p><center>' + missed_items + '</center>');
              }
            }
          });
        }
      }, true);
    }, true);
  }

});
})(window.__panel, jQuery);