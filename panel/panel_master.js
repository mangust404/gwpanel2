(function(panel, $) {

  var selected_variant = 'default';
  var selected_options = {};
  var item_index = 0;
  var $next_button;
  var selected = {
    arguments: {
    }
  };

  function panel_master_form1($content) {
    var form1 = {
      collection: {
        type: 'radios',
        options: {},
        title: 'Выберите шаблон настроек, который вам наиболее подходит:'
      }
    };
    $.each(window.panelSettingsCollection, function(id) {
      if(this.title) {
        form1.collection.options[id] = this.title;
      }
    });

    selected_options = window.panelSettingsCollection.default;
    panel.set(panel.getEnv() + '_opts_var_' + panel.currentPlayerID(), 'default');

    panel.panel_configure_form(form1, {
      arguments: {
        collection: 'default'
      }
    }, $content, function(name, value) {
      if(name == 'collection') {
        selected_variant = value;
        selected_options = window.panelSettingsCollection[value];
        panel.set(panel.getEnv() + '_opts_var_' + panel.currentPlayerID(), selected_variant);
      }
    });
  }

  function panel_master_form2($content) {
    $content.parent().find('center').remove();
    $content.parent().find('h2').html('Шаг ' + (item_index + 1) + ' из ' + (Object.keys(selected_options.master).length + 1));
    var next_item = selected_options.master[Object.keys(selected_options.master)[item_index]];
    var form = {};
    form[Object.keys(selected_options.master)[item_index]] = next_item;
    panel.panel_configure_form(form, selected, $content, function(name, __value) {
      selected.arguments[name] = __value;
      $.each(selected_options.master[name].__targets, function(i, target) {
        var value = __value;
        if($.type(target) == 'object') {
          if(target.translate) {
            try {
              eval('value=' + target.translate);
            } catch(e) {
              panel.dispatchException(e);
            }
          }
          target = target.set;
        }
        try {
          eval('selected_options.' + target + '=value');
        } catch(e) {
          panel.dispatchException(e);
        }
      });
      $next_button.removeClass('ui-disabled');
    });
    $content.trigger('create');
    
    var $center = $('<center>').css({
      position: 'absolute',
      bottom: 5,
      width: '95%'
    }).appendTo($content.parent());
    if(item_index > 0) {
      $('<a class="ui-btn ui-btn-inline ui-btn-icon-left ui-icon-carat-l">Назад</a>').click(function() {
        item_index--;
        $content.html('');
        panel_master_form2($content);
        $center.remove();
      }).appendTo($center);
    }
    if(item_index < Object.keys(selected_options.master).length - 1) {
      $next_button = $('<a class="ui-btn ui-btn-inline ui-btn-icon-right ui-icon-carat-r ui-disabled">Далее</a>').click(function() {
        item_index++;
        $content.html('');
        $center.remove();
        panel_master_form2($content);
      }).appendTo($center);

      if($.type(selected.arguments[Object.keys(selected_options.master)[item_index]]) != 'undefined') {
        $next_button.removeClass('ui-disabled');
      }
    } else {
      $('<a class="ui-btn ui-btn-inline ui-btn-icon-right ui-icon-carat-r">Далее</a>').click(function() {
        $content.parent().hide();
        panel_master_form3($('#panel-settings-editor .step3 .content').parent().show().end());
          //panel.showFlash('Настройки успешно созданы. Нажмите F5 чтобы увидеть изменения.');
      }).appendTo($center);
    }
    //console.log(selected_variant, selected_options);
  }

  function panel_master_form3($content) {
    $content.parent().find('center').remove();
    $content.html('');
    $('<label>Укажите для каких комплектов создавать кнопки:</label>').appendTo($content);

    var use_sets = {
      arguments: {
        sets: []
      }
    };
    var sets_data;

    panel.loadScript('items/items_data.js', function() {
      panel.items_get_sets_async(function(sets) {
        sets_data = sets;
        /// делаем все комплекты выбранными по-дефолту
        use_sets.arguments.sets = Object.keys(sets);
        panel.panel_configure_form({
          sets: {
            'type': 'checkboxes',
            'title': 'Укажите для каких комплектов создавать кнопки:',
            options: sets
          }
        }, use_sets, $content, function(set_id, checked) {
          use_sets.arguments.sets = checked;
        });
        $content.trigger('create');
      });
    });

    $('<div class="description">учтите что для определения содержимого комплектов скрипт попытается их надеть, и в конце всех операций будет снята вся аммуниция.</div>').appendTo($content);

    var $center = $('<center>').css({
      position: 'absolute',
      bottom: 5,
      width: '95%'
    }).appendTo($content.parent());

    $('<a class="ui-btn ui-btn-inline ui-btn-icon-left ui-icon-carat-l">Назад</a>').click(function() {
      $content.parent().hide();
      panel_master_form2($('#panel-settings-editor .step2 .content').empty().parent().show().end());
    }).appendTo($center);

    $next_button = $('<a class="ui-btn ui-btn-inline ui-btn-icon-right ui-icon-carat-r">Далее</a>').click(function() {
      panel.loadScript(['items/items.js', 'panel/panel_settings.js'], function() {
        try {
          if(use_sets.arguments.sets.length > 0) {
            var data;
            /// сперва находим первое попавшееся окно с кнопками
            var first_pane_with_buttons = null;
            for(var i = 0; i < selected_options.panes.length; i++) {
              if($.type(selected_options.panes[i]) != 'object') continue;
              if($.type(selected_options.panes[i].buttons) != 'array') continue;
              if(selected_options.panes[i].buttons.length > 0) {
                first_pane_with_buttons = i;
                break;
              }
            }
            if(first_pane_with_buttons === null) first_pane_with_buttons = 0;

            /// Расширяем окно на 2 пункта
            selected_options.panes[first_pane_with_buttons].width += 2;

            var left = selected_options.panes[first_pane_with_buttons].width - 2;
            var top = 0;

            panel.setOptions(selected_options);

            $.each(use_sets.arguments.sets, function(i, set_id) {
              data = $.ajax('http://www.ganjawars.ru/home.do.php?putset=' + set_id, {
                async: false
              });
              var $data = $(data.responseText);
              var set = panel.get_set_str($data);
              panel.set('items_set_' + set_id, set);

              /// определяем иконку, это либо оружие, либо первый предмет, либо дефолтная
              var image = $data.find('table:first').find('tr:contains(Правая рука) img[src*="/items/"]').attr('src') ||
                          $data.find('table:first').find('tr:contains(В руках) img[src*="/items/"]').attr('src') ||
                          $data.find('table:first').find('img[src*="/items/"]:first').attr('src') ||
                          'http://images.ganjawars.ru/img/forum/f30.gif';
              /// Добавляем кнопку
              var button = panel.addButton(first_pane_with_buttons, 
                'items_putset_button', 
                $.extend(panel_apply.buttons.items_putset_button, {
                  title: sets_data[set_id],
                  arguments: {set_id: set_id},
                  img: image
                }
              ));

              button.left = left;
              button.top = top;

              left++;
              /// заполняем по очереди две колонки
              if(left >= selected_options.panes[first_pane_with_buttons].width) {
                left = selected_options.panes[first_pane_with_buttons].width - 2;
                top++;
              }
            });
            if(data && $(data.responseText).find('a[href*="dress_off"]').length) {
              $.ajax($(data.responseText).find('a[href*="dress_off"]').attr('href'), {
                async: false
              });
            }
          }
        } catch(e) {}

        $content.parent().hide();
        panel_master_finish($('#panel-settings-editor .finish .content').parent().show().end());
      });
    }).appendTo($center);

  }

  function panel_master_finish($content) {
    $content.parent().children('center').remove();

    var $center = $('<center>').css({
      position: 'absolute',
      bottom: 5
    }).appendTo($content.parent());

    $('<a class="ui-btn ui-btn-inline ui-btn-icon-left ui-icon-carat-l">Назад</a>').click(function() {
      $content.parent().hide();
      panel_master_form3($('#panel-settings-editor .step3 .content').empty().parent().show().end());
    }).appendTo($center);

    $('.finish-button').click(function() {
      delete selected_options['master'];
      panel.setOptions(selected_options, false, function() {
        $('#panel-settings-editor').fadeOut(function() {
          location.href = location.href;
        });
      });
    });
  }


jQuery.extend(panel, {
  /**
  * Мастер настроек. Вызывается когда настроек нет.
  **/
  panel_master: function() {
    panel.loadScript('panel/panel_settings.js', function() {
      panel.panel_settings_init(function() {
        var $master = $('<div id="panel-settings-editor" class="ui-page-theme-a ui-popup ui-overlay-shadow ui-corner-all">\
  <div class="container step1">\
    <h2 style="margin: 5px 0 10px 0;">Добро пожаловать в мастер настроек GWPanel 2!</h2>\
    <label>Для начала работы вам необходимо создать ваши первые настройки.</label><br /><br />\
    <div class="content edit-wrapper"></div>\
  </div>\
  <div class="container step2" style="display: none;">\
    <h2 style="margin: 20px 0;">Основные настройки</h2>\
    <div class="content edit-wrapper"></div>\
  </div>\
  <div class="container step3" style="display: none;">\
    <h2 style="margin: 20px 0;">Комплекты</h2>\
    <div class="content edit-wrapper"></div>\
  </div>\
  <div class="container finish" style="display: none;">\
    <h2 style="margin: 20px 0;">Поздравляем, всё готово!</h2>\
    <div class="content edit-wrapper">Настройки успешно созданы. Нажмите на кнопку ниже чтобы сохранить их и перезагрузить страницу.\
    <center><a class="finish-button ui-btn ui-btn-inline ui-btn-icon-right ui-icon-check">Сохранить настройки и закрыть мастер</a></center></div>\
  </div>\
</div>');
        var $content = $master.find('.step1 .content');

        panel_master_form1($content);
        $content.append($('<center>').append($('<a class="ui-btn ui-btn-inline ui-btn-icon-right ui-icon-carat-r">Далее</a>').click(function() {
          $master.find('.step1').hide();
          $master.find('.step2').show();
          panel_master_form2($master.find('.step2 .content'));
        })));

        
        $master.appendTo(document.body).trigger('create');
      });
    });
  }

});
})(__panel, jQuery);