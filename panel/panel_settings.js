(function(panel, $) {
  /// приватные переменные
  var editor;
  var listener;
  /// приватные функции
  /**
  * Функция вывода дополнительных настроек
  * @param params - хеш настраиваемых опций
  * @param widget - класс виджета, для которого осуществлятся настройка
  * @param append_to - jQuery-объект, куда надо добавить виджет
  * @change_callback - функция, которая будет вызываться при изменении какой-либо из настроек
  *   формат функции: function(param, value) {
  *     param - название опции
  *     value - новое значение опции
  *   }
  }
  */
  function panel_configure_form(params, widget, append_to, change_callback) {
    $.each(params || [], function(param) {
      if(widget.arguments && widget.arguments[param] != undefined) {
        var current_value = widget.arguments[param];
      } else {
        var current_value = this.default;
      }

      var that = this;

      var drawFunc = function() {
        switch(that.type) {
          case 'checkboxes':
            var ul = $('<div data-role="collapsible">' + 
                    '<h4>' + that.title + '</h4>' + 
                    '<ul data-role="listview"></ul></div>').appendTo(append_to).find('ul');
            var is_array = $.type(that.options) == 'array';
            $.each(that.options, function(key, value) {
              if(!is_array) {
                var value = key;
              }
              var li = $('<li></li>').appendTo(ul);
              $('<label for="param-' + widget.id + '-' + value + '-' + param + '">' + 
                this + '</label>').appendTo(li);
              $('<input name="' + widget.id + '_' + param + 
                '" id="param-' + widget.id + '-' + value + '-' + param + '"' +
                  (current_value.indexOf(value) == -1? '': ' checked="checked"') +
                  ' type="checkbox" data-mini="true" value="' + value + '">')
                  .appendTo(li)
                  .change(function() {
                    var checked_list = [];
                    $('input[name=' + widget.id + '_' + param + ']').each(function() {
                      if(this.checked) {
                        checked_list.push(this.value);
                      }
                    })
                    change_callback(param, checked_list);
                  });
            });
          break;
          case 'select':
            var __id = 'param-' + widget.id + '-' + param;
            var s = $('<select id="' + __id + '" name="' + widget.id + '_' + param + '"></select>');
            var is_array = $.type(that.options) == 'array';
            s.append('<option value=""' + 
                  '>Укажите</option>');
            $.each(that.options || {}, function(key) {
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
              change_callback(param, $(this).val());
            });
            s.before('<label for="' + __id + '">' + that.title + '</label>');
          break;
          case 'checkbox':
            $('<label for="param-' + widget.id + '-' + param + '">' + that.title + '</label>').appendTo(append_to);
            $('<input name="' + widget.id + '_' + param + 
              '" id="param-' + widget.id + '-' + param + '"' +
              (current_value? ' checked="checked"': '') +
              ' type="checkbox">')
              .appendTo(append_to)
              .change(function() {
                change_callback(param, this.checked);
              });
          break;
          case 'text':
            var __id = 'param-' + widget.id + '-' + param;
            $('<label for="' + __id + '">' + that.title + 
              '</label><input name="' + widget.id + '_' + param + 
              '" id="' + __id + '" type="text" value="' + 
                current_value + '"' + 
                ' placeholder="' + that.default + '">')
              .appendTo(append_to)
              .change(function() {
                change_callback(param, this.value);
              });
          break;
          default: 
            //default_data[widget.config_params[i]] = '';
          break;
        }
      }
      /// Если в значении было выражение, то преобразуем его
      if($.type(that.options) == 'string' && that.options.indexOf('__panel.') == 0) {
        if(that.options.indexOf('_async') == -1) {
          this.options = eval(that.options);
          drawFunc();
        } else {
          /// Асинхронная подгрузка опций
          eval(that.options.replace('()', '(') + ' function(o) { that.options = o; drawFunc(); append_to.trigger(\'create\'); } )');
        }
      } else {
        drawFunc();
      }

    });
  }

  $.extend(panel, {
    /**
    * Инициализация настроек
    * @param callback - функция, вызываемая после загрузки всех скриптов
    */
    panel_settings_init: function(callback) {
      /// Убиваем лайвинтернет, иначе он поганит всю страницу, да и все скрипты с document.write
      $.each(document.scripts, function(i, script) {
        if(!script.src && script.innerHTML.indexOf('document.write') != -1) {
          $(script).remove();
        }
        if(script.src.indexOf('prototype') != -1) {
          $(script).remove();
        }
      });

      panel.loadCSS(['../../lib/jquery_mobile_gw.css',
                     '../../lib/jquery.mobile.icons.min.css', 
                     '../../lib/jquery.mobile.custom.structure.min.css',
                     //'../../lib/jquery.mobile.structure-1.4.3.min.css',
                     'panel_settings.css']);
      $(document).bind("mobileinit", function () {
        $.mobile.ajaxEnabled = false;
      });

      /// подгружаем АБСОЛЮТНО все скрипты
      var scripts = [];
      if(!$.mobile) {
        scripts.push('lib/jquery.mobile.custom.min.js');
      }
      if(!$.fn.resizable) {
        scripts.push('lib/jquery-ui-1.9.2.custom.min.js');
      }
      
      for(var key in panel_apply.settings) {
        var file = panel_apply.settings[key].module + '/' + panel_apply.settings[key].file;
        if(scripts.indexOf(file) == -1) {
          scripts.push(file);
        }
        if(panel_apply.settings[key].configure) {
          for(var config_key in panel_apply.settings[key].configure) {
            if(panel_apply.settings[key].configure[config_key].file) {
              var file = panel_apply.settings[key].module + '/' + 
                panel_apply.settings[key].configure[config_key].file;
              if(scripts.indexOf(file) == -1) {
                scripts.push(file);
              }
            }
          }
        }
      }
      for(var key in panel_apply.buttons) {
        var button = panel_apply.buttons[key];
        if(button.file && 
          scripts.indexOf(button.module + '/' + button.file) == -1) {
          scripts.push(button.module + '/' +button.file);
        }
        if(button.config_files && 
            $.type(button.config_files) == 'array') {
          for(var i = 0; i < button.config_files.length; i++) {
            if(scripts.indexOf(button.config_files[i]) == -1) {
              scripts.push(button.config_files[i]);
            }
          }
        }
        $.each(button.configure || {}, function(i) {
          if(this.file && scripts.indexOf(button.module + '/' + this.file) == -1) {
            scripts.push(button.module + '/' + this.file);
          }
        });
      }
      for(var key in panel_apply.widgets) {
        var widget = panel_apply.widgets[key];
        if(widget.file && 
          scripts.indexOf(widget.module + '/' + widget.file) == -1) {
          scripts.push(widget.module + '/' + widget.file);
        }
        if(widget.config_files && 
            $.type(widget.config_files) == 'array') {
          for(var i = 0; i < widget.config_files.length; i++) {
            if(scripts.indexOf(widget.config_files[i]) == -1) {
              scripts.push(widget.config_files[i]);
            }
          }
        }
        $.each(widget.configure || {}, function(i) {
          if(this.file && scripts.indexOf(widget.module + '/' + this.file) == -1) {
            scripts.push(widget.module + '/' + this.file);
          }
        });
      }
      panel.loadScript(scripts, callback);
    },

    /**
    * Функция, открывающая окно настроек
    */
    panel_settings_editor: function(active_section) {
    var current_options = panel.getOptions();
    panel.panel_settings_init(function() {
      if(document.domain.indexOf('gwpanel.org') == -1) {
        /// Мы должны отключить Илюшины стили, иначе они конфликтуют с jQuery mobile-овскими
        $.each(document.styleSheets, function(i, stylesheet) {
          if(!stylesheet) return;
          if((!stylesheet.href && !$(stylesheet.ownerNode).attr('gwpanel')) 
              || (stylesheet.href && stylesheet.href.indexOf('/i/gw.css') != -1)) {
            stylesheet.disabled = true;
          }
        });
      }
      /// Редактирование настроек
      $(document.body).addClass('panel-settings');
      /// скрываем активные окна
      $('.pane:visible').hide();
      $('.pane-bubble.active').removeClass('active');

      /// Добавляем ползунки уменьшения/увеличения окон
      listener = panel.bind('pane_show', function(paneID) {
        $pane = $('#pane-' + paneID)
        /// определяем минимальные границы окна
        var minLeft = 1;
        var minTop = 1;
        $.each(current_options.panes[paneID].buttons, function() {
          if(minLeft < this.left + 1) minLeft = this.left + 1;
          if(minTop < this.top + 1) minTop = this.top + 1;
        });
        $.each(current_options.panes[paneID].widgets, function() {
          if(minLeft < this.left + this.width) minLeft = this.left + this.width;
          if(minTop < this.top + this.height) minTop = this.top + this.height;
        });

        $pane.resizable({
          grid: [current_options.system.btnwidth, current_options.system.btnheight],
          handles: ($pane.hasClass('top')? 's': 'n') + ($pane.hasClass('left')? 'e': 'w'),
          minWidth: minLeft * current_options.system.btnwidth,
          minHeight: minTop * current_options.system.btnheight,
          stop: function(event, ui) {
            var current_options = panel.getOptions();
            current_options.panes[paneID].width = 
              parseInt(parseInt($pane.css('width')) / current_options.system.btnwidth) || 6;
            current_options.panes[paneID].height = 
              parseInt(parseInt($pane.css('height')) / current_options.system.btnheight) || 4;
            panel.setOptions(current_options);
          }
        });
        if(!$pane.find('.configure').length) {
          $pane.addClass('configuring')
            .find('.button, .widget').addClass('configuring').append(
            $('<div class="configure"></div>').click(function() {
              var parent = $(this).closest('.button, .widget');
              if(parent.hasClass('button')) {
                var type = 'button';
              } else {
                var type = 'widget';
              }
              var data = current_options.panes[paneID][type + 's'][parent.attr('index')];
              var _class = panel_apply[type + 's'][data.type];
              data.paneID = paneID;
              panel.panel_settings_form(_class, type, data, true);
              $('#settings-form-popup').popup('open');

              return false;
            })
          );
        }
      });

      if($('#panel-settings-editor').length) {
        $.mobile.loading("hide");
        $('#panel-settings-editor').show();
        return;
      }

      var apply = panel_apply;

      editor = $('<div id="panel-settings-editor" class="ui-page-theme-a ui-popup ui-overlay-shadow ui-corner-all" data-role="tabs">\
  <div class="container">\
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
      <h3 class="footer">Отключите галочку с пункта и он перестанет работать</h3>\
    </div> \
    <div id="edit-other-wrapper" style="display: none;" class="edit-wrapper">\
      <div class="versions"></div>\
      <div class="options-variants"></div>\
    </div> \
    <hr class="footer-delim" />\
    <div class="close-button-wrapper"></div>\
    <div id="settings-form-popup" data-role="popup" data-position-to="window" class="ui-page-theme-a"></div>\
  </div>\
</div>\
<div id="icons-gallery" class="ui-overlay-shadow ui-popup ui-page-theme-a">\
<h2>Галерея иконок \
</h2><div class="container"></div>\
<a onclick="$(\'#icons-gallery\').hide(); return false;" class="ui-btn ui-mini ui-btn-inline ui-btn-icon-right ui-icon-delete">Закрыть</a>\
</div>')
        .appendTo(document.body);

      $('<a class="close-settings ui-btn ui-btn-icon-right ui-icon-delete ui-btn-inline">Закрыть</a>')
        .click(function() {
          $(document.body).removeClass('panel-settings');
          $('.configuring').removeClass('configuring');
          $('.configure').removeClass('configure');
          panel.unbind('pane_show', listener);
          /// возвращаем стили на место
          $.each(document.styleSheets, function(i, stylesheet) {
            if(stylesheet.disabled) stylesheet.disabled = false;
          });

          $('#panel-settings-editor').fadeOut(function() {
            $('#panel-settings-editor, #settings-form-popup').remove();
          });
          return false;
        }).appendTo(editor.find('.close-button-wrapper'));
      /// готовим галерею иконок
      var added = [];
      $.each(panel_apply.themes[current_options.system.theme].icons, function(index, item) {
        var img = item;
        if(img.indexOf('http:') != 0) {
          img = __panel.path_to_theme() + 'icons/' + img;
        }
        added.push(img);
        $('<div class="icon-select"></div>').append(
          $('<img src="' + img + '"></img>').click(function() {
            $('#param-img').val(item);
            $('#settings-form-popup div.img img').attr('src', img);
            $('#icons-gallery').hide();
            return false;
          })
        ).appendTo('#icons-gallery .container');
      });
      /// Добавляем годные иконки со страницы
      $('img').filter(function() {
        if(added.indexOf($(this).attr('src')) > -1) return false;
        if(this.height > 20 && this.height < 100 && 
           this.width > 20 && this.width < 100) {
          added.push($(this).attr('src'));
          return true;
        }
        return false;
      }).each(function() {
        var src = $(this).attr('src');
        $('<div class="icon-select"></div>').append(
          $('<img src="' + src+ '"></img>').click(function() {
            $('#param-img').val(src);
            $('#settings-form-popup div.img img').attr('src', src);
            $('#icons-gallery').hide();
            return false;
          })
        ).appendTo('#icons-gallery .container');
      });
      $.each(panel_apply.buttons, function(button_name) {
        var button = this;
        var img = button.img;
        if(img && img.indexOf('http:') != 0) {
          img = __panel.path_to_theme() + 'icons/' + img;
        }
        var id = 'button_' + button_name;
        button.id = id;
        $('<div class="button-wrapper"></div>').append(
          $('<div class="button ' + button_name + '" id="' + id + '"></div>').append(
            $('<a><div class="img">' + 
              (img? '<img src="' + img + '"/>': 
                '<span class="icon"></span>') +
              '</div><h3>' + button.title + '</h3></a>')
              .click(function(e) {
                panel.panel_settings_form(button, 'button', {type: button_name});
                $('#settings-form-popup').popup('open');
                return false;
              })
          )
        ).append(
          $('<div class="description">' + (button.description? button.description: '') + '</div>')
        ).appendTo('#edit-buttons-wrapper').trigger('create');
      });

      $.each(panel_apply.widgets, function(widget_name) {
        var widget = this;
        var id = 'widget_' + widget_name;
        var __widget;

        var widget_wrapper = $('<div class="widget-wrapper"><h2>' + 
          widget.title + '</h2></div>')
           .append(
           __widget = $('<div class="widget '+ widget_name + '" id="' + id + '"></div>')
             .css({
              width: current_options.system.btnwidth * widget.width,
              height: current_options.system.btnheight * widget.height
            })
          )
          .append(
            $('<p></p>').append(
              $('<a data-rel="popup" data-transition="pop" href="#settings-form-popup" id="add-widget-' + widget_name + '" \
                class="ui-btn ui-btn-inline ui-btn-icon-right ui-icon-plus">Добавить</a>')
              .click(function() {
                panel.panel_settings_form(widget, 'widget', {type: widget_name});
                return true;
              })
            )
          )
          .appendTo('#edit-widgets-wrapper').trigger('create');

        var __arguments = [];
        if($.type(widget.arguments) == 'array') {
          for(var i = 0; i < widget.arguments.length; i++) {
            __arguments.push(widget.arguments[i]);
          }
        }
        var default_data = {};
        $.each(widget.configure || {}, function(param){
          default_data[param] = this.default;
        });

        __arguments.push(default_data);
        panel[widget['callback']].apply(__widget, __arguments);
      });

      /// Модули
      var modules_ul = $('<ul data-role="collapsibleset" data-filter="true" data-filter-placeholder="Поиск настроек"></ul>');
      $.each(panel_apply.modules, function(module_name) {
        //if(module_name == 'panel') return;
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
          var li = $('<li><h2>' + 
          module.title + '</h2>' + 
            (module.description? '<div class="description">' + module.description: '')
          + '</li>');

          var settings_ul = $('<ul data-role="listview"></ul>').appendTo(li);
          li.attr('data-role', 'collapsible');
          $.each(configurable_funcs, function(i, func_name) {
            var current_options = panel.getOptions();
            if(panel_apply.settings[func_name].default === false) 
              var is_blacklisted = !(current_options.whitelist && current_options.whitelist.indexOf(func_name) > -1);
            else
              var is_blacklisted = current_options.blacklist && current_options.blacklist.indexOf(func_name) > -1;

            var checkbox_li = $('<li><label><input name="' + func_name + '" type="checkbox"' + 
              (is_blacklisted? '': 
                ' checked="checked"') + '>' + configurable_desc[i] + '</label>' + '</li>')
              .appendTo(settings_ul).find('input').change(function() {
              if(this.checked) {
                if(panel_apply.settings[func_name].default === false) {
                  /// добавляем в белый список
                  current_options.whitelist = current_options.whitelist || [];
                  if(current_options.whitelist.indexOf(this.name) == -1)
                    current_options.whitelist.push(this.name);
                  panel.setOptions(current_options);
                } else {
                  /// удаляем из чёрного списка
                  var index = current_options.blacklist.indexOf(this.name);
                  if(index > -1) {
                    current_options.blacklist.splice(index, 1);
                    panel.setOptions(current_options);
                  }
                }
                $(this).closest('li').find('.add-settings').removeClass('ui-disabled');
              } else {
                if(panel_apply.settings[func_name].default === false) {
                  /// Удаляем из белого списка
                  var index = current_options.whitelist.indexOf(this.name);
                  if(index > -1) {
                    current_options.whitelist.splice(index, 1);
                    panel.setOptions(current_options);
                  }
                } else {
                  ///добавляем в чёрный список, эта функция нигде подключаться не будет
                  current_options.blacklist = current_options.blacklist || [];
                  if(current_options.blacklist.indexOf(this.name) == -1)
                    current_options.blacklist.push(this.name);
                }
                panel.setOptions(current_options);
                $(this).closest('li').find('.add-settings').addClass('ui-disabled');
              }
            }).end();
            if(panel_apply.settings[func_name].configure) {
              /// Дополнительные настройки
              var add_fieldset = $('<div data-role="collapsible" class="' + 
                (is_blacklisted? 'ui-disabled': '') + 
                ' add-settings ui-corner-all custom-corners ui-mini">\
  <h3>Дополнительные настройки</h3>\
  <div class="ui-body ui-body-a">\
  </div>\
</div>').appendTo(checkbox_li).find('div.ui-body');

              var current_options = panel.getOptions();
              var __settings = {};
              if(current_options.settings && 
                 current_options.settings[module_name] && 
                 current_options.settings[module_name][func_name]) {
                __settings = current_options.settings[module_name][func_name];
              }
              panel_configure_form(panel_apply.settings[func_name].configure, 
                {arguments: __settings, id: func_name}, add_fieldset, function(param, value) {
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
          $('.ui-navbar.first-view').removeClass('first-view');
          $('.ui-btn-active').removeClass('ui-btn-active');
          $(this).addClass('ui-btn-active');
          $('.edit-wrapper').hide();
          $('#' + this.href.split('#')[1]).show();
          return false;
        });

      panel.get('variants_' + panel.currentPlayerID(), function(variants) {

        variants = variants || {default: 'По-умолчанию'};
        $('<label for="variant-name">Сейчас используется вариант настроек:</label>').appendTo('#edit-other-wrapper .options-variants');
        var variant_select = $('<select id="variant-name" name="variant"></select>').change(function() {
          panel.set(panel.getEnv() + '_opts_var_' + panel.currentPlayerID(), $(this).val(), function() {
            panel.showFlash('Настройки изменены. Пожалуйста, перезагрузите страницу чтобы увидеть изменения.', 'message', 5000);
          });
        });

        panel.get(panel.getEnv() + '_opts_var_' + panel.currentPlayerID(), function(current_variant) {
          $.each(variants, function(name, title) {
            variant_select.append('<option value="' + name + '"' + 
              (current_variant == name? ' selected="selected"': '') + 
              '>' + title + '</option>');
          });
        });
        var n = $('<div class="add-options-variant ui-corner-all custom-corners" data-role="collapsible">\
  <h3>Добавить новый вариант</h3>\
  <div class="ui-body ui-body-a">\
  </div>');
        var fieldset = n.find('.ui-body');
        $('<label for="add-title">Название</label><input id="add-title" name="title" type="text" />').appendTo(fieldset);

        $('<label for="add-title">Копировать из коллекции</label>').appendTo(fieldset);
        var collection = $('<select id="add-collection" name="collection"></select').appendTo(fieldset);

        collection.append('<option value="">Пустые настройки, с нуля</option>');

        $.each(window.panelSettingsCollection, function(id, val) {
          collection.append('<option value="' + id + '">' + val.title + '</option>');
        });

        $('<div style="margin: 30px 0;" />').appendTo(fieldset);
        $('<input type="submit" value="Добавить">').click(function() {
          var name = $('#add-title').val();
          if(!name) {
            $('#add-title').focus();
            panel.showFlash('Пожалуйста, укажите имя', 'error', 5000);
            return false;
          }
          for(var key in variants) {
            if(variants[key] == name) {
              $('#add-title').focus();
              panel.showFlash('Настройки с таким именем уже существуют', 'error', 5000);
              return false;
            }
          }
          var id = $('#add-collection').val() || 'noname';
          var index = 0;
          for(var key in variants) {
            if(key.search(new RegExp(id + '[0-9]+')) > -1) {
              index = parseInt(key.substr(id.length)) + 1;
            }
          }
          id += String(index);
          variants[id] = name;

          variant_select.append('<option value="' + id + '">' + name + '</option>');
          panel.set('variants_' + panel.currentPlayerID(), variants);

          var new_options = {};
          if($('#add-collection').val() == '') {
            /// минимальный набор настроек, чтобы панель работала
            $.extend(new_options, {
              system: {theme: 'base', btnwidth:70, btnheight: 85},
              panes: [ {width: 6, height: 4, buttons: [{type: 'panel_settings', left: 0, top: 0}], widgets: []}, 
                       {width: 6, height: 4, buttons: [], widgets: []},
                       {width: 6, height: 4, buttons: [], widgets: []},
                       {width: 6, height: 4, buttons: [], widgets: []}
                     ],
              widgets: []
            });
          } else {
            $.extend(new_options, window.panelSettingsCollection[$('#add-collection').val()]);
          }
          panel.set(panel.getEnv() + '_' + panel.currentPlayerID() + '_' + id, new_options, function() {
            panel.showFlash('Новый набор настроек добавлен.', 'message', 5000);
          });

          $('#add-title').val('');
          $('.add-options-variant').collapsible('collapse');
          return false;
        }).appendTo(fieldset);
      
        if(Object.keys(variants).length > 1) {
          var d = $('</div><div class="remove-options-variant ui-corner-all custom-corners" data-role="collapsible">\
  <h3>Удалить настройки</h3>\
  <div class="ui-body ui-body-a">\
  </div>\
</div>');
          $.each(variants, function(id, name) {
            if(id == 'default') return;
            $('<label for="del-variant-' + id + '">' + name
              + '</label><input id="del-variant-' + id + '" type="checkbox" value="' + id + '">')
              .appendTo(d.find('.ui-body'));
          });
          $('<input type="submit" value="Удалить" />').click(function() {
            var names = $('.remove-options-variant input[type=checkbox]:checked')
              .prev('label').map(function() { return $(this).text()})
              .get().join(', ');
            if(location.search.indexOf('gwpanel_test') > -1 || confirm('Вы действительно хотите удалить выбранные настройки? (' + names + ')')) {
              $('.remove-options-variant input[type=checkbox]:checked').each(function() {
                var id = $(this).val();
                if($('#variant-name').val() == id) {
                  $('#variant-name').val('default').change();
                }
                variant_select.find('option[value=' + id + ']').remove();
                $(this).closest('.ui-checkbox').remove();
                delete variants[id];
                panel.del(panel.getEnv() + '_' + panel.currentPlayerID() + '_' + id);
              });
              panel.set('variants_' + panel.currentPlayerID(), variants);
            }
            return false;
          }).appendTo(d.find('.ui-body'));
        }
        $('#edit-other-wrapper .options-variants').append(variant_select).append(n).append(d).trigger('create');
      });

      $('<h2>Текущая версия: <span class="current-version">' + panel.getVersion() + '</span></h2>').append(
        $('<a class="ui-btn ui-btn-inline ui-mini ui-btn-icon-right ui-icon-refresh">проверить</a>').click(function() {
          var $that = $(this);
          panel.checkVersion(function(remote_version) {
            if(remote_version != panel.getVersion()) {
              $that.html('обновлено');
              panel.updateVersion(remote_version, function(notes, version) { 
                $('#edit-other-wrapper .versions .release-note:first').parent().prepend(
                  '<p class="release-note active release-note-' + version +
                  '">Выпуск #<span class="release-num">' + version + 
                  '</span>: <span class="notes">' + notes.notes + 
                  '</span><span class="date">' + notes.date + 
                  '</span></p>'
                );
              });
              $('.current-version').html(remote_version);
            } else {
              $that.html('у вас самая свежая версия').addClass('ui-btn-active ui-focus');
            }
            $that.removeClass('ui-icon-refresh').addClass('ui-icon-check');
          })
          return false;
        }).css({marginLeft: 30})
      ).appendTo('#edit-other-wrapper .versions');

      var releases = $('<div class="releases" data-role="collapsible"' + 
        (active_section == 'release_notes'? 'data-collapsed="false"': '') + 
        '><h3>Примечания к выпускам</h3></div>')
        .appendTo('#edit-other-wrapper .versions');
      panel.get('release_notes', function(release_notes) {
        release_notes = release_notes || {};
        var keys = Object.keys(release_notes);
        keys = $.map(keys, function(val) {
          return parseInt(val);
        }).sort(function(a, b) {
          if(a > b) return -1; 
          else if(a < b) return 1; 
          return 0
        });
        for(var i = 0; i < keys.length; i++) {
          if(typeof(release_notes[keys[i]]) == 'object') {
            $('<p class="release-note ' + 
              (active_section == 'release_notes' && keys[i] == panel.getVersion()? 'active ': '') + 
              'release-note-' + keys[i] +
              '">Выпуск #<span class="release-num">' + keys[i] + 
              '</span>: <span class="notes">' + release_notes[keys[i]].notes + 
              '</span><span class="date">' + release_notes[keys[i]].date + 
              '</span></p>').appendTo(releases);
            if(i > 10) return;
          }
        }
      });

      $('#edit-other-wrapper .versions').trigger('create');

      panel.get('variants_' + panel.currentPlayerID(), function(variants) {
        var data = {};

        $.each(variants, function(variant, name) {
          panel.get(panel.getEnv() + '_' + panel.currentPlayerID() + '_' + variant, function(opts) {
            if($.type(opts) == 'object') {
              data[variant] = {name: name, options: opts, version: panel.getVersion()};
            }
          });
        });
        var export_t = $('<textarea rows="5" cols="50"></textarea>').hide().focus(function() {
          $(this).select();
          return false;
        });
        var export_button = $('<a class="ui-btn ui-btn-icon-right ui-icon-arrow-d">Экспортировать настройки</a>').click(function() {
          $(this).hide();
          export_t.val(JSON.stringify(data));
          export_t.show().focus();
          export_t.after('<div class="description">Нажмите Ctrl + C чтобы скопировать</div>');
          return false;
        }).appendTo('.options-variants').trigger('create');
        $('<div class="ui-body">').append(export_t)
          .appendTo('.options-variants').trigger('create');

        var import_t = $('<textarea rows="5" cols="50"></textarea>').hide().focus(function() {
          $(this).select();
          return false;
        });

        var import_but = $('<a class="ui-btn">Импорт</a>').click(function() {
          var that = this;
          var __success = function() {
            import_t.hide();
            import_t.next().hide();
            $(that).hide();
            panel.showFlash('Настройки успешно сохранены. Пожалуйста, перезагрузите страницу чтобы увидеть изменения');
            export_t.hide();
            export_t.next().hide();
            export_button.hide();
          }
          var options_backup = $.extend({}, panel.getOptions());
          try {
            var new_data = JSON.parse(import_t.val());
            if($.type(new_data) != 'object') throw('Неправильная строка настроек');
            if(!new_data.default) throw('Строка настроек не содержит базовые настройки. Возможно она была повреждена');
            var processed = 0;

            var __import = function() {
              $.each(new_data, function(variant, data) {
                if($.type(data.options.panes) != 'array') throw('Строка настроек содержит неправильные данные');

                if($.type(window.panel_release_migration) == 'array' && 
                   window.panel_release_migration.length > 0) {
                  // Мы должны прогнать все миграции для этих настроек
                  // ставим эти опции в текущие, чтобы миграция над ними поработала
                  panel.setOptions(data.options);
                  for(var m = 0; m < window.panel_release_migration.length; m++) {
                    try {
                      window.panel_release_migration[m]();
                    } catch(e) {
                      /// что же делать в случае корявой миграции?
                      if(window.console) console.log('Bad migration: ' + e);
                    }
                  }
                  // 
                  data.options = panel.getOptions();
                }
                panel.set(panel.getEnv() + '_' + panel.currentPlayerID() + '_' + variant, data.options, function() {
                  processed++;
                  if(processed >= Object.keys(new_data).length) {
                    __success();
                  }
                });
              });
            }

            if(new_data.default.version < panel.getVersion()) {
              /// Получаем все миграции для предыдущих версий и только потом 
              /// мы сможем сделать импорт настроек
              $.mobile.loading('show', {
                textVisible: true, 
                html: '<p><span class="ui-icon-loading" style="opacity: 0.5"></span></p>\
<p style="text-align: center;"><nobr>Получаем обновления:</nobr> <span id="loading-progress">0</span> из ' + (panel.getVersion() - new_data.default.version)
              });
              var versions = [];

              for(var version_index = new_data.default.version + 1; version_index <= panel.getVersion(); version_index++) {
                versions.push(version_index); 
              }

              var loaded = 0;
              var prod_path = 'http://gwpanel.org/panel2/panel/production';

              $.each(versions, function(i, version_index) {
                str_version = String(version_index);
                var path = prod_path; 
                for(var i = 0; i < str_version.length; i++) {
                  path += "/" + str_version.charAt(i);
                }
                path += "/" + str_version + ".notes.js";
                var s = document.createElement('script');
                s.type = 'text/javascript';
                s.src = path;
                s.addEventListener('load', function() {
                  loaded++;
                  $('#loading-progress').html(loaded);

                  if(loaded >= versions.length) {
                    $.mobile.loading('hide');
                    /// все миграции загружены, выполняем импорт
                    __import();
                  }
                }, false);
                document.getElementsByTagName("head")[0].appendChild(s);
              });
            } else {
              /// версии совпадают, импортируем сразу
              __import();
            }

          } catch(e) {
            panel.setOptions(options_backup);
            panel.showFlash('Не удалось импортировать настройки. Ошибка: ' + e.toString());
          }
          return false;
        }).hide();

        $('<a class="ui-btn ui-btn-icon-right ui-icon-arrow-u">Импортировать настройки</a>').click(function() {
          $(this).hide();
          import_t.show().focus();
          import_t.after('<div class="description">Нажмите Ctrl + V чтобы вставить текст с настройками и нажмите на кнопку "Импорт"</div>');
          import_but.show();
          return false;
        }).appendTo('.options-variants').trigger('create');

        $('<div class="ui-body">').append(import_t).append(import_but).appendTo('.options-variants').trigger('create');

      });

      if(active_section == 'release_notes') {
        $('#edit-other-wrapper').show();
        $('#panel-settings-editor .ui-navbar.first-view').removeClass('first-view');
      }
      $.mobile.loading("hide");
    });
    },

    /**
    * Функция вывода формы настроек виджета или кнопки
    * @param widgetClass - хеш, класс виджета из panel_apply.widgets
    * @param widgetKind - строка, тип виджета. Возможные значения: button, widget, float
    * @param widgetData - данные виджета
    * @param isEdit - флаг, если = true, то это редактирование
    */
    panel_settings_form: function(widgetClass, widgetKind, widgetData, isEdit) {
      $.mobile.loading("hide");

      var current_options = panel.getOptions();
      var self_init = false;
      widgetData.arguments = widgetData.arguments || {};
      var $widget = this;

      var __data = widgetData || {};
      if(!$('#settings-form-popup').length) {
        $('<div id="settings-form-popup" data-role="popup" data-position-to="window"></div>')
          .appendTo('.ui-page:visible').trigger('create').popup();
        self_init = true;
      } else if($('#settings-form-popup').parent().parent().hasClass('ui-page')) {
        self_init = true;
      }
      $('#settings-form-popup').html('')
        .append('<h2>' + (isEdit? '': 'Добавить ' + 
                           (widgetKind == 'widget' || widgetKind == 'float'? 
                            'виджет': 
                            'кнопку') 
                          ) + ' ' + widgetClass.title + '</h2>');
      if(isEdit) {
        $('#settings-form-popup h2')
          .append($('<a title="Удалить" class="ui-btn ui-mini ui-btn-icon-notext ui-icon-delete ui-icon-center ui-btn-inline">Удалить</a>')
            .css({marginLeft: 10})
            .click(function() {
              if(confirm('Вы действительно хотите удалить ' + 
                (widgetKind == 'button'? 'эту кнопку': 'этот виджет') + '?')) {
                var current_options = panel.getOptions();
                if(widgetKind == 'float') {
                  current_options.widgets.splice(widgetData.index, 1);
                  $('#float-' + widgetData.index + '-' + widgetData.type).remove();
                } else {
                  current_options.panes[widgetData.paneID][widgetKind + 's'].splice(widgetData.index, 1);
                  $('#' + widgetData.id).remove();
                }
                panel.showFlash('Виджет удалён');
                panel.setOptions(current_options);
                $('#settings-form-popup').popup('close');
                $('#settings-form-popup').remove();
              }
            })
          );
      }
      if(widgetClass.configure || widgetKind == 'button') {
        var setting_content = $('<div class="ui-corner-all custom-corners">\
    <div class="ui-bar ui-bar-a">\
      <h3>Настройки</h3>\
    </div>\
    <div class="ui-body ui-body-a">\
      <fieldset data-role="controlgroup">\
      </fieldset>\
    </div>\
  </div>').appendTo('#settings-form-popup').trigger('create').find('fieldset');
        var widget_data = __data.arguments || {};

        /// Для кнопок добавляем возможность редактировать текст и иконку
        if(widgetKind == 'button') {
          $('<input type="hidden" id="param-img" name="img" />')
            .appendTo(setting_content);
          var img = (__data.img || widgetClass.img || 'no-icon');
          if(img.indexOf('http:') != 0) {
            img = __panel.path_to_theme() + 'icons/' + img;
          }
          $('<div class="img"><img src="' + img + '"/></div>').click(function() {
            $('#icons-gallery').show();
          }).insertBefore('#settings-form-popup h2');
          $('<label for="param-title">Текст кнопки</label><input maxlength="32" name="title" id="param-title"' +
            ' type="text" value="' + (__data.title == undefined? '': __data.title) + 
              '" placeholder="' + widgetClass.title + '">')
            .appendTo(setting_content);
        }

        /// проходим по всем опциям и собираем дефолтные значения
        $.each(widgetClass.configure || [], function(param) {
          widget_data[param] = widgetData.arguments[param] == undefined? this.default:
                               widgetData.arguments[param];
        });
        widgetData.id = widgetData.type;
        panel_configure_form(widgetClass.configure, widgetData, setting_content, function(name, value) {
          widget_data[name] = value;
        });
        setting_content.trigger('create');
      }

      if(widgetKind != 'float' && !isEdit) {
        var displace_div = $('<div class="ui-corner-all custom-corners">\
    <div class="ui-bar ui-bar-a">\
      <h3>Куда размещать</h3>\
    </div>\
    <div class="ui-body ui-body-a">\
      <fieldset class="panes-displace" data-role="controlgroup" data-type="horizontal">\
      </fieldset>\
    </div>\
  </div>').appendTo('#settings-form-popup').find('fieldset');
        var footer_displace_div = $('<fieldset class="footer-displace" data-role="controlgroup" data-type="horizontal">\
</fieldset>\'').appendTo(displace_div.parent());
      }

      function draw_pane(num, footer) {
        var is_valid = true;
        var reason = '';

        if(!widgetClass.width || current_options.panes[num].width >= widgetClass.width) {
          var places = panel.checkPanePlaces(num, widgetClass);
          if(!places) {
            is_valid = false;
            reason = 'в окне ' + (num + 1) + ' нет свободного места';
          }
        } else {
          is_valid = false;
          reason = 'окно ' + (num + 1) + ' слишком узкое для этого элемента';
        }
        var elem = displace_div;
        if(footer) elem = footer_displace_div;
        elem.append('<div id="radio-wrapper-' + (num + 1) + '" class="top-panes-wrapper radio-wrapper"' + (reason? ' title="' + reason + '"': '') + 
          '><label for="select-pane-' + num + '" ' + '>Окно ' + (num +  1) + '</label>' + 
          '<input name="displace" type="radio" id="select-pane-' + num + '" value="' + 
          num + '" ' + (is_valid? '': ' disabled="disabled"') + '></div>');

      }

      if(widgetKind != 'float' && !isEdit) {
        draw_pane(0); draw_pane(1);
        if(widgetKind != 'button') {
          displace_div.append('<div id="radio-wrapper-float" class="radio-wrapper"><label for="select-pane-float">Плавающий</label>' + 
              '<input name="displace" type="radio" id="select-pane-float" value="float" checked="checked"></div>');
        }

        draw_pane(2); draw_pane(3);
        draw_pane(4, true); draw_pane(5, true); draw_pane(6, true);
      }

      if(widgetKind == 'float') {
        /// Настройки, специфичные только для плавающих виджетов
        var $visibility = $('<div data-role="collapsible">\
<h3>Настройки видимости</h3>\
<div class="ui-body"></div>\
</div>').appendTo('#settings-form-popup').find('.ui-body');

        $visibility.append('<label for="fixed">Зафиксирован</label>')
        .append($('<input type="checkbox" id="fixed"' + 
            (widgetData.fixed? ' checked="checked"': '') + ' />').change(function() {
          if(this.checked) {
            widgetData.fixed = true;
            $widget.addClass('fixed');
          } else {
            delete widgetData.fixed;
            $widget.removeClass('fixed');
          }
        }))
        .append('<label for="no-opacity">Непрозрачный</label>')
        .append($('<input type="checkbox" id="no-opacity"' + 
            (widgetData.no_opacity? ' checked="checked"': '') + ' />').change(function() {
          if(this.checked) {
            widgetData.no_opacity = true;
            $widget.addClass('no-opacity');
          } else {
            delete widgetData.no_opacity;
            $widget.removeClass('no-opacity');
          }
        }));

        if(isEdit) {
          $visibility.append('<label for="blacklist-page">Не показывать на страницах этого типа</label>')
          .append($('<input type="checkbox" id="blacklist-page"' + 
            ($.type(widgetData.blacklist) == 'array' 
              && widgetData.blacklist.indexOf(location.pathname) > -1? 
              ' checked="checked"': '') + '>').change(function() {
            if(this.checked) {
              if($.type(widgetData.blacklist) == 'array') {
                if(widget.blacklist.indexOf(location.pathname) == -1) {
                  widgetData.blacklist.push(location.pathname);
                }
              } else {
                widgetData.blacklist = [location.pathname];
              }
              $('#only-page, #only-page-class').removeAttr('checked').checkboxradio('refresh');
              delete widgetData.only_page;
              delete widgetData.only_page_class;
            } else {
              var ind = widgetData.blacklist.indexOf(location.pathname);
              if(ind > -1) widgetData.blacklist.splice(i, 1);
              if(widgetData.blacklist.length == 0) delete widgetData.blacklist;
            }
          }))
          .append('<label for="only-page">Показывать только на этой странице</label>')
          .append($('<input type="checkbox" id="only-page"' + 
            (widgetData.only_page? ' checked="checked"': '') + '>').change(function() {
            if(this.checked) {
              widgetData.only_page = location.pathname + location.search;
              $('#only-page-class, #blacklist-page').removeAttr('checked').checkboxradio('refresh');
              delete widgetData.blacklist;
              delete widgetData.only_page_class;
            } else {
              delete widgetData.only_page;
            }
          }));
          if(location.search.length > 0) {
            $visibility.append('<label for="only-page-class">Показывать на всех страницах этого типа</label>')
            .append($('<input type="checkbox" id="only-page-class"' + 
              (widgetData.only_page_class? ' checked="checked"': '') + '>').change(function() {
              if(this.checked) {
                widgetData.only_page_class = location.pathname;
                $('#only-page, #blacklist-page').removeAttr('checked').checkboxradio('refresh');
                delete widgetData.blacklist;
                delete widgetData.only_page;
              } else {
                delete widgetData.only_page_class;
              }
            }));
          }
        }
      }

      $('#settings-form-popup')
        .append(
        $('<div class="ui-grid-a"></div>').append(
          $('<div class="ui-block-a"></div>').append(
            $('<a href="#" class="ui-shadow ui-btn ui-corner-all">Отменить</a>').click(function() {
              $('#settings-form-popup').popup('close');
              if(self_init) {
                $('#settings-form-popup').remove();
              }
              $('.pane-bubble.drag-over').removeClass('drag-over');
              return false;
            })
          )
        ).append(
          $('<div class="ui-block-b"></div>').append(
            $('<a href="#" class="widget-save ui-shadow ui-btn ui-corner-all">' + 
              (isEdit? 'Сохранить': 'Добавить') + '</a>').click(function() {
              var displace;
              if(widgetKind == 'float') {
                displace = 'float';
              } else if(isEdit) {
                displace = widgetData.paneID;
              } else {
                $('input[name=displace]').each(function() {
                  if(this.checked) {
                    displace = this.value;
                  }
                });
                if(!displace) {
                  panel.showFlash('Пожалуйста, укажите место размещения', 'warning', 5000);
                  return false;
                }
              }
              __data.arguments = widget_data;
              __data.type = widgetData.type;


              var index = 0;
              if(widgetKind == 'widget' || widgetKind == 'float') {
                if(displace == 'float') {
                  __data.left = isNaN(__data.left)? 200: __data.left;
                  __data.top = isNaN(__data.top)? 100: __data.top;

                  for(var i = 0; i < current_options.widgets.length; i++) {
                    if(current_options.widgets[i].type == widgetData.type) {
                      index++;
                    }
                  }

                } else {
                  displace = parseInt(displace);
                  if(isNaN(__data.top) || isNaN(__data.left)) {
                    var places = panel.checkPanePlaces(displace, widgetData);
                    __data.top = places[0];
                    __data.left = places[1];
                  }
                  for(var i = 0; i < current_options.panes[displace].widgets.length; i++) {
                    if(current_options.panes[displace].widgets[i].type == widgetData.type) {
                      index++;
                    }
                  }
                }
                if(!isEdit) {
                  __data.id = widgetData.type + '_' + index;
                }
                __data.height = widgetClass.height;
                __data.width = widgetClass.width;

                if(displace == 'float') {
                  if(isNaN(__data.index)) {
                    current_options.widgets.push(__data);
                  } else {
                    current_options.widgets[__data.index] = __data;
                  }
                  panel.showFlash('Виджет ' + (isEdit? 'сохранён': 'добавлен') + 
                    '.', 'message', 5000);
                  panel.redrawFloatWidgets();
                } else {
                  if(isEdit) {
                    current_options.panes[displace].widgets[__data.index] = __data;
                  } else {
                    current_options.panes[displace].widgets.push(__data);
                  }
                  panel.showFlash('Виджет ' + (isEdit? 'сохранён': 'добавлен') + 
                    '.', 'message', 5000);
                  $('#pane-bubble-' + displace).show();
                }
              } else if(widgetKind == 'button') {
                __data.title = $('#param-title').val();
                __data.img = $('#param-img').val() || widgetClass.img;
                displace = parseInt(displace);
                if(isEdit) {
                  /// Меняем заголовок кнопки сразу
                  $('#pane-' + displace + ' #' + __data.id + ' a h3').html(
                    __data.title || widgetClass.title
                  );
                  $('#pane-' + displace + ' #' + __data.id + ' .img img').attr('src',
                     $('#settings-form-popup div.img img').attr('src')
                  );
                } else {
                  /// Создаём идентификатор
                  for(var i = 0; i < current_options.panes[displace].buttons.length; i++) {
                    if(current_options.panes[displace].buttons[i].type == widgetData.type) {
                      index++;
                    }
                  }
                  __data.id = widgetData.type + '_' + index;
                }
                if(isNaN(__data.top) || isNaN(__data.left)) {
                  var places = panel.checkPanePlaces(displace, widgetData);
                  __data.top = places[0];
                  __data.left = places[1];
                }
                var index = 0;
                if(isEdit) {
                  current_options.panes[displace].buttons[__data.index] = __data;
                } else {
                  current_options.panes[displace].buttons.push(__data);
                }
                panel.showFlash('Кнопка ' + (isEdit? 'изменена': 'добавлена') + 
                  '.', 'message', 5000);
              }

              if(!isNaN(displace) && widgetKind != 'float' && !isEdit) {
                if($('#pane-' + displace).length) {
                  /// заставляем панель перерисовать окно
                  $('#pane-' + displace).remove();
                }
              }

              panel.setOptions(current_options);

              if($('#settings-form-popup').length && $('#settings-form-popup').popup) {
                $('#settings-form-popup').popup('close');
              }
              $('.pane-bubble.drag-over').removeClass('drag-over');

              if(self_init) {
                setTimeout(function() {
                  $('#settings-form-popup').remove();
                }, 100);
              }
              return false;
            })
          )
        )
      ).trigger('create');

      $('input[name=displace]').change(function() {
        $('.pane-bubble.drag-over').removeClass('drag-over');
        if(this.checked) {
          var id = parseInt(this.id.split('-')[2]);
          if(!isNaN(id)) {
            $('#pane-bubble-' + id).show().addClass('drag-over').css({'zIndex': 9999});
          }
        }
      });

      if(self_init) {
        $('#settings-form-popup').popup('open');
      }
    }

  });
})(__panel, jQuery);
