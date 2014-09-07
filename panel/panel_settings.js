(function(panel) {
  /// приватные переменные
  var editor;
  /// приватные функции
  function panel_settings_form(element, settings) {

  }

  jQuery.extend(panel, {
    panel_settings_editor: function() {
    panel.loadCSS(['../../lib/gw.css',
                   '../../lib/jquery.mobile.icons.min.css', 
                   '../../lib/jquery.mobile.custom.structure.min.css',
                   'panel_settings.css']);
    jQuery(document).bind("mobileinit", function () {
      jQuery.mobile.ajaxEnabled = false;
    });

    /// подгружаем АБСОЛЮТНО все скрипты
    var scripts = ['lib/jquery.mobile.custom.min.js'];
    for(var key in panel_apply.scripts) {
      if(scripts.indexOf(panel_apply.scripts[key]) == -1) {
        scripts.push(panel_apply.scripts[key]);
      }
    }
    for(var key in panel_apply.buttons) {
      var button = panel_apply.buttons[key];
      if(button.file && 
        scripts.indexOf(button.module + '/' + button.file) == -1) {
        scripts.push(button.module + '/' +button.file);
      }
      if(button.config_files && 
          jQuery.type(button.config_files) == 'array') {
        for(var i = 0; i < button.config_files.length; i++) {
          if(scripts.indexOf(button.config_files[i]) == -1) {
            scripts.push(button.config_files[i]);
          }
        }
      }
    }
    for(var key in panel_apply.widgets) {
      var widget = panel_apply.widgets[key];
      if(widget.file && 
        scripts.indexOf(widget.module + '/' + widget.file) == -1) {
        scripts.push(widget.module + '/' + widget.file);
      }
      if(widget.config_files && 
          jQuery.type(widget.config_files) == 'array') {
        for(var i = 0; i < widget.config_files.length; i++) {
          if(scripts.indexOf(widget.config_files[i]) == -1) {
            scripts.push(widget.config_files[i]);
          }
        }
      }
    }
    panel.loadScript(scripts, function() {
      /// Редактирование настроек

      /// скрываем активные окна
      jQuery('.pane:visible').hide();
      jQuery('.pane-bubble.active').removeClass('active');

      if(jQuery('#panel-settings-editor').length) {
        jQuery('#panel-settings-editor').show();
        return;
      }

      var options = panel.getOptions();
      var apply = panel_apply;

      editor = jQuery('<div id="panel-settings-editor" class="ui-page-theme-a ui-popup ui-overlay-shadow ui-corner-all" data-role="tabs">\
  <div data-grid="c" data-role="navbar" class="first-view">\
    <ul class="ui-grid-c">\
      <li><a href="#edit-buttons-wrapper" data-ajax="false" data-icon="grid">Кнопки</a></li>\
      <li><a href="#edit-widgets-wrapper" data-ajax="false" data-icon="bars">Виджеты</a></li>\
      <li><a href="#edit-modules-wrapper" data-ajax="false" data-icon="gear">Модули</a></li>\
      <li><a href="#edit-other-wrapper" data-ajax="false" data-icon="edit">Другое</a></li>\
    </ul>\
  </div>\
  <div id="edit-buttons-wrapper" style="display: none;" class="edit-wrapper">\
  </div>\
  <div id="edit-widgets-wrapper" style="display: none;" class="edit-wrapper">\
  </div>\
  <div id="edit-modules-wrapper" style="display: none;" class="edit-wrapper">\
  </div> \
  <div id="edit-other-wrapper" style="display: none;" class="edit-wrapper">\
  <h2>Опции:</h2>\
  </div> \
  <a class="close-settings ui-btn ui-btn-icon-right ui-icon-delete ui-btn-inline" onclick="jQuery(\'#panel-settings-editor\').fadeOut(); return false;">Закрыть</a>\
</div>')
        .appendTo(document.body);

      for(var key in panel_apply.buttons) {
        var button = panel_apply.buttons[key];
        var img = button.img;
        if(img && img.indexOf('http:') != 0) {
          img = __panel.path_to_theme() + img;
        }
        var id = 'button_' + key;
        jQuery('<div class="button-wrapper"></div>').append(
          jQuery('<div class="button ' + key + '" id="' + id + '"></div>').append(
            jQuery('<a><div class="img">' + 
              (img? '<img src="' + img + '"/>': 
                '<span class="icon"></span>') +
              '</div><h3>' + button.title + '</h3></a>')
              .click(function(e) {
                return false;
              })
          )
        ).append(
          jQuery('<div class="description">' + (button.description? button.description: '') + '</div>')
        ).appendTo('#edit-buttons-wrapper').trigger('create');
      }

      for(var key in panel_apply.widgets) {
        var widget = panel_apply.widgets[key];
        var id = 'widget_' + key;

        var widget_wrapper = jQuery('<div class="widget-wrapper"><h2>' + 
                              widget.title + '</h2></div>')
                              .appendTo('#edit-widgets-wrapper');
        var __widget = jQuery('<div class="widget '+ key + '" id="' + id + '"></div>')
          .css({
            width: options.system.btnwidth * widget.width,
            height: options.system.btnheight * widget.height
          }).appendTo(widget_wrapper);
        
        var __arguments = [__widget];
        if(jQuery.type(widget.arguments) == 'array') {
          for(var i = 0; i < widget.arguments.length; i++) {
            __arguments.push(widget.arguments[i]);
          }
        }
        var default_data = {};
        if(jQuery.type(widget.config_params) == 'array') {
          console.log(widget);
          for(var i = 0; i < widget.config_params.length; i++) {
            switch(widget.config_types[i]) {
              case 'checkboxes':
              case 'select':
                default_data[widget.config_params[i]] = widget.config_defaults[i];
/*                if(jQuery.type(widget.config_values[i]) == 'string' &&
                 widget.config_values[i].indexOf('__panel.') == 0) {
                  var select_options = eval(widget.config_values[i]);
                  if(jQuery.type(select_options) == "object") {
                    for(var key in select_options) break;
                    default_data[widget.config_params[i]] = key;
                  } else if(jQuery.type(select_options) == "array") {
                    default_data[widget.config_params[i]] = select_options[0];
                  }
                } else if(jQuery.type(widget.config_values[i]) == 'object') {
                  for(var key in widget.config_values[i]) break;
                  default_data[widget.config_params[i]] = key;
                } else if(jQuery.type(widget.config_values[i]) == 'array') {
                  default_data[widget.config_params[i]] = widget.config_values[i][0];
                } else {
                  default_data[widget.config_params[i]] = '';
                }
                if(widget.config_types[i] == 'checkboxes') {
                  default_data[widget.config_params[i]] = [default_data[widget.config_params[i]]];
                }*/
              break;
              case 'checkbox':
                default_data[widget.config_params[i]] = widget.config_defaults[i];
              break;
              default: 
                default_data[widget.config_params[i]] = '';
              break;
            }
          }
        }
        console.log(key, default_data);
        __arguments.push(default_data);
        panel[widget['callback']].apply(panel, __arguments);
      }

      /// Модули
      var modules_ul = jQuery('<ul data-role="collapsibleset" data-filter="true" data-filter-placeholder="Поиск настроек"></ul>');
      for(var module_name in panel_apply.modules) {
        if(module_name == 'panel') continue;
        var module = panel_apply.modules[module_name];
        
        var configurable_funcs = [];
        var configurable_desc = [];

        for(var func_name in panel_apply.scripts) {
          if(panel_apply.scripts[func_name].indexOf(module_name + '/') == 0) {
            if(panel[func_name] && panel[func_name].description) {
              configurable_funcs.push(func_name);
              configurable_desc.push(panel[func_name].description);
            }
          }
        }
        if(configurable_funcs.length) {
          var li = jQuery('<li><h2>' + 
          module.title + '</h2>' + 
            (module.description? '<div class="description">' + module.description: '')
          + '</li>');

          var li_settings = jQuery('<ul data-role="listview"></ul>').appendTo(li);
          li.attr('data-role', 'collapsible');
          for(var i = 0; i < configurable_funcs.length; i++) {
            li_settings.append('<li><label><input type="checkbox">' + 
              configurable_desc[i] + '</label>' + '</li>');
          }
          li.appendTo(modules_ul);
        }

      }
      modules_ul.appendTo('#edit-modules-wrapper').trigger('create');

      editor.trigger('create')
        .find('.ui-navbar a.ui-btn').click(function() {
          jQuery('.ui-navbar.first-view').removeClass('first-view');
          jQuery('.edit-wrapper').hide();
          jQuery('#' + this.href.split('#')[1]).show();
          return true;
        });
    });
    }
  });
})(__panel, jQuery);