(function(panel, $) {
jQuery.extend(panel, {

  items_sets: function() {
    var $set_id = $('select[name="set_id"]');
    var $form = $set_id.closest('form');
    var $set_name = $form.find('input[name="set_name"]');
    var current_icon;
    $set_name.focus(function() {
      if($(this).val() == '') {
        $(this).val($(this).attr('placeholder'));
      }
    });

    var pane_id;
    var first_pane_with_buttons;
    var button_id;

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
        if($.type(first_pane_with_buttons) == 'undefined' && 
           current_options.panes[i].buttons.length > 0) {
          first_pane_with_buttons = i;
        }
        for(var b = 0; b < current_options.panes[i].buttons.length; b++) {
          if(current_options.panes[i].buttons[b].type == 'items_putset_button'
             && current_options.panes[i].buttons[b].arguments.set_id == set_id) {
            pane_id = 0;
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
      if(is_edit && images.indexOf(panel.iconURL(current_options.panes[pane_id].buttons[button_id].img)) == -1) {
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
      if($set_name.val() == '' && $set_name.attr('placeholder') != '(нет комплекта)') {
        $set_name.val($set_name.attr('placeholder'));
      }
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
      return false;
    });
  }
});
})(window.__panel, jQuery);