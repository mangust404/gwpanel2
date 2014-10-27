(function(panel, $) {

  var selected_variant = 'default';
  var selected_options = {};
  var item_index = 0;
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
    $content.parent().find('h2').html('Шаг ' + (item_index + 1) + ' из ' + Object.keys(selected_options.master).length);
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
      $('<a class="ui-btn ui-btn-inline ui-btn-icon-right ui-icon-carat-r">Далее</a>').click(function() {
        item_index++;
        $content.html('');
        $center.remove();
        panel_master_form2($content);
      }).appendTo($center);
    } else {
      $('<a class="ui-btn ui-btn-inline ui-btn-icon-right ui-icon-carat-r">Сохранить</a>').click(function() {
        delete selected_options['master'];
        panel.setOptions(selected_options, false, function() {
          $('#panel-settings-editor').fadeOut();      
          panel.showFlash('Настройки успешно созданы. Нажмите F5 чтобы увидеть изменения.');
        });
      }).appendTo($center);
    }
    //console.log(selected_variant, selected_options);
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