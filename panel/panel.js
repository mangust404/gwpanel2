var Panel2 = new function() {
  /**
  * Защищённые аттрибуты
  * Доступны из приватных и публичных функций 
  * Снаружи объекта Panel2 вы их никак не увидите. Инкапсуляция однако.
  */
  /// Объект панели
  var instance;
  /// Окружение
  /// Возможные варианты: dev, production, deploy, testing
  var environment;
  /// текущая версия
  var version;
  /// ID настроек
  var optionsID;
  /// хеш базовых настроек
  var options = {
    /// системные опции
    system: {
      /// текущая тема
      theme: 'base'
    },
    /// настройки включенных окон
    panes: { 0: {}}
  };
  /// mouseDelta и mouseSpeed - переменные, необходимые для слежения за поведением курсора мыши
  var mouseDelta = 0;
  var mouseSpeed = 0;
  /// список подгружаемых пользовательских скриптов
  var scripts = {};
  /// список подгружаемых таблиц стилей
  var stylesheets = {};
  /// системные параметры - ссылка на фрейм для кросс доменной передачи сообщений, текущий домен
  var contentFrame, domain;
  /// Флаг инициализации, initializeStack - стек функций, которые надо запустить после инициализации
  var initialized, initializeStack = [];
  /// адрес, откуда установлена панель
  var baseURL;
  /// куки в виде хеша
  var __cookies;
  
  /******************************
  *******Приватные методы********
  *******************************/
  function hideAllPanes() {
    jQuery('.pane:visible').hide();
    jQuery('.pane-bubble.active').removeClass('active');
    $(document.body).off('click', hideAllPanes);
  }
  /**
  * Ленивая активация одной из панелей, вызывается click или mouseover событием
  * Создаёт все кнопки и виджеты внутри панели и привязывает события только после команды активации
  */
  function activatePane(e) {
    var $this = jQuery(this);
    if($this.hasClass('right') && (!e || e.type != 'click') && !$('.pane:visible').length) {
      /// Правые панели не активируем при наведении, потому что там из-за скроллбара ложные срабатывания
      return false;
    }
    var paneID = $this.attr('paneID');
    var pane;
    var pane_options = options.panes[paneID];
    var hold_positions = {};
    
    if((pane = jQuery('#pane-' + paneID)).length) {
      if(pane.css('display') == 'none') {
        hideAllPanes();
        pane.show();
        jQuery('#pane-bubble-' + paneID).addClass('active');
      } else if(e && e.type == 'click') {
        hideAllPanes();
        return false;
      }
    } else {
      pane = jQuery('<div id="pane-' + paneID + '" class="pane' + (paneID < 2? ' left': ' right') + (paneID % 2 > 0? ' bottom': ' top') + '"></div>')
        .css({
          width: options.system.btnwidth * pane_options.width,
          height: options.system.btnheight * pane_options.height
        });
      var paneContainer = jQuery('<div class="container"></div>').appendTo(pane);
      var buttons = pane_options.buttons;
      if(pane_options.buttons.length > 0) {
        jQuery(buttons).each(function(index) {
        //for(var i = 0; i < buttons.length; i++) {
          var type = panel_apply.buttons[this.type];
          if(!type) {
            instance.dispatchException('Unknown button type: ' + this.type, 'Pane ' + paneID + ' draw: ');
            return;
          }
          var that = this;
          var __button_init = function() {
            if(!instance[type['callback']]) {
              try{
                throw('"' + type['callback'] + '" for button ' + that.type + ', Pane ' + paneID + ' draw: ');
              } catch(e) {
                instance.dispatchException(e, 'Unknown callback function');
              }
              return;
            }
            var callback = instance[type.callback];
            if(type.callback_arguments) {
              var __arguments = type.callback_arguments;
            } else {
              var __arguments = that.arguments;
            }
            var img = (that.img || type.img);
            if(img.indexOf('http:') != 0) {
              img = __panel.path_to_theme() + img;
            }
            var __button = jQuery('<div class="button" id="button_' + that.type + '_' + index + '"></div>').append(
              jQuery('<a><div class="img"><img src="' + img + '" /></div><h3>' + (that.title? that.title: type.title) + '</h3></a>').click(function(e) {
                if(this.parentNode.dragging) {
                  this.parentNode.dragging = false;
                  return false;
                }
                this.parentNode.clicked = true;
                if(type.callback_arguments) {
                  callback(__arguments);
                } else {
                  callback(e, __arguments);
                }
                return false;
              })
            ).css({
              left: that.left * options.system.btnwidth,
              top: that.top * options.system.btnheight,
              width: options.system.btnwidth,
              height: options.system.btnheight
            })
            .attr('left', that.left).attr('top', that.top).attr('index', index)
            .appendTo(paneContainer);
            if(!hold_positions[that.top]) hold_positions[that.top] = {};
            hold_positions[that.top][that.left] = __button.attr('id');
          }
          if(instance[type.callback]) {
            instance.onInit(__button_init);
          } else {
            instance.loadScript(type.module + '/' + type.file, __button_init);
          }

        });
      }
      if(pane_options.buttons.length > 0 || pane_options.widgets.length > 0) {

        paneContainer.mousedown(function(e) {
          var that = jQuery(e.target).parents('.button, .widget');
          if(!that.length) return false;
          var is_widget = that.hasClass('widget');
          that.clicked = false;
          // Вуду начинается здесь
          // Запуск перетаскивания
          this.mouseDownTO = setTimeout(function() {
            if(that[0].clicked) return false;
            that[0].dragging = true;
            if(that.hasClass('ui-draggable') || e.which != 1) return false;
            instance.loadScript('lib/jquery-ui.custom.js', function() {
              //alert('ui loaded');
              // Создаём placeholders ("пустые места") для перетаскивания
              var widget_height = Math.round(parseInt(that.css('height')) / options.system.btnheight);
              var widget_width = Math.round(parseInt(that.css('width')) / options.system.btnwidth);
              var top = parseInt(that.attr('top'));
              var left = parseInt(that.attr('left'));
              var id = that.attr('id');
              for(var i = 0; i < pane_options.width; i++) {
                for(var j = 0; j < pane_options.height; j++) {
                  if((hold_positions[j] && hold_positions[j][i]) && hold_positions[j][i] != id) continue;
                  jQuery('<div class="pane-placeholder"></div>')
                    .attr('top', j)
                    .attr('left', i)
                    .css({
                      height: options.system.btnheight, 
                      width: options.system.btnwidth, 
                      left: i * options.system.btnwidth,
                      top: j * options.system.btnheight
                    })
                    .appendTo(paneContainer);
                }
              }
              that.draggable({
                containment: 'parent', 
                iframeFix: true,
                delay: 100, 
                iframeFix: true, 
                opacity: 0.5,
                snap: '.pane-placeholder', 
                snapMode: 'inner', 
                snapTolerance: options.system.btnWidth, 
                revert: true, 
                cursor: 'move', 
                start: function() {
                  //start
                },
                drag: function(event, ui) {
                  var left = Math.round(ui.position.left / options.system.btnwidth);
                  var top = Math.round(ui.position.top / options.system.btnheight);
                  // проверяем, пустое ли место (только placehloders)
                  var not_empty = false;
                  if(is_widget) {
                    var id = that.attr('id');
                    start:
                    for(var __top = top; (top + widget_height) > __top; __top++) {
                      for(var __left = left; (left + widget_width) > __left; __left++) {
                        if(!hold_positions[__top]) continue;
                        if(hold_positions[__top] && hold_positions[__top][__left] && hold_positions[__top][__left] != id) {
                          not_empty = true;
                          break start;
                        }
                      }
                    }
                  } else {
                    not_empty = hold_positions[top] && hold_positions[top][left];
                  }
                  if(not_empty) {
                    that.draggable('option', 'revert', true);
                  } else {
                    //Если есть, запоминаем позицию
                    that.attr('nleft', left);
                    that.attr('ntop', top);
                    that.draggable('option', 'revert', false);
                  }
                },
                stop: function() {
                  if(that[0].dragClassTO > 0) {
                    clearTimeout(that[0].dragClassTO);
                    that[0].dragClassTO = 0;
                  }
                  setTimeout(function() {
                    that[0].dragging = false;
                  }, 20);
                  if(!that.draggable('option', 'revert')) {
                    var top = parseInt(that.attr('top'));
                    var left = parseInt(that.attr('left'));
                    var new_top = parseInt(that.attr('ntop'));
                    var new_left = parseInt(that.attr('nleft'));
                    
                    if(is_widget) {
                      for(var __top = top; (top + widget_height) > __top; __top++) {
                        for(var __left = left; (left + widget_width) > __left; __left++) {
                          if(!hold_positions[__top]) hold_positions[__top] = {};
                          hold_positions[__top][__left] = false;
                        }
                      }
                      
                      for(var __top = new_top; (new_top + widget_height) > __top; __top++) {
                        for(var __left = new_left; (new_left + widget_width) > __left; __left++) {
                          if(!hold_positions[__top]) hold_positions[__top] = {};
                          hold_positions[__top][__left] = that.attr('id');
                        }
                      }
                      
                    } else {
                      if(hold_positions[top]) hold_positions[top][left] = false;
                      if(!hold_positions[new_top]) hold_positions[new_top] = {};
                      hold_positions[new_top][new_left] = that.attr('id');
                    }
                    that.attr('left', new_left);
                    that.attr('top', new_top);
                    // Отправляем событие в другие окна
                    instance.triggerEvent('widget_move', {'id': that.attr('id'), left: new_left, top: new_top, hold_positions: hold_positions});
                    if(is_widget) {
                      var widgets = options.panes[paneID].widgets;
                      widgets[that.attr('index')].left = new_left;
                      widgets[that.attr('index')].top = new_top;
                      var panes = options.panes;
                      panes[paneID].widgets = widgets;
                    } else {
                      var buttons = options.panes[paneID].buttons;
                      buttons[that.attr('index')].left = new_left;
                      buttons[that.attr('index')].top = new_top;
                      var panes = options.panes;
                      panes[paneID].buttons = buttons;
                    }
                    instance.setOptions(panes, 'panes');
                  }
                  that.removeAttr('nleft');
                  that.removeAttr('ntop');
                  
                  that.draggable('destroy');
                  jQuery('.pane-placeholder').remove();
                }
              }).data('draggable')._mouseDown(e);
              that[0].dragClassTO = setTimeout(function() {
                that.addClass('ui-draggable-dragging');
              }, 1500);
              //e.stopPropagation();
            });
          }, 500);
          return false;
        }).mouseup(function() {
          if(this.mouseDownTO) clearTimeout(this.mouseDownTO);
        });
      }
      var widgets = options.panes[paneID].widgets;
      if(widgets && widgets.length > 0) {
        jQuery(widgets).each(function(index) {
        //for(var i = 0; i < widgets.length; i++) {
          var type = panel_apply.widgets[this.type];
          if(!type) {
            instance.dispatchException('Unknown widget type: ' + that.type, 'Pane ' + paneID + ' draw: ');
            return;
          }
          var that = this;
          var __widget_init = function() {
            if(!instance[type['callback']]) {
              try {
                throw('"' + type['callback'] + '" for widget: ' + that.type + ', Pane ' + paneID + ' draw: ');
              } catch(e) {
                instance.dispatchException(e, 'Unknown callback function');
              }
              return;
            }
            var callback = instance[type.callback];
            var widget_width = (type.width? type.width: (that.arguments.width? that.arguments.width: 1));
            var widget_height = (type.height? type.height: (that.arguments.height? that.arguments.height: 1));
            var __widget = jQuery('<div class="widget '+ that.type + '" id="widget_' + that.type + '_' + index + '"></div>')
              .css({
                width: options.system.btnwidth * widget_width,
                height: options.system.btnheight * widget_height, 
                left: that.left * options.system.btnwidth, 
                top: that.top * options.system.btnheight
              })
              .attr('top', that.top).attr('left', that.left).attr('index', index)
              .appendTo(paneContainer);
            
            __widget[0].widget = that;
            __widget[0].widget.index = index;
            __widget[0].widget.paneID = paneID;
            
            for(var top = that.top; (that.top + widget_height) > top; top++) {
              for(var left = that.left; (that.left + widget_width) > left; left++) {
                if(!hold_positions[top]) hold_positions[top] = {};
                hold_positions[top][left] = __widget.attr('id');
              }
            }

            var __arguments = [__widget];
            if(type.arguments && type.arguments.length) {
              for(var i = 0; i < type.arguments.length; i++) __arguments.push(type.arguments[i]);
            }
            if(that.arguments) {
              __arguments.push(that.arguments);
            }
            instance[type['callback']].apply(that, __arguments);
          };
          if(instance[type.callback]) {
            instance.onInit(__widget_init);
          } else {
            instance.loadScript(type.module + '/' + type.file, __widget_init);
          }
        });
      }
      jQuery('.pane:visible').hide();
      jQuery('.pane-bubble.active').removeClass('active');
      jQuery('#pane-bubble-' + paneID).addClass('active');
      pane.appendTo(document.body);
    }
    // Ловим события о перемещении из других окон
    instance.bind('widget_move', function(data) {
      jQuery('#' + data.id).css({
        left: data.left * options.system.btnwidth,
        top: data.top * options.system.btnheight
      }).attr('left', data.left).attr('top', data.top);
      hold_positions = data.hold_positions;
    });
    /// При клике на body, скрываем всплывашку
    $(document.body).on('click', hideAllPanes);
    /// Обязательно надо вернуть false, иначе он уйдёт в document.body 
    /// и все всплывашки закроются
    return false;
  }
  
  /**
  * Функция проверки, надо ли открывать панель. 
  * Панель открывается если мышка двигалась достаточно быстро в сторону плашки активации
  */
  function activatePaneCheck() {
    var that = this;
    if((Math.abs(mouseDelta) > 0.05 && Math.abs(mouseSpeed) > 0.01) || Math.abs(mouseSpeed) > 0.05 ||  jQuery('.pane:visible').length > 0) {
      instance.onInit(function() {
        activatePane.apply(that, []);
      });
    }
    instance.__mousestart = false;
    mouseDelta = 0;
    if(instance.__mousestartTO > 0) {
      clearTimeout(instance.__mousestartTO);
      instance.__mousestartTO = 0;
    }
  }
  
  /**
  * Вывод плашек активации
  */
  function draw_pane_bubbles() {
    for(var i = 0; i < 4; i++) {
      if(typeof(options.panes[i]) == 'object') {
        jQuery('<div id="pane-bubble-' + i + '" class="pane-bubble' + (i < 2? ' left': ' right') + (i % 2 > 0? ' bottom': ' top') + '"></div>')
          .mouseover(activatePaneCheck)
          .click(function(e) {
            var that = this;
            instance.onInit(function() {
              activatePane.apply(that, [e])
            });
            return false;
          })
          .attr('paneID', i)
          .css({'display': options.panes[i].widgets && options.panes[i].widgets.length + 
                           options.panes[i].buttons && options.panes[i].buttons.length > 0? 
                           '': 'none'})
          .appendTo(document.body);
      }
    }
  }
  
  /**
  * Инициализация кнопок. Подгружаются нужные скрипты.
  */
  function initButtons() {
    var modules = {};
    
    for(var i = 0; i < 4; i++) {
      if(typeof(options.panes[i]) == 'object' && typeof(options.panes[i].buttons) == 'object') {
        for(var j = 0; j < options.panes[i].buttons.length; j++) {
          var type = options.panes[i].buttons[j].type;
          var module = panel_apply.buttons[type];
          if(module) {
            if(typeof(modules[module.module]) == 'undefined') {
              modules[module.module] = [];
            }
            if(modules[module.module].indexOf(module.file) == -1)
              modules[module.module].push(module.file);
          }
        }
      }
    }
    for(var module in modules) {
      for(var i = 0; i < modules[module].length; i++) {
        if(typeof(modules[module][i]) != 'undefined') {
          instance.loadScript(module + '/' + modules[module][i]);
        }
      }
    }
  }
  
  /**
  * Инициализация виджетов. Подгружаются нужные скрипты.
  */
  function initWidgets() {
    var modules = {};
    
    for(var i = 0; i < 4; i++) {
      if(typeof(options.panes[i]) == 'object' && typeof(options.panes[i].widgets) == 'object') {
        for(var j = 0; j < options.panes[i].widgets.length; j++) {
          var type = options.panes[i].widgets[j].type;
          var module = panel_apply.widgets[type];
          if(typeof(modules[module.module]) == 'undefined') {
            modules[module.module] = [];
          }
          if(modules[module.module].indexOf(module.file) == -1)
            modules[module.module].push(module.file);
        }
      }
    }
    for(var module in modules) {
      for(var i = 0; i < modules[module].length; i++) {
        instance.loadScript(module + '/' + modules[module][i]);
      }
    }
  }
  
  /**
  * Инициализация и отрисовка плавающих виджетов
  */
  function initFloatWidgets() {
    var modules = {};
    
    if(typeof(options.widgets) == 'object') {
      for(var j = 0; j < options.widgets.length; j++) {
        var type = options.widgets[j].type;
        var module = panel_apply.widgets[type];
        if(typeof(modules[module.module]) == 'undefined') {
          modules[module.module] = [];
        }
        if(modules[module.module].indexOf(module.file) == -1)
          modules[module.module].push({file: module.file, widget: options.widgets[j], index: j});
      }
    }
    for(var module in modules) {
      for(var i = 0; i < modules[module].length; i++) {
        var widget = modules[module][i].widget;
        widget.index = modules[module][i].index;
        widget.float = true;
        instance.loadScript(module + '/' + modules[module][i].file, function() {
          var type = panel_apply.widgets[widget.type];
          if(typeof(instance[type.callback]) == 'undefined') {
            throw('Function ' + type.callback + ' for widget ' + widget.type + ' not found');
          } else {
            var width = type.width * options.system.btnwidth;
            var height = type.height * options.system.btnheight;
            var __widget = jQuery('<div class="float-widget ' + widget.type + '"></div>')
              .attr('id', 'float-' + widget.index + '-' + widget.type)
              .css({
                left: widget.left,
                top: widget.top, 
                width: width,
                height: height
              })
              .appendTo(document.body);
            if(widget.left + width> jQuery(window).width()) __widget.css({left: jQuery(window).width() - width - 12});
            if(widget.height + height> jQuery(window).height()) __widget.css({height: jQuery(window).height() - height - 12});
            __widget[0].widget = widget;
            instance[type.callback].apply(instance, [__widget, widget.arguments]);
            __widget.mousedown(function(e) {
              if(jQuery(e.target).hasClass('float-widget')) var that = jQuery(e.target);
              else var that = jQuery(e.target).parents('.float-widget');
              if(!that.length) return false;
              that.clicked = false;
              // Запуск перетаскивания
              this.mouseDownTO = setTimeout(function() {
                if(that[0].clicked) return false;
                that[0].dragging = true;
                if(that.hasClass('ui-draggable') || e.which != 1) return false;
                instance.loadScript('lib/jquery-ui.custom.js', function() {
                  //alert('ui loaded');
                  // Создаём placeholders ("пустые места") для перетаскивания
                  var id = that.attr('id');
                  that.draggable({
                    containment: 'window', 
                    delay: 100, 
                    iframeFix: true, 
                    opacity: 0.5,
                    cursor: 'move', 
                    start: function() {
                      //start
                    },
                    stop: function(e, ui) {
                      if(that[0].dragClassTO > 0) {
                        clearTimeout(that[0].dragClassTO);
                        that[0].dragClassTO = 0;
                      }
                      setTimeout(function() {
                        that[0].dragging = false;
                      }, 20);
                      var left = Math.round(ui.position.left);
                      var top = Math.round(ui.position.top);
                      options.widgets[widget.index].left = left;
                      options.widgets[widget.index].top = top;
                      instance.setOptions(options.widgets, 'widgets');
                      instance.triggerEvent('float_widget_move', {'id': that.attr('id'), left: left, top: top, index: widget.index});
                      
                      that.draggable('destroy');
                    }
                  }).data('draggable')._mouseDown(e);
                  that[0].dragClassTO = setTimeout(function() {
                    that.addClass('ui-draggable-dragging');
                  }, 1500);
                  //e.stopPropagation();
                });
              }, 500);
              return false;
            }).mouseup(function() {
              if(this.mouseDownTO) clearTimeout(this.mouseDownTO);
            });
        
          }
        });
      }
    }
    instance.bind('float_widget_move', function(data) {
      jQuery('#' + data.id).css({
        left: data.left,
        top: data.top
      });
      options.widgets[data.index].left = data.left;
      options.widgets[data.index].top = data.top;
    });
  }
  
  /**
  * Инициализация всего интерфейса
  */
  function initInterface() {
    if(document.getElementsByClassName.toString().indexOf('native') == -1) {
      // Prototype переопределяет эту функцию, поэтому возвращаем ей дефолтное состояние
      delete document.getElementsByClassName;
    }
    jQuery(window).focus(function() {
      instance.crossWindow.set('focused', instance.crossWindow.windowID);
    });
    jQuery(window).mousemove(function(e) {
      if(!instance.__mousestart) {
        instance.__mousestart = true;
        instance.__mousestartx = e.clientX;
        mouseDelta = 0;
        mouseSpeed = 0;
        instance.__mousestartTime = (new Date()).getTime();
        if(instance.__mousestartTO > 0) {
          clearTimeout(instance.__mousestartTO);
          instance.__mousestartTO = 0;
        }
      } else {
        mouseDelta = (e.clientX - instance.__mousestartx) /jQuery(window).width();
        mouseSpeed = (instance.__mouseprevx - e.clientX) / (instance.__mousestartTime - (new Date()).getTime());
        if(instance.__mousestartTO > 0) clearTimeout(instance.__mousestartTO);
        instance.__mousestartTO = setTimeout(function() {
          instance.__mousestart = false;
          mouseDelta = 0;
          instance.__mousestartTO = 0;
        }, 200);
      }
      instance.__mouseprevx = e.clientX;
    });
    
    initButtons();
    initWidgets();
    
    instance.onInit(initFloatWidgets);
    
    // Прорисовка, её нужно выполнять после того как получены все опции и подгружены стили
    draw_pane_bubbles();
  }
  
  function clearTimeouts(w) {
    if(!w) w = window;
    var s = w.setTimeout('void 0;', 1000);
    for(var i = s; i > s - 100; i--) {
      w.clearTimeout(i);
    };
  }
  
  /**
  * Конструктор
  * @param __options - дефолтные настройки панели, хеш
  * @param __panel_apply.buttons - список доступных кнопок
  * @param __panel_apply.widgets - список доступных виджетов
  * @param __baseURL - адрес, откуда запустилась панель
  */
  function Panel2(__env, __baseURL) {
    if(!instance )
       instance = this;
    else return instance;
    try {
      //if(window.frameElement && !window.frameElement.panelContainer) return;
    } catch(e) {}
    
    if(location.search.indexOf('gwpanel_test') != -1) {
      environment = 'testing';
    } else {
      environment = localStorage.environment || __env;
    }
    version = panel_apply.version;
    baseURL = __baseURL;
    
    var ar = document.domain.split('.');
   // if(ar[ar.length - 2] != 'www') document.domain = ar.slice(ar.length - 2).join('.');
    domain = ar.slice(ar.length - 2).join('.');

    var cookies = document.cookie.split('; ');
    instance.cookies = {};
    for(var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split('=');
      instance.cookies[parts[0]] = parts[1];
    }

    /// Функция запуска
    /// Если в localStorage на текущем домене есть копия нужных опций, 
    /// то эта функция будет запущена сразу
    /// если копии нет, то сперва получаем опции из контейнера с ganjawars.ru
    var __initFunc = function() {
      // Инициализация слушателей событий
      for(var key in panel_apply.events) {
        jQuery(panel_apply.events[key]).each(function(index, type) {
          if(type.condition) {
            try {
              if(!eval(type.condition)) return;
            } catch(e) {
              instance.dispatchException(e, 'condition for loaded script error: ');
              return;
            }
          }
          instance.bind(type.event, function() {
            var that = this;
            var _args = arguments;
            instance.loadScript(panel_apply.scripts[type.callback], function() {
              if(typeof(instance[type.callback]) == 'undefined') {
                throw('Function ' + type + ' in module ' + panel_apply.scripts[type] + ' not found');
              } else {
                instance[type.callback].apply(that, _args);
              }
            });
          }, type.local);
        });
      }

      // Инициализация подгружаемых скриптов
      var pages = [];
      if(typeof(panel_apply.pages[location.pathname]) == 'object') {
        pages = panel_apply.pages[location.pathname];
      }
      if(typeof(panel_apply.pages['*']) == 'object') {
        for(var i = 0; i < panel_apply.pages['*'].length; i++)
          pages.push(panel_apply.pages['*'][i]);
      }
      jQuery(pages).each(function(index, func) {
        if(typeof(func) == 'object') {
          for(var key in func) {
            var condition = func[key];
            func = key;
            break;
          }
          if(condition) {
            try {
              if(!eval(condition)) return;
            } catch(e) {
              instance.dispatchException(e, 'condition for loaded script error: ');
              return;
            }
          }
        }
        instance.loadScript(panel_apply.scripts[func], function() {
          if(typeof(instance[func]) == 'undefined') {
            throw('Function ' + func + ' in module ' + panel_apply.scripts[func] + ' not found');
          } else {
            instance[func].apply(instance, [options[panel_apply.scripts[func].split('/')[0]] || {}]);
          }
        });
      });
    }

    if(environment == 'testing') {
      var variantID = 'default';
      optionsID = 'testing_' + instance.currentPlayerID() + '_default';
      options = window.panelSettingsCollection.default;
      fastInitReady = true;
    } else {
      var variantID = 'options_variant_' + instance.currentPlayerID();
      var __local_variant = localStorage[variantID];
      /// Опции сперва привязываются к окружению (environment), затем к ID игрока
      /// затем к выбранному варианту, если вариант не найден, то выбираем default
      var fastInitReady = false;
      if(__local_variant != null && 
        __local_variant.length > 0) {
        optionsID = environment + '_' + instance.currentPlayerID() + '_' + 
                        __local_variant;
        var __local_options = localStorage[optionsID];
        if(__local_options != null && 
           __local_options.length > 0) {
          jQuery.extend(options, unserialize(__local_options));
          fastInitReady = true;
        }
      }
    }
    //if(typeof(__options) == 'object') jQuery.extend(options, __options);
    //if(typeof(__panel_apply.buttons) == 'object') panel_apply.buttons = __panel_apply.buttons;
    //if(typeof(__panel_apply.widgets) == 'object') panel_apply.widgets = __panel_apply.widgets;
/*    if(!localStorage.options) {
      localStorage.options = serialize(panelSettingsCollection.default);
      localStorage.options_upd = (new Date).getTime();
    } else if(localStorage.options) {
      try {
        var local_options = unserialize(localStorage.options);
      } catch(e) {}
      jQuery.extend(options, local_options);
    }*/
    // Инициализация кросс-доменного хранилища
    // Хранилище нужно для того, чтобы на всех поддоменах был доступ к localStorage
    // на домене www.ganjawars.ru
    // Если не будет хранилища, то мы никак не сможем например с quest.ganjawars.ru получить 
    // настройки и события с других страниц, и даже тупо не сможем проверить почту чтобы вывести
    // уведомления
    this.crossWindow = new __crossWindow(environment == 'production' || environment == 'deploy'? 
                                  '/tmp/panel2container.html':
                                  '/tmp/panelcontainer.html', function() {
      /// функция полной готовности окна
      instance.crossWindow.get(variantID, function(__variant) {
        if(!__variant) {
          instance.set(variantID, 'default');
          localStorage[variantID] = 'default';
          __variant = 'default';
        }
        optionsID = environment + '_' + instance.currentPlayerID() + '_' + __variant;
        instance.crossWindow.get(optionsID, function(__options) {
          if(__options != null && String(typeof(__options)).toLowerCase() == 'object') {
            options = jQuery.extend(options, __options);
          } else {
            /// дефолтные опции
            options = jQuery.extend(options, window.panelSettingsCollection.default);
            instance.set(optionsID, options);
          }
          localStorage[optionsID] = serialize(options);
          if(!fastInitReady) {
            /// медленная инициализация
            __initFunc();
          }
          initialized = true;
          jQuery(initializeStack).each(function() {
            try {
              this();
            } catch(e) {
              instance.dispatchException(e);
            }
          });
        });
      });
    }, 'ganjawars.ru');

    /// если быстрая инициализация доступна
    if(fastInitReady) __initFunc();
    
    // следим за сменой опций из других окон
    instance.bind('options_change', function(data) {
      if(data.optionsID == optionsID) {
        jQuery.extend(options, data.options);
      }
    });
    
    jQuery(document.body).addClass(window.location.pathname.replace(/\./g, '-').replace(/\//g, '_').substr(1));
    if(location.hostname != 'www.ganjawars.ru') {
      var href = location.href;
      if(href.charAt(location.href.length - 1) == '?' || href.charAt(location.href.length - 1) == '&')
        href = location.href.substr(0, location.href.length - 1);
      window.parent.postMessage(toJSON({'type': 'frame', 'title': document.title, 'href': href}), '*');
    }

    instance.onInit(function() {
      instance.loadCSS('panel.css');
      initInterface();
    });

    /// Инициализация тестов если в запросе указан ?gwpanel_test и это не встроенный фрейм
    if(environment == 'testing' && location.search.indexOf('continue') == -1) {
      //alert('test');
      instance.loadCSS('../../lib/qunit-1.15.0.css');
      instance.loadScript('lib/qunit-1.15.0.js', function() {
        QUnit.config.autostart = false;
        $('<div id="qunit-fixture"></div>').prependTo(document.body);
        $('<div id="qunit"></div>').prependTo(document.body);
        instance.onInit(function() {
          instance.loadScript('panel/panel_test.js', function() {
            QUnit.start();
          });
        });
      });
    }
      /* нало придумать нормальный коммент
       * а пока, тут гадил
       * гном убийца
       */
  }
  
  /******************************
  *******Публичные методы********
  *******************************/

  jQuery.extend(Panel2.prototype, {
    /**
    * Обработка исключений. Если есть консоль, то выводим в консоль.
    */
    dispatchException: function(e, comment) {
      if(window.console) {
        console.log((comment? comment + " on ": '') + 
                    (new Error).stack.split("\n")[1]);
        console.log(e);
      }
    },
    
    /**
    * Установка версии
    * @param __version - номер версии (число)
    * устанавливается юзерскриптом, либо после инициализации через сервер
    */
    setVersion: function(__version) {
      version = __version;
    },
    
    /**
    * Загрузка CSS-файла
    * @param name - название таблицы стилей (путь)
    * @param name - название таблицы стилей, пока не используется
    */
    loadCSS: function(name, callback, failover) {
      if(typeof(stylesheets[name]) != 'undefined') {
        if(stylesheets[name].loaded) {
          try {
            callback();
          } catch(e) {
            instance.dispatchException(e, 'loadCSS callback error: ');
          }
        } else if(callback) stylesheets[name].callbacks.push(callback);
        return;
      }
      stylesheets[name] = {callbacks: [], failovers: [], loaded: false};
      if(callback) stylesheets[name].callbacks.push(callback);
      if(failover) stylesheets[name].failovers.push(failover);

      window.__loadCSS('themes/' + options.system.theme + '/' + name);
    },
    
    /**
    * Подгрузка юзер-скрипта
    * @param name - путь к скрипту, например "home/home.js"
    * @param callback - функция, которую следует запустить после загрузки
    */
    loadScript: function(name, callback, failover) {
      if(typeof(scripts[name]) != 'undefined') {
        if(scripts[name].loaded) {
          try {
            callback();
          } catch(e) {
            instance.dispatchException(e, 'loadScript callback error: ');
          }
        } else if(callback) scripts[name].callbacks.push(callback);
        return;
      }
      scripts[name] = {callbacks: [], failovers: [], loaded: false};
      if(callback) scripts[name].callbacks.push(callback);
      if(failover) scripts[name].failovers.push(failover);

      window.__loadScript(name, function() { instance.loadScriptComplete(name)});
    },
    
    /**
    * Обработчик окончания загрузки скрипта
    * @param name - путь скрипта, например "home/home.js"
    */
    loadScriptComplete: function(name) {
      scripts[name].loaded = true;
      for(var i = 0; i < scripts[name].callbacks.length; i++) {
        try {
          scripts[name].callbacks[i]();
        } catch(e) {
          instance.dispatchException(e, 'loadScript callback error: ');
        }
      }
    },
    
    /**
    * Обработчик ошибки загрузки скрипта
    * @param name - путь скрипта, например "home/home.js"
    */
    loadScriptFail: function(name, line) {
      scripts[name].fail = true;
      instance.failedScripts.push(name, line);
      if(console.log) console.log('Failed to load script "' + name + 
                                  '" called on ' + line);
      for(var i = 0; i < scripts[name].failovers.length; i++) {
        try {
          scripts[name].failovers[i]();
        } catch(e) {
          instance.dispatchException(e, 'failoverScript callback error: ');
        }
      }
    },

    /**
    * Обработчик окончания загрузки стилей
    * @param name - путь скрипта, например "home/home.js"
    */
    loadCSSComplete: function(name) {
      stylesheets[name].loaded = true;
      for(var i = 0; i < stylesheets[name].callbacks.length; i++) {
        try {
          stylesheets[name].callbacks[i]();
        } catch(e) {
          instance.dispatchException(e, 'loadCSS callback error: ');
        }
      }
    },
    
    /**
    * Обработчик ошибки загрузки скрипта
    * @param name - путь скрипта, например "home/home.js"
    */
    loadCSSFail: function(name, line) {
      stylesheets[name].fail = true;
      instance.failedScripts.push(name, line);
      if(console.log) console.log('Failed to load css "' + name + 
                                  '" called on ' + line);
      for(var i = 0; i < stylesheets[name].failovers.length; i++) {
        try {
          stylesheets[name].failovers[i]();
        } catch(e) {
          instance.dispatchException(e, 'failoverCSS callback error: ');
        }
      }
    },
    /**
    * Функция проверки фокуса
    * @param callback - функция, которая будет запущена если текущее окно является активным
    */
    checkFocused: function(callback) {
      instance.crossWindow.get('focused', function(data) {
        if(instance.crossWindow.windowID == data) {
          try {
            callback();
          } catch(e) {
            instance.dispatchException(e, 'Focused callback error: ');
          }
        }
      });
    },
    
    /**
    * Разбор строки запроса в хеш параметров
    * @param query - строка запроса, например ?foo=bar&foo1=bar
    * @return хеш, например {"foo": "bar", "foo1": "bar"}
    */
    toQueryParams: function(query) {
      if(query.charAt(0) == '?') query = query.substr(1);
      var vars = query.split("&");
      var result = {};
      for(var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        result[pair[0]] = pair[1];
      }
      return result;
    },
    
    /**
    * Установка значения в хранилище
    * @param key - название переменной
    * @param value - значение переменной
    * @param callback - функция, которая будет вызвана после успешной установки значения
    */
    set: function(key, value, callback) {
      if(['options'].indexOf(key) != -1) {
        throw('Error: you can\'t set protected property directly');
      }
      var __key = key;
      var __value = value;
      var __callback = callback;
      instance.onInit(function() {
        instance.crossWindow.set(__key, __value, __callback);
      });
    },
    
    /**
    * Считывание значения из хранилища
    * @param key - название переменной
    * @param callback - функция, которая будет вызвана после считывания значения
    * в эту функцию первым аргументом передаётся считанное значение
    */
    get: function(key, callback) {
      var __key = key;
      var __callback = callback;
      instance.onInit(function() {
        instance.crossWindow.get(__key, __callback);
      });
    },
    
    /**
    * Удаление значения из хранилища
    * @param key - название переменной
    * @param callback - функция, которая будет вызвана после удаления значения
    */    
    del: function(key, callback) {
      var __key = key;
      var __callback = callback;
      instance.onInit(function() {
        instance.crossWindow.del(__key, __callback);
      });
    },
    /**
    * Запуск события
    * @param type - название события
    * @param data - данные, в любом виде - объект/хеш/массив/строка
    * @param local - флаг локального события, если =true, 
    *                то событие отработает только в текущем окне
    */
    triggerEvent: function(type, data, local) {
      return instance.crossWindow.triggerEvent(type, data, local);
    },
    
    /**
    * Привязка к событиям
    * @param type - название события
    * @param callback - слушатель события
    *                   первым аргументом в слушатель события передаются данные
    * @return listenerID - идентификатор слушателя (для отвязки)
    */
    bind: function(type, callback) {
      return instance.crossWindow.bind(type, callback);
    },
    
    /**
    * Отвязка от события
    * @param type - название события
    * @param listenerID - идентификатор слушателя, 
    *                     строка, которую вернула функция .bind()
    */
    unbind: function(type, listenerID) {
      return instance.crossWindow.unbind(type, listenerID);
    },
    
    /**
    * Получение опций
    * @return хеш опций (защищённый объект, доступен только через эту функцию)
    */
    getOptions: function() {
      return options;
    },
    /**
    * Получение идентификатора опций
    * @return строка - полное название опций, зависит от окружения, пользователя
    * и выбранных установок
    */
    getOptionsID: function() {
      return optionsID;
    },
    /**
    * Установка опций
    * @param set_options - хеш всех опций либо для конкретного модуля,
    *                      если указан namespace
    * @param namespace - строка, название модуля или пространства имён,
    *                    в котором хранятся указанные опции
    */
    setOptions: function(set_options, namespace) {
      if(typeof(optionsID) == 'undefined') {
        console.log('wrong optionsID: ' + optionsID);
        console.log((new Error).stack);
        return;
      }
      if(namespace) {
        options[namespace] = set_options;
      } else {
        options = set_options;
      }
      var new_options = {};
      for(var key in options) {
        var type = String(typeof(options[key])).toLowerCase();
        if(type != 'undefined' && options[key] !== null) {
          new_options[key] = options[key];
        }
      }
      options = new_options;
      instance.set(optionsID, options);
      //var time = (new Date).getTime();
      /// записываем на текущий домен, чтобы при инициализации был быстрый доступ
      localStorage[optionsID] = serialize(options);
      instance.triggerEvent('options_change', {options: options, optionsID: optionsID});
    },
    
    /**
    * Установка опций виджета
    * @param set_options - хеш опций
    * @param widget - jQuery-объект виджета, для которого нужно установить опции
    */
    setWidgetOptions: function(set_options, widget) {
      if(widget[0].widget.float) {
        jQuery.extend(options.widgets[widget[0].widget.index].arguments, set_options);
      } else {
        jQuery.extend(options.panes[widget[0].widget.paneID].widgets[widget[0].widget.index].arguments, set_options);
      }
      instance.setOptions(options);
    },
    
    /**
    * Переход по ссылке
    * @param href - ссылка для перехода
    * функция нужна была для совместимости с фреймовой версией
    * в будущем её можно использовать для чего-нибудь ещё, например для слежения
    * за переходами и сбора статистики
    */
    gotoHref: function(href) {
      if(contentFrame) {
        contentFrame.contentWindow.postMessage(toJSON({'type': 'location', 'href': href}), '*');
        jQuery('.pane:visible').hide();
        jQuery('.pane-bubble.active').removeClass('active');
      } else {
        location.href = href;
      }
    },
    
    /**
    * Метод для запуска функции по окончании инициализации панели
    * @param callback - функция для запуска
    * Пример:
    * __panel.callback(function() {
    *   alert("Панель инициализирована и готова к работе");
    * });
    */
    onInit: function(callback) {
      if(initialized) {
        try {
          callback();
        } catch(e) {
          console.log((new Error).stack);
          instance.dispatchException(e);
        }
      } else {
        initializeStack.push(callback);
      }
    },
    
    /**
    * Функция возвращает абсолютный путь к текущей теме
    */
    path_to_theme: function() {
      return baseURL + '/themes/' + options.system.theme + '/';
    },

    /*
    * Функция возвращает куки в виде хеша
    */
    getCookies: function() {
        var cookie, i, length, keyValue;
        if(__cookies != undefined) {
            return __cookies;
        }
        __cookies = {};
        cookie = document.cookie.split('; ');
        for(i = 0, length = cookie.length; i < length; i++){
            keyValue = cookie[i].split("=");
            __cookies[keyValue[0]] = encodeURIComponent(keyValue[1]);
        }
        return __cookies;
    },
    /**
    * Функция возвращает ID текущего игрока (из кук)
    */
    currentPlayerID: function() {
      return instance.getCookies()['au'];
    },
    /**
    * Функция возвращает имя текущего игрока
    */

    currentPlayerName: function(callback) {
        instance.get('panel_currentPlayerName', callback);
    },



    panel_homepage: function(){
        var name, id;
        if(location.search == "?logged"){
            name = $('a[href*="info.php?id="]').get(0).textContent;
            id = instance.currentPlayerID();
            instance.set("panel_currentPlayerName", name);
            instance.triggerEvent("login", {"currentPlayerName": name, "currentPlayerID": id});
        }
    },

    panel_login: function(){
        var name, id;
        name = "__notLogged";
        id = -1;
        instance.set("panel_currentPlayerName", name);
        instance.triggerEvent("logout", {"currentPlayerName": name, "currentPlayerID": id});
    },
    /**
    * Публичные аттрибуты
    */
    /// Скрипты с ошибками
    failedScripts: [],
    /// Стили с ошибками
    failedStyles: []
  });
  
  return Panel2;
};