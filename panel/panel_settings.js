(function(panel) {
  /// приватные переменные
  var editor;
  /// приватные функции
  /**
  * Функция вывода дополнительных настроек
  */
  function panel_configure_form(params, widget, append_to, change_callback) {
    jQuery.each(params || [], function(param) {
      if(widget.arguments && widget.arguments[param]) {
        var current_value = widget.arguments[param];
      } else {
        var current_value = this.default;
      }

      /// Если в значении было выражение, то преобразуем его
      if(jQuery.type(this.options) == 'string' && this.options.indexOf('__panel.') == 0) {
        this.options = eval(this.options);
      }

      switch(this.type) {
        case 'checkboxes':
          var ul = jQuery('<div data-role="collapsible">' + 
                  '<h4>' + this.title + '</h4>' + 
                  '<ul data-role="listview"></ul></div>').appendTo(append_to).find('ul');
          var is_array = jQuery.type(this.options) == 'array';
          jQuery.each(this.options, function(key) {
            if(is_array) {
              var value = this;
            } else {
              var value = key;
            }
            var li = jQuery('<li></li>').appendTo(ul);
            jQuery('<label for="param-' + value + '-' + param + '">' + 
              this + '</label>').appendTo(li);
            jQuery('<input name="' + param + '" id="param-' + value + '-' + param + '"' +
                (current_value.indexOf(this) == -1? '': ' checked="checked"') +
                ' type="checkbox" data-mini="true" value="' + value + '">')
                .appendTo(li)
                .change(function() {
                  var checked_list = [];
                  jQuery('input[name=' + param + ']').each(function() {
                    if(this.checked) {
                      checked_list.push(this.value);
                    }
                  })
                  change_callback(param, checked_list);
                });
          });
        break;
        case 'select':
          var s = jQuery('<select name="' + param + '"></select>');
          var is_array = jQuery.type(this.options) == 'array';
          s.append('<option value=""' + 
                '>Укажите ' + this.title + '</option>');
          jQuery.each(this.options, function(key) {
            if(is_array) {
              s.append('<option value="' + this + '"' + 
                (this == current_value? ' selected="selected"': '') + 
                '>' + this + '</option>');
            } else {
              s.append('<option value="' + key + '"' + 
                (key == current_value? ' selected="selected"': '') + 
                '>' + this + '</option>');
            }
          });
          s.appendTo(append_to).change(function() {
            change_callback(param, jQuery(this).val());
          });
        break;
        case 'checkbox':
          jQuery('<label for="param-' + param + '">' + this.title + '</label>').appendTo(append_to);
          jQuery('<input name="' + param + '" id="param-' + param + '"' +
            (current_value? ' checked="checked"': '') +
            ' type="checkbox">')
            .appendTo(append_to)
            .change(function() {
              change_callback(param, this.checked);
            });
        break;
        case 'text':
          jQuery('<input name="' + param + '" id="param-' + param + '"' +
            ' type="text" value="' + 
              (current_value == this.default? '': current_value) + '"' + 
              ' placeholder="' + (this.title == undefined? '': this.title + ' ') + 
              this.default + '">')
            .appendTo(append_to)
            .change(function() {
              change_callback(param, this.value);
            });
        break;
        default: 
          //default_data[widget.config_params[i]] = '';
        break;
      }
    });
  }
  /**
  * Функция вывода формы настроек виджета или кнопки
  */
  function panel_settings_form (widget, kind, type) {
    var current_options = panel.getOptions();

    var __data = {};
    $('#settings-form-popup').html('')
      .append('<h2>Добавить ' + (kind == 'widget'? 'виджет': 'кнопку') + 
        ' "' + widget.title + '</h2>');

    if(widget.configure || kind == 'button') {
      var setting_content = jQuery('<div class="ui-corner-all custom-corners">\
  <div class="ui-bar ui-bar-a">\
    <h3>Настройки</h3>\
  </div>\
  <div class="ui-body ui-body-a">\
    <fieldset data-role="controlgroup">\
    </fieldset>\
  </div>\
</div>').appendTo('#settings-form-popup').trigger('create').find('fieldset');
      var widget_data = {};

      /// Для кнопок добавляем возможность редактировать текст
      if(kind == 'button') {
        jQuery('<input maxlength="32" name="title" id="param-title"' +
          ' type="text" value="' + (type.title == undefined? '': type.title) + 
            '" placeholder="текст кнопки">')
          .appendTo(setting_content)
          .change(function() {
            __data.title = this.value;
          });
      }

      /// проходим по всем опциям и собираем дефолтные значения
      jQuery.each(widget.configure || [], function(param) {
        widget_data[param] = this.default;
      });

      console.log(widget.configure);
      panel_configure_form(widget.configure, widget, setting_content, function(name, value) {
        widget_data[name] = value;
        console.log(widget_data);
      });
      setting_content.trigger('create');
    }

    var displace_div = jQuery('<div class="ui-corner-all custom-corners">\
  <div class="ui-bar ui-bar-a">\
    <h3>Куда размещать</h3>\
  </div>\
  <div class="ui-body ui-body-a">\
    <fieldset data-role="controlgroup" data-type="horizontal">\
    </fieldset>\
  </div>\
</div>').appendTo('#settings-form-popup').find('fieldset');

    function draw_pane(num) {
      var is_valid = true;
      var reason = '';

      if(!widget.width || current_options.panes[num].width >= widget.width) {
        var places = panel.checkPanePlaces(num, widget);
        if(!places) {
          is_valid = false;
          reason = 'в окне ' + (num + 1) + ' нет свободного места';
        }
      } else {
        is_valid = false;
        reason = 'окно ' + (num + 1) + ' слишком узкое для этого элемента';
      }
      displace_div.append('<div class="radio-wrapper"' + (reason? ' title="' + reason + '"': '') + 
        '><label for="select-pane-' + num + '" ' + '>Окно ' + (num +  1) + '</label>' + 
        '<input name="displace" type="radio" id="select-pane-' + num + '" value="' + 
        num + '" ' + (is_valid? '': ' disabled="disabled"') + '></div>');

    }
    draw_pane(0); draw_pane(1);
    if(kind != 'button') {
      displace_div.append('<div class="radio-wrapper"><label for="select-pane-float">Плавающий</label>' + 
          '<input name="displace" type="radio" id="select-pane-float" value="float"></div>');
    }

    draw_pane(2); draw_pane(3);

    jQuery('#settings-form-popup')
      .append(
      jQuery('<div class="ui-grid-a"></div>').append(
        jQuery('<div class="ui-block-a"></div>').append(
          jQuery('<a href="#" class="ui-shadow ui-btn ui-corner-all">Отменить</a>').click(function() {
            jQuery('#settings-form-popup').popup('close');
            jQuery('.pane-bubble.drag-over').removeClass('drag-over');
            return false;
          })
        )
      ).append(
        jQuery('<div class="ui-block-b"></div>').append(
          jQuery('<a href="#" class="ui-shadow ui-btn ui-corner-all">Добавить</a>').click(function() {
            var displace;
            jQuery('input[name=displace]').each(function() {
              if(this.checked) {
                displace = this.value;
              }
            });
            if(!displace) {
              panel.showFlash('Пожалуйста, укажите место размещения', 'warning', 5000);
              return false;
            }

            __data.arguments = widget_data;
            __data.type = type;


            if(kind == 'widget') {
              if(displace == 'float') {
                __data.left = 200;
                __data.top = 100;

                var index = 0;
                for(var i = 0; i < current_options.widgets.length; i++) {
                  if(current_options.widgets[i].type == type) {
                    index++;
                  }
                }

              } else {
                displace = parseInt(displace);
                var places = panel.checkPanePlaces(displace, widget);
                __data.top = places[0];
                __data.left = places[1];
                var index = 0;
                for(var i = 0; i < current_options.panes[displace].widgets.length; i++) {
                  if(current_options.panes[displace].widgets[i].type == type) {
                    index++;
                  }
                }
              }
              __data.id = type + '_' + index;
              __data.height = widget.height;
              __data.width = widget.width;

              if(displace == 'float') {
                current_options.widgets.push(__data);
                panel.showFlash('Виджет добавлен. Обновите страницу чтобы его увидеть.', 'message', 5000);
              } else {
                current_options.panes[displace].widgets.push(__data);
                panel.showFlash('Виджет добавлен', 'message', 5000);
              }
            } else if(kind == 'button') {
              for(var i = 0; i < current_options.panes[displace].buttons.length; i++) {
                if(current_options.panes[displace].buttons[i].type == type) {
                  index++;
                }
              }
              displace = parseInt(displace);
              var places = panel.checkPanePlaces(displace, widget);
              __data.id = type + '_' + index;
              __data.top = places[0];
              __data.left = places[1];
              var index = 0;
              current_options.panes[displace].buttons.push(__data);
              panel.showFlash('Кнопка добавлена. Обновите страницу чтобы его увидеть.', 'message', 5000);
            }

            if(!isNaN(displace)) {
              if($('#pane-' + displace).length) {
                /// заставляем панель перерисовать окно
                $('#pane-' + displace).remove();
              }
            }

            panel.setOptions(current_options);

            $('#settings-form-popup').popup('close');
            jQuery('.pane-bubble.drag-over').removeClass('drag-over');
            return false;
          })
        )
      )
    ).trigger('create');

    jQuery('input[name=displace]').change(function() {
      jQuery('.pane-bubble.drag-over').removeClass('drag-over');
      if(this.checked) {
        var id = parseInt(this.id.split('-')[2]);
        if(!isNaN(id)) {
          jQuery('#pane-bubble-' + id).show().addClass('drag-over').css({'zIndex': 99});
        }
      }
    });
  }

  jQuery.extend(panel, {
    panel_settings_editor: function() {
    panel.loadCSS(['../../lib/gw.css',
                   '../../lib/jquery.mobile.icons.min.css', 
                   '../../lib/jquery.mobile.custom.structure.min.css',
                   //'../../lib/jquery.mobile.structure-1.4.3.min.css',
                   'panel_settings.css']);
    jQuery(document).bind("mobileinit", function () {
      jQuery.mobile.ajaxEnabled = false;
    });

    /// подгружаем АБСОЛЮТНО все скрипты
    var scripts = [
                    //'lib/jquery.mobile-1.4.3.min.js'
                    'lib/jquery.mobile.custom.min.js'
                  ];
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
    var current_options = panel.getOptions();
    panel.loadScript(scripts, function() {
      /// Редактирование настроек

      /// скрываем активные окна
      jQuery('.pane:visible').hide();
      jQuery('.pane-bubble.active').removeClass('active');

      if(jQuery('#panel-settings-editor').length) {
        jQuery('#panel-settings-editor').show();
        return;
      }

      var apply = panel_apply;

      editor = jQuery('<div id="panel-settings-editor" class="ui-page-theme-a ui-popup ui-overlay-shadow ui-corner-all" data-role="tabs">\
  <div data-grid="c" data-role="navbar" class="first-view">\
    <ul class="ui-grid-c">\
      <li><a href="#edit-buttons-wrapper" data-ajax="false" data-icon="grid"><span>Кнопки</span></a></li>\
      <li><a href="#edit-widgets-wrapper" data-ajax="false" data-icon="bars"><span>Виджеты</span></a></li>\
      <li><a href="#edit-modules-wrapper" data-ajax="false" data-icon="gear"><span>Модули</span></a></li>\
      <li><a href="#edit-other-wrapper" data-ajax="false" data-icon="edit"><span>Другое</span></a></li>\
    </ul>\
  </div>\
  <div id="edit-buttons-wrapper" style="display: none;" class="edit-wrapper">\
    <h3 class="footer">Кликните на кнопку из коллекции чтобы посмотреть опции и добавить в одно из окон</h3>\
  </div>\
  <div id="edit-widgets-wrapper" style="display: none;" class="edit-wrapper">\
    <h3 class="footer">Для добавления виджета, кликните на кнопку "Добавить" под виджетом</h3>\
  </div>\
  <div id="edit-modules-wrapper" style="display: none;" class="edit-wrapper">\
    <h3 class="footer">Вы можете отключить ненужные для вас функции, убрав галочку с соответствующей опции</h3>\
  </div> \
  <div id="edit-other-wrapper" style="display: none;" class="edit-wrapper">\
  <h2>Опции:</h2>\
  </div> \
  <hr class="footer-delim" />\
  <a class="close-settings ui-btn ui-btn-icon-right ui-icon-delete ui-btn-inline" onclick="jQuery(\'#panel-settings-editor\').fadeOut(); return false;">Закрыть</a>\
  <div id="settings-form-popup" data-role="popup" data-position-to="window">\
  test</div>\
</div>')
        .appendTo(document.body);

      jQuery.each(panel_apply.buttons, function(button_name) {
        var button = this;
        var img = button.img;
        if(img && img.indexOf('http:') != 0) {
          img = __panel.path_to_theme() + img;
        }
        var id = 'button_' + button_name;
        jQuery('<div class="button-wrapper"></div>').append(
          jQuery('<div class="button ' + button_name + '" id="' + id + '"></div>').append(
            jQuery('<a><div class="img">' + 
              (img? '<img src="' + img + '"/>': 
                '<span class="icon"></span>') +
              '</div><h3>' + button.title + '</h3></a>')
              .click(function(e) {
                panel_settings_form(button, 'button', button_name);
                $('#settings-form-popup').popup('open');
                return false;
              })
          )
        ).append(
          jQuery('<div class="description">' + (button.description? button.description: '') + '</div>')
        ).appendTo('#edit-buttons-wrapper').trigger('create');
      });

      jQuery.each(panel_apply.widgets, function(widget_name) {
        var widget = this;
        var id = 'widget_' + widget_name;
        var __widget;

        var widget_wrapper = jQuery('<div class="widget-wrapper"><h2>' + 
          widget.title + '</h2></div>')
           .append(
           __widget = jQuery('<div class="widget '+ widget_name + '" id="' + id + '"></div>')
             .css({
              width: current_options.system.btnwidth * widget.width,
              height: current_options.system.btnheight * widget.height
            })
          )
          .append(
            jQuery('<p></p>').append(
              jQuery('<a data-rel="popup" data-transition="pop" href="#settings-form-popup" id="add-widget-' + widget_name + '" \
                class="ui-btn ui-btn-inline ui-btn-icon-right ui-icon-plus">Добавить</a>')
              .click(function() {
                panel_settings_form(widget, 'widget', widget_name);
                return true;
              })
            )
          )
          .appendTo('#edit-widgets-wrapper').trigger('create');

        var __arguments = [];
        if(jQuery.type(widget.arguments) == 'array') {
          for(var i = 0; i < widget.arguments.length; i++) {
            __arguments.push(widget.arguments[i]);
          }
        }
        var default_data = {};
        jQuery.each(widget.configure || {}, function(param){
          default_data[param] = this.default;
        });

        __arguments.push(default_data);
        panel[widget['callback']].apply(__widget, __arguments);
      });

      /// Модули
      var modules_ul = jQuery('<ul data-role="collapsibleset" data-filter="true" data-filter-placeholder="Поиск настроек"></ul>');
      jQuery.each(panel_apply.modules, function(module_name) {
        if(module_name == 'panel') return;
        var module = this;
        
        var configurable_funcs = [];
        var configurable_desc = [];

        for(var func_name in panel_apply.settings) {
          if(panel_apply.settings[func_name].module == module_name) {
            if(panel_apply.settings[func_name].description) {
              configurable_funcs.push(func_name);
              configurable_desc.push(panel_apply.settings[func_name].description);
            }
          }
        }
        if(configurable_funcs.length) {
          var li = jQuery('<li><h2>' + 
          module.title + '</h2>' + 
            (module.description? '<div class="description">' + module.description: '')
          + '</li>');

          var settings_ul = jQuery('<ul data-role="listview"></ul>').appendTo(li);
          li.attr('data-role', 'collapsible');
          jQuery.each(configurable_funcs, function(i, func_name) {
            var current_options = panel.getOptions();
            var is_blacklisted = current_options.blacklist && current_options.blacklist.indexOf(func_name) > -1;
            var checkbox_li = jQuery('<li><label><input name="' + func_name + '" type="checkbox"' + 
              (is_blacklisted? '': 
                ' checked="checked"') + '>' + configurable_desc[i] + '</label>' + '</li>')
              .appendTo(settings_ul).find('input').change(function() {
              if(this.checked) {
                /// удаляем из чёрного списка
                var index = current_options.blacklist.indexOf(this.name);
                if(index > -1) {
                  current_options.blacklist.splice(index, 1);
                  panel.setOptions(current_options);
                }
                jQuery(this).parents('li').find('.add-settings').removeClass('ui-disabled');
              } else {
                ///добавляем в чёрный список, эта функция нигде подключаться не будет
                current_options.blacklist = current_options.blacklist || [];
                if(current_options.blacklist.indexOf(this.name) == -1)
                  current_options.blacklist.push(this.name);
                panel.setOptions(current_options);
                jQuery(this).parents('li').find('.add-settings').addClass('ui-disabled');
              }
            }).end();
            if(panel_apply.settings[func_name].configure) {
              /// Дополнительные настройки
              var add_fieldset = jQuery('<div class="' + 
                (is_blacklisted? 'ui-disabled': '') + 
                ' add-settings ui-corner-all custom-corners ui-mini">\
  <div class="ui-bar ui-bar-a">\
    <h3>Дополнительные настройки</h3>\
  </div>\
  <div class="ui-body ui-body-a">\
    <fieldset data-role="controlgroup">\
    </fieldset>\
  </div>\
</div>').appendTo(checkbox_li).find('fieldset');

              var current_options = panel.getOptions();
              var __settings = {};
              if(current_options.settings && 
                 current_options.settings[module_name] && 
                 current_options.settings[module_name][func_name]) {
                __settings = current_options.settings[module_name][func_name];
              }
              panel_configure_form(panel_apply.settings[func_name].configure, 
                {arguments: __settings}, add_fieldset, function(param, value) {
                  var current_options = panel.getOptions();
                  if(!current_options.settings) current_options.settings = {};
                  if(!current_options.settings[module_name]) 
                    current_options.settings[module_name] = {};
                  if(!current_options.settings[module_name][func_name]) 
                    current_options.settings[module_name][func_name] = {};
                  current_options.settings[module_name][func_name][param] = value;
                  panel.setOptions(current_options);
                });
            }
          });
          li.appendTo(modules_ul);
        }
      });

      modules_ul.appendTo('#edit-modules-wrapper').trigger('create');

      editor.trigger('create')
        .find('.ui-navbar a.ui-btn').click(function() {
          jQuery('.ui-navbar.first-view').removeClass('first-view');
          jQuery('.ui-btn-active').removeClass('ui-btn-active');
          jQuery(this).addClass('ui-btn-active');
          jQuery('.edit-wrapper').hide();
          jQuery('#' + this.href.split('#')[1]).show();
          return false;
        });
    });
    }
  });
})(__panel, jQuery);