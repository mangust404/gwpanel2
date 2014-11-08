window.jQuery = jQuery.noConflict();
if(!window.console) {
  window.console = {
    log: function() {}
  }
}

(function($) {

String.prototype.hashCode = function(){
  var hash = 0;
  if (this.length == 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

window.Panel2 = new function() {
  /**
  * Защищённые аттрибуты
  * Доступны из приватных и публичных функций 
  * Снаружи объекта Panel2 вы их никак не увидите. Инкапсуляция однако.
  */
  var domain;
  /// Объект панели
  var instance;
  /// Окружение
  /// Возможные варианты: dev, production, deploy, testing
  var environment;
  var original_environment;
  /// слушатели сброса кеша
  var cacheListeners;
  /// текущая версия
  var version;
  /// уникальный идентификатор открытого окна
  var windowID;
  /// ID настроек
  var optionsID;
  /// хеш базовых настроек
  var options = {
    /// системные опции
    system: {
      /// текущая тема
      theme: 'base',
      btnwidth: 70,
      btnheight: 85
    },
    /// настройки включенных окон
    panes: [{height: 4, width: 6, buttons: [], widgets: []}, 
            {height: 4, width: 6, buttons: [], widgets: []},
            {height: 4, width: 6, buttons: [], widgets: []},
            {height: 4, width: 6, buttons: [], widgets: []},
            {height: 4, width: 6, buttons: [], widgets: []},
            {height: 4, width: 6, buttons: [], widgets: []},
            {height: 4, width: 6, buttons: [], widgets: []}],
    widgets: []
  };
  /// mouseDelta и mouseSpeed - переменные, необходимые для слежения за поведением курсора мыши
  var mouseDeltaX = 0;
  var mouseSpeedX = 0;
  var mouseDeltaY = 0;
  var mouseSpeedY = 0;
  /// список подгружаемых пользовательских скриптов
  var scripts = {
    'panel/panel.js': {loaded: true, callbacks: [], failovers: []}
  };
  /// список подгружаемых таблиц стилей
  var stylesheets = {};
  /// Флаг, показывающий доступна ли быстрая инициализация
  var fastInitReady = false;
  /// Документ доступен для записи
  var documentIsWriteable;
  /// системные параметры - ссылка на фрейм для кросс доменной передачи сообщений, текущий домен
  var contentFrame, domain;
  /// Флаг готовности, стек функций которые надо запустить по готовности
  var is_ready, readyStack = [];
  /// Флаг инициализации, initializeStack - стек функций, которые надо запустить после инициализации
  var initialized, initializeStack = [];
  /// Функции, которые надо вызвать после ухода со страницы в AJAX-версии
  var tearDownStack = [];
  /// Локальные слушатели, необходимо для создания уникальных индксов для слушателей
  var listenersStack = {};
  /// адрес, откуда установлена панель
  var baseURL;
  /// куки в виде хеша
  var __cookies;

  var timer, prev_timer;

  /// доступ к функциям сервера, для членов синдиката #5787
  var haveServerSync = false;
  
  /// Списки таймаутов и интервалов, которые не нужно удалять при AJAX-переходах
  var safeIntervals = [];
  var safeTimeouts = [];

  var xhr;

  var prevScrollTop;
  /******************************
  *******Приватные методы********
  *******************************/
  /**
  * Обработчик перетаскивания кнопок и виджетов в другие окна
  */
  function dragOverPanes(e) {
    /// Наведение мышки на баблы
    $('.pane-bubble.external').each(function() {
      var paneID = this.id.split('-')[2];
      var that = this;
      var scrollTop = $(document).scrollTop();
      if(e.pageX > this.offsetLeft - 15 && e.pageX < this.offsetLeft + this.clientWidth + 15 && 
         e.pageY - scrollTop > this.offsetTop - 3 && e.pageY - scrollTop < this.offsetTop + this.clientHeight + 3) {
        $(this).addClass('drag-over');
      } else {
        if($(this).hasClass('drag-over')) $(this).removeClass('drag-over');
      }
    });
  }
  /**
  * Ленивая активация одной из панелей, вызывается click или mouseover событием
  * Создаёт все кнопки и виджеты внутри панели и привязывает события только после команды активации
  */
  function activatePane(e) {
    var $this = $(this);
    if($this.hasClass('right') && !$this.hasClass('footer') && (!e || e.type != 'click') && !$('.pane:visible').length) {
      /// Правые панели не активируем при наведении, потому что там из-за скроллбара ложные срабатывания
      return false;
    }
    var paneID = $this.attr('paneID');
    var pane;
    var pane_options = options.panes[paneID];
    var hold_positions = {};
    if((pane = $('#pane-' + paneID)).length) {
      if(pane.css('display') == 'none') {
        instance.hideAllPanes();
        pane.show();
        instance.triggerEvent('pane_show', paneID);
        $('#pane-bubble-' + paneID).addClass('active');
      } else if(e && e.type == 'click') {
        instance.hideAllPanes();
        return false;
      }
    } else {
      pane = $('<div id="pane-' + paneID + '" class="pane' + 
        (paneID < 4? (paneID < 2? ' left': ' right') + 
                      (paneID % 2 > 0? ' bottom': ' top'): 
                     ' footer' + (paneID == 4? ' left': paneID == 5? 
                      ' center': ' right')) + '"></div>')
        .css({
          width: options.system.btnwidth * pane_options.width,
          height: options.system.btnheight * pane_options.height
        });
      var paneContainer = $('<div class="container"></div>').appendTo(pane);
      var buttons = pane_options.buttons;
      var added_id = [];

      if(pane_options.buttons && pane_options.buttons.length > 0) {
        $(buttons).each(function(index) {
        //for(var i = 0; i < buttons.length; i++) {
          var type = panel_apply.buttons[this.type];
          if(!type.callback) type.callback = this.type.substr(type.module.length + 1);
          if(!type) {
            instance.dispatchException('Unknown button type: ' + this.type, 'Pane ' + paneID + ' draw: ');
            return;
          }
          var that = this;
          img = instance.iconURL(that.img || type.img);

          if(that.id && added_id.indexOf(that.id) == -1) {
            id = that.id;
          } else {
            id = 'button_' + that.type + '_' + index;
            options.panes[paneID].buttons[index].id = id;
          }
          added_id.push(id);
          var $button = $('<div class="button ' + that.type + '" id="' + id + '"></div>').append(
            $('<a><div class="img"><img src="' + img + '" /></div><h3>' + 
              (that.title? that.title: type.title) + 
              '</h3></a>').click(function(e) {
              if(this.parentNode.dragging) {
                this.parentNode.dragging = false;
                return false;
              }
              var __that = this;

              instance.loadScript(getFiles(type.file, type.module), function() {
                if(!instance[type['callback']]) {
                  try{
                    throw('"' + type['callback'] + '" for button ' + that.type + ', Pane ' + paneID + ' draw: ');
                  } catch(e) {
                    instance.dispatchException(e, 'Unknown callback function');
                  }
                  return;
                }
                var callback = instance[type.callback];
                var __options = {};
                if(that.arguments) {
                  $.extend(__options, that.arguments);
                }

                $.extend(__options, {
                  save: function(callback) {
                    for(var key in __options) {
                      if(key == 'save') continue;
                      options.panes[paneID].buttons[index].arguments[key] = __options[key];
                    }
                    instance.setOptions(options, undefined, function() {
                      if(callback) callback();
                      /*instance.triggerEvent('options_change_' + that.type, 
                        {options: __options, playerID: instance,currentPlayerID()});*/
                    });
                  }
                });
                __that.parentNode.clicked = true;
                try {
                  callback.apply($button.get(0), [__options]);
                } catch(e) {
                  instance.dispatchException(e);
                }
              });
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
          instance.setTimeout(function() {
            if($button.find('h3').get(0).clientHeight > 30) {
              $button.find('h3').addClass('big');
            }
          }, 10);
          if(!hold_positions[that.top]) hold_positions[that.top] = {};
          hold_positions[that.top][that.left] = $button.attr('id');
        });
      }
      if((pane_options.buttons && pane_options.buttons.length > 0) || 
         (pane_options.widgets && pane_options.widgets.length > 0)) {

        paneContainer.mousedown(function(e) {
          var that = $(e.target).parents('.button, .widget');
          if(!that.length) return false;
          var is_widget = that.hasClass('widget');
          that.clicked = false;
          // Вуду начинается здесь
          // Запуск перетаскивания
          this.mouseDownTO = setTimeout(function() {
            if(that[0].clicked) return false;
            that[0].dragging = true;
            if(that.hasClass('ui-draggable') || e.which != 1) return false;
            instance.loadScript('lib/jquery-ui-1.9.2.custom.min.js', function() {
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
                  $('<div class="pane-placeholder"></div>')
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
                containment: 'document', 
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
                  /// перетаскивание кнопок и виджетов в другие окна
                  $('.pane-bubble:hidden').show();
                  $('.pane-bubble:not(#pane-bubble-' + paneID + ')')
                    .addClass('external');
                  that.on('mousemove', dragOverPanes);
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

                  if( left + (is_widget? widget_width: 1) > options.panes[paneID].width || 
                      top + (is_widget? widget_height: 1) > options.panes[paneID].height ||
                      left < 0 ||
                      top < 0) {
                    /// Элемент за  пределами окна, возвращаем на родину
                    that.draggable('option', 'revert', true);
                  } else if(not_empty) {
                    that.draggable('option', 'revert', true);
                  } else {
                    //Если есть, запоминаем позицию
                    that.attr('nleft', left);
                    that.attr('ntop', top);
                    that.draggable('option', 'revert', false);
                  }
                },
                stop: function() {
                  that.off('mousemove', dragOverPanes);
                  if(that[0].dragClassTO > 0) {
                    clearTimeout(that[0].dragClassTO);
                    that[0].dragClassTO = 0;
                  }
                  setTimeout(function() {
                    that[0].dragging = false;
                  }, 20);
                  if($('.pane-bubble.drag-over').length) {
                    /// Попытка перетаскивания в другое окно
                    var newPaneID = $('.pane-bubble.drag-over').attr('id').split('-')[2];
                    new_pane_options = options.panes[newPaneID] || {width: 6, height: 6, buttons: [], widgets: []};
                    if(!new_pane_options.buttons) new_pane_options.buttons = [];
                    if(!new_pane_options.widgets) new_pane_options.widgets = [];

                    var new_top, new_left;

                    var free_place = instance.checkPanePlaces(newPaneID, 
                      {height: widget_height || 1, width: widget_width || 1});
                    if(free_place) {
                      new_top = free_place[0];
                      new_left = free_place[1];
                    } else {
                      /// место не найдено, возвращаем виджет на прежнее место
                      that.draggable('option', 'revert', true);
                      instance.showFlash('В этом окне нет места!', 'warning', 5000);
                      that.draggable('destroy');
                      $('.pane-placeholder').remove();
                      that.draggable('element').animate({
                        top: parseInt(that.attr('top')) * options.system.btnheight,
                        left: parseInt(that.attr('left')) * options.system.btnwidth
                      });
                      $('.pane-bubble.drag-over').removeClass('drag-over');
                      return;
                    }
                    if(is_widget) {
                      var widget_options = {};
                      var id = that.attr('id');
                      /// ищем виджет в старом окне и удаляем
                      for(var i = 0; i < options.panes[paneID].widgets.length; i++) {
                        if(id == options.panes[paneID].widgets[i].id) {
                          widget_options = options.panes[paneID].widgets[i];
                          options.panes[paneID].widgets.splice(i, 1);
                          break;
                        }
                      }
                      /// Добавляем виджет в новое окно
                      widget_options.paneID = newPaneID;
                      widget_options.top = new_top;
                      widget_options.left = new_left;
                      if(!options.panes[newPaneID].widgets) 
                        options.panes[newPaneID].widgets = [];
                      options.panes[newPaneID].widgets.push(widget_options);
                    } else {
                      var button_options = {};
                      var id = that.attr('id');
                      /// ищем виджет в старом окне и удаляем
                      for(var i = 0; i < options.panes[paneID].buttons.length; i++) {
                        if(id == options.panes[paneID].buttons[i].id) {
                          button_options = options.panes[paneID].buttons[i];
                          options.panes[paneID].buttons.splice(i, 1);
                          break;
                        }
                      }
                      /// Добавляем кнопку в новое окно
                      button_options.paneID = newPaneID;
                      button_options.top = new_top;
                      button_options.left = new_left;
                      if(!options.panes[newPaneID].buttons) 
                        options.panes[newPaneID].buttons = [];
                      options.panes[newPaneID].buttons.push(button_options);
                    }
                    if($('#pane-' + newPaneID).length) {
                      /// если окошко каким-то образом уже отрисовалось, то удаляем его
                      /// чтобы оно прорисовалось с новыми элементами
                      $('#pane-' + newPaneID).remove();
                    }
                    /// И, наконец-то удаляем элемент из предыдущего окна
                    $('#pane-' + paneID).find('#' + id).remove();

                    instance.showFlash('Если вы закончили настройку, то нажмите <strong>F5</strong>,<br />чтобы изменения вступили в силу', 'message', 5000);
                    $('.pane-bubble.drag-over').removeClass('drag-over');
                    //that.draggable('destroy');
                    $('.pane-placeholder').remove();

                    /// И последний шаг - сохраняем новые опции
                    instance.setOptions(options);
                    return;
                  }                  
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
                  $('.pane-placeholder').remove();
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
        $(widgets).each(function(index) {
        //for(var i = 0; i < widgets.length; i++) {
          var type = panel_apply.widgets[this.type];
          if(!type) {
            instance.dispatchException('Unknown widget type: ' + this.type, 'Pane ' + paneID + ' draw: ');
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
            if(that.id) {
              var id = that.id;
            } else {
              var id = 'widget_' + that.type + '_' + index;
              options.panes[paneID].widgets[index].id = id;
            }
            var __widget = $('<div class="widget '+ that.type + '" id="' + id + '"></div>')
              .css({
                width: options.system.btnwidth * widget_width,
                height: options.system.btnheight * widget_height, 
                left: that.left * options.system.btnwidth, 
                top: that.top * options.system.btnheight
              })
              .attr('top', that.top).attr('left', that.left).attr('index', index)
              .on('show', function() {
                /// при показе подгружаем все скрипты и вызываем функцию прорисовки

              })
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

            var __arguments = [];
            if(type.arguments && type.arguments.length) {
              for(var i = 0; i < type.arguments.length; i++) __arguments.push(type.arguments[i]);
            }
            var __options = {};
            if(that.arguments) {
              $.extend(__options, that.arguments);
            }
            $.extend(__options, {
              save: function(callback) {
                for(var key in __options) {
                  if(key == 'save') continue;
                  options.panes[paneID].widgets[index].arguments[key] = __options[key];
                }
                instance.setOptions(options, undefined, function() {
                  if(callback) callback();
                  /*instance.triggerEvent('options_change_' + that.type, 
                    {options: __options, playerID: instance.currentPlayerID()});*/
                });
              }
            });

            __arguments.push(__options);
            instance[type['callback']].apply(__widget, __arguments);
          }

          if(instance[type.callback]) {
            instance.ready(__widget_init);
          } else {
            instance.loadScript(getFiles(type.file, type.module), __widget_init);
          }
        });
      }
      $('.pane:visible').hide();
      $('.pane-bubble.active').removeClass('active');
      $('#pane-bubble-' + paneID).addClass('active');
      pane.appendTo(document.body);
      instance.triggerEvent('pane_show', paneID);
    }
    // Ловим события о перемещении из других окон
    instance.bind('widget_move', function(data) {
      $('#' + data.id).css({
        left: data.left * options.system.btnwidth,
        top: data.top * options.system.btnheight
      }).attr('left', data.left).attr('top', data.top);
      hold_positions = data.hold_positions;
    });
    /// При клике на body, скрываем всплывашку
    $(document.body).on('click', instance.hideAllPanes);
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
    if((Math.abs(mouseDeltaX) > 0.05 && Math.abs(mouseSpeedX) > 0.01) || Math.abs(mouseSpeedX) > 0.05 ||  $('body > .pane:visible').length > 0) {
      instance.ready(function() {
        activatePane.apply(that, []);
      });
    }
    instance.__mousestart = false;
    mouseDeltaX = 0;
    if(instance.__mousestartTO > 0) {
      clearTimeout(instance.__mousestartTO);
      instance.__mousestartTO = 0;
    }
  }

  /**
  * Функция аналогичная activatePaneCheck(), 
  * только работает для бабблов внизу страницы
  */
  function activateFloorPaneCheck() {
    var that = this;
    if((Math.abs(mouseDeltaY) > 0.05 && Math.abs(mouseSpeedY) > 0.01) || Math.abs(mouseSpeedY) > 0.05 ||  $('body > .pane:visible').length > 0) {
      instance.ready(function() {
        activatePane.apply(that, []);
      });
    }
    instance.__mousestart = false;
    mouseDeltaY = 0;
    if(instance.__mousestartTO > 0) {
      clearTimeout(instance.__mousestartTO);
      instance.__mousestartTO = 0;
    }
  }
  
  function check_settings_button() {
    var have_settings_button;
    for(var i = 0; i < 7; i++) {
      if(options.panes[i] && $.type(options.panes[i].buttons) == 'array') {
        if(!have_settings_button) {
          for(var j = 0; j < options.panes[i].buttons.length; j++) {
            if(options.panes[i].buttons[j].type == 'panel_settings') {
              have_settings_button = true;
              break;
            }
          }
        }
      }
    }
    if(!have_settings_button) {
      /// Если пользователь каким-то образом удалил кнопку настроек, то добавляем её
      for(var i = 6; i >= 0; i--) {
        if(!options.panes[i]) return;
        if((options.panes[i].buttons && options.panes[i].buttons.length) ||
            (options.panes[i].widgets && options.panes[i].widgets.length)) {
          if($.type(options.panes[i].buttons) != 'array') options.panes[i].buttons = [];
          options.panes[i].buttons.push({ 'type': 'panel_settings', 
                                          'left': options.panes[i].width - 1,
                                          'top': options.panes[i].height - 1,
                                          'id': 'panel_settings_0' });
          have_settings_button = true;
          break;
        }
      }
    }
    if(!have_settings_button) {
      /// все кнопки были удалены, добавляем дефолтную 
      /// кнопку настроек в первое пустое окошко
      options.panes[0].buttons = [];
      options.panes[0].buttons.push({ 'type': 'panel_settings', 
                                          'left': options.panes[0].width - 1,
                                          'top': options.panes[0].height - 1,
                                          'id': 'panel_settings_0' });
    }
  }  
  /**
  * Вывод плашек активации
  */
  function draw_pane_bubbles() {
    if(!options || !options.panes || !options.panes.length) return;

    checkTime('draw_pane_bubbles begin');
    check_settings_button();

    for(var i = 0; i < 4; i++) {
      if($.type(options.panes[i]) == 'object') {
        $('<div id="pane-bubble-' + i + '" class="pane-bubble' + (i < 2? ' left': ' right') + (i % 2 > 0? ' bottom': ' top') + '"></div>')
          .mouseover(activatePaneCheck)
          .click(function(e) {
            var that = this;
            instance.ready(function() {
              activatePane.apply(that, [e])
            });
            return false;
          })
          .attr('paneID', i)
          .css({'display': ((options.panes[i].widgets && options.panes[i].widgets.length) + 
                           (options.panes[i].buttons && options.panes[i].buttons.length)) > 0? 
                           '': 'none'})
          .appendTo(document.body);
      }
    }
    for(var i = 4; i < 7; i++) {
      if($.type(options.panes[i]) == 'object') {
        $('<div id="pane-bubble-' + i + '" class="pane-bubble' + (i == 4? ' left': (i == 5? ' center': ' right')) + ' footer"></div>')
          .mouseover(activateFloorPaneCheck)
          .click(function(e) {
            var that = this;
            instance.ready(function() {
              activatePane.apply(that, [e])
            });
            return false;
          })
          .attr('paneID', i)
          .css({'display': ((options.panes[i].widgets && options.panes[i].widgets.length) + 
                           (options.panes[i].buttons && options.panes[i].buttons.length)) > 0? 
                           '': 'none'})
          .appendTo(document.body);
      }
    }
    checkTime('draw_pane_bubbles finish');
  }
  
  var loaderTO;

  function ajaxGoto(href, callback, refresh) {
    if(loaderTO > 0) clearTimeout(loaderTO);
    /// показываем крутилку если запрос длится больше 300 миллисекунд
    loaderTO = instance.setTimeout(function() {
      $(document.body).addClass('ajax-loading');
    }, 300);

    instance.tearDown();
    var i;
    var count = 0;
    var goto_href = href + (href.indexOf('?') > -1? '&ajax': '?ajax');

    prevScrollTop = $(window).scrollTop();
    $.ajax(goto_href, {
      success: function(data) {
        var final_url = xhr.responseURL || href;
        final_url = final_url.replace('&ajax', '').replace('?ajax', '');
        instance.ajaxUpdateContent(data, final_url, false, refresh);
        if(callback) callback();
      },
      error: function() {
        window.location = href;
      }
    });
  }

  var originalData, originalTitle;

  function ajaxifyLinks($links) {
    $links.addClass('ajax').click(function(e) {
      if(e.ctrlKey || e.altKey || e.button != 0) return true;
      var href = $(this).attr('href');
      if(href.indexOf('/battle.php') > -1 || 
         href.indexOf('logout.php') > -1) return true;
      if(document.location.toString().indexOf(href) > -1) return true;
      ajaxGoto(href);
      return false;
    });
  }

  function ajaxifyContent() {
    var selector = 'a[href*="http://' + document.domain + '"]:visible:not(.ajax):not([onclick]):not([target]), a[href*="/"]:visible:not(.ajax):not([onclick]):not([target])';
    ajaxifyLinks($(selector));
    $('*[onclick*="location="]').each(function() {
      var onclick = $(this).attr('onclick');
      var match = onclick.match(/(document|window)\.location=["\']+([^"']+)["\']+/);
      if(match) {
        $(this).attr('onclick', onclick.replace(match[0], '__panel.gotoHref("' + match[2] + '")'));
      }
    });
    $('.broken-form:not(.processed)').each(function() {
      var form_id = $(this).attr('form-id');
      var $form = $(this);
      $('input.form-' + form_id + '[type=submit], ' + 
        'input.form-' + form_id + '[type=image]').click(function() {
        if($(this).attr('onclick')) return true;
        var s_data = $('input.form-' + form_id + ', textarea.form-' + form_id + ', select.form-' + form_id).serializeArray();
        var params = [];
        $.each(s_data, function() {
            params.push(this.name + '=' + __panel.encodeURIComponent(this.value || options.data[this.name]));
        });

        var href = $form.attr('action') || location.href;
        var options = {
          type: String($form.attr('method') || 'post').toLowerCase(),
          success: function(data) {
            if(href == 'object-hdo.php') {
              href = location.href;
            }
            instance.ajaxUpdateContent(data, xhr.responseURL || href);
          }
        };

        options.data = params.join('&');
        $.ajax(href, options);

        return false;
      });

    }).addClass('processed');

    /// Находим все "осиротевшие"" кнопки отправки и привязываем их к формам
    /*$('input[type="submit"]').filter(function() {
      return $(this).closest('form').length == 0;
    }).click(function() {
      var $this = $(this);
      var $forms = $(this).closest('table').find('form');
      if($forms.length == 1) {
        $('<input>', {
          type: 'hidden',
          name: $this.attr('name'),
          value: $this.attr('value')
        }).appendTo($forms);
        $forms.sendForm({
          success: function(data) {
            instance.ajaxUpdateContent(data, xhr.responseURL || $forms.attr('action'));
          }
        });
      } else {
        location.href = location.href;
      }
      return false;
    });*/
  }

  /**
  * Инициализация и отрисовка плавающих виджетов
  */
  function initFloatWidgets(redraw) {
    if(!options || !options.widgets) return;
    var modules = {};
    
    var index = 0;
    $.each(options.widgets, function(index) {
      if(!this.type || !panel_apply.widgets[this.type]) return;
      this.module = panel_apply.widgets[this.type].module;
      var widget = this;
      widget.index = index;
      widget.float = true;
      /// Виджет выводится только на одной странице
      if($.type(widget.only_page_class) == 'string') {
        if(widget.only_page_class != location.pathname) return;
      } else if($.type(widget.only_page) == 'string') {
        if(widget.only_page != location.pathname + location.search) return;
      } else if($.type(widget.blacklist) == 'array') {
        /// виджет не должен выводиться на этой странице
        if(widget.blacklist.indexOf(location.pathname) > -1) return;
      }

      /// Если виджет уже прорисован, выходим
      if($('#float-' + widget.index + '-' + widget.type).length > 0) return;

      instance.loadScript(getFiles(panel_apply.widgets[this.type].file, this.module), function() {
        var type = panel_apply.widgets[widget.type];
        if($.type(instance[type.callback]) == 'undefined') {
          throw('Function ' + type.callback + ' for widget ' + widget.type + ' not found');
        } else {
          var width = (widget.arguments.width || type.width) * options.system.btnwidth;
          var height = (widget.arguments.height || type.height) * options.system.btnheight;
          var $widget = $('<div class="float-widget ' + widget.type + '"></div>')
            .attr('id', 'float-' + widget.index + '-' + widget.type)
            .css({
              left: widget.left,
              top: widget.top, 
              width: width,
              height: height
            })
            .dblclick(function() {
              instance.loadScript('panel/panel_settings.js', function() {
                instance.panel_settings_init(function() {
                  instance.panel_settings_form.apply($widget, [panel_apply.widgets[widget.type], 
                    'float', widget, true]);
                });

              });
            })
            .appendTo(document.body);
          if(widget.left + width> $(window).width()) $widget.css({left: $(window).width() - width - 12});
          if(widget.height + height> $(window).height()) $widget.css({height: $(window).height() - height - 12});

          if(widget.fixed) $widget.addClass('fixed');
          if(widget.no_opacity) $widget.addClass('no-opacity');

          $widget[0].widget = widget;

          var __args = type.arguments || [];

          var __options = {};
          if(widget.arguments && $.type(widget.arguments) == 'object') 
            $.extend(__options, widget.arguments);
          $.extend(__options, {
            save: function(callback) {
              for(var key in __options) {
                if(key == 'save') continue;
                options.widgets[widget.index].arguments[key] = __options[key];
              }
              instance.setOptions(options, undefined, function() {
                if(callback) callback();
                /*instance.triggerEvent('options_change_' + widget.type, 
                  {options: __options, playerID: instance.currentPlayerID()});*/
              });
            }
          });

          __args.push(__options);
          instance[type.callback].apply($widget, __args);
          $widget.mousedown(function(e) {
            if($(e.target).hasClass('float-widget')) var that = $(e.target);
            else var that = $(e.target).parents('.float-widget');
            if(!that.length) return false;
            that.clicked = false;
            // Запуск перетаскивания
            this.mouseDownTO = setTimeout(function() {
              if(that[0].clicked) return false;
              that[0].dragging = true;
              if(that.hasClass('ui-draggable') || e.which != 1) return false;
              instance.loadScript('lib/jquery-ui-1.9.2.custom.min.js', function() {
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
      index++;
    });
    if(!redraw) {
      instance.bind('float_widget_move', function(data) {
        $('#' + data.id).css({
          left: data.left,
          top: data.top
        });
        options.widgets[data.index].left = data.left;
        options.widgets[data.index].top = data.top;
      });
    }
  }
  
  /**
  * Функция скрывания плавающих виджетов для страниц, на которых их не должно быть
  */
  function tearDownFloatWidgets() {
    $.each(options.widgets, function(index) {
      if(!this.type || !panel_apply.widgets[this.type]) return;
      var widget = this;
      widget.index = index;
      widget.float = true;

      var $elem = $('#float-' + widget.index + '-' + widget.type);
      if(!$elem.length) return;

      if($.type(widget.only_page_class) == 'string') {
        if(widget.only_page_class != location.pathname) return $elem.remove();
      } else if($.type(widget.only_page) == 'string') {
        if(widget.only_page != location.pathname + location.search) return $elem.remove();
      } else if($.type(widget.blacklist) == 'array') {
        if(widget.blacklist.indexOf(location.pathname) > -1) return $elem.remove();
      }
    });
  }
  /**
  * Инициализация всего интерфейса
  */
  function initInterface() {
    checkTime('initInterface begin');
    if(document.getElementsByClassName.toString().indexOf('native') == -1) {
      // Prototype переопределяет эту функцию, поэтому возвращаем ей дефолтное состояние
      delete document.getElementsByClassName;
    }
    $(window).focus(function() {
      instance.crossWindow.set('focused', instance.crossWindow.windowID);
    });
    $(window).blur(function() {
      instance.crossWindow.get('focused', function(data) {
        if(data == instance.crossWindow.windowID) {
          instance.crossWindow.set('focused', '');
        }
      });
    });    
    $(window).mousemove(function(e) {
      if(!instance.__mousestart) {
        instance.__mousestart = true;
        instance.__mousestartx = e.clientX;
        instance.__mousestarty = e.clientY;
        mouseDeltaX = 0;
        mouseDeltaY = 0;
        mouseSpeedX = 0;
        mouseSpeedY = 0;
        instance.__mousestartTime = (new Date()).getTime();
        if(instance.__mousestartTO > 0) {
          clearTimeout(instance.__mousestartTO);
          instance.__mousestartTO = 0;
        }
      } else {
        mouseDeltaX = (e.clientX - instance.__mousestartx) /$(window).width();
        mouseDeltaY = (e.clientY - instance.__mousestarty) /$(window).width();
        mouseSpeedX = (instance.__mouseprevx - e.clientX) / (instance.__mousestartTime - (new Date()).getTime());
        mouseSpeedY = (instance.__mouseprevy - e.clientY) / (instance.__mousestartTime - (new Date()).getTime());
        if(instance.__mousestartTO > 0) clearTimeout(instance.__mousestartTO);
        instance.__mousestartTO = instance.setTimeout(function() {
          instance.__mousestart = false;
          mouseDeltaX = 0;
          mouseDeltaY = 0;
          instance.__mousestartTO = 0;
        }, 200);
      }
      instance.__mouseprevx = e.clientX;
      instance.__mouseprevy = e.clientY;
    });
    
    if(environment == 'testing' && location.search.indexOf('gwpanel_pause') != -1) {
      /// отложенный запуск прорисовки виджетов для теста
      instance.onload(function() {
        instance.ready(initFloatWidgets);
      });
      $(function() {
        draw_pane_bubbles();
      });

    } else if(fastInitReady) {
      /// если доступна быстрая инициализиация, то начинаем прорисовывать элементы сразу 
      /// после того как документ становится доступным на запись
      var i = setInterval(function() {
        if(documentIsWriteable()) {
          initFloatWidgets();
          draw_pane_bubbles();
          clearInterval(i);
          checkTime('initInterface finish (fast)');
        }
      }, 5);
    } else {
      // Прорисовка, её нужно выполнять после того как получены все опции и подгружены стили
      instance.ready(function() {
        initFloatWidgets();
        draw_pane_bubbles();
        checkTime('initInterface finish (slow)');
      });
    }
  }
  
  function checkTime(name) {
    var new_timer = (new Date()).getTime();
    //console.log(name + ': ' + '+' + (prev_timer? (new_timer - prev_timer) + ' ms, ': '') + 
    //             (new_timer - timer) + ' ms from start');
    prev_timer = new_timer;
  }

  function documentIsWriteable() {
    if(documentIsWriteable) return documentIsWriteable;
    try {
      var n = document.createTextNode('//gwpanel');
      document.body.appendChild(n);
      document.body.removeChild(n);
      documentIsWriteable = true;
      return true;
    } catch(e) {
      return false;
    }
  }

  function getFiles(f, module) {
    if(!f) return;
    if($.type(f) != 'array') {
      f = [f];
    }
    var result = [];
    $.each(f, function(i, file) {
      if(file.indexOf('/') == -1) {
        file = module + '/' + file;
      }
      if(result.indexOf(file) == -1) {
        result.push(file);
      }
    });
    return result;
  }
  /**
  * Конструктор
  * @param __options - дефолтные настройки панели, хеш
  * @param __panel_apply.buttons - список доступных кнопок
  * @param __panel_apply.widgets - список доступных виджетов
  * @param __baseURL - адрес, откуда запустилась панель
  */
  function Panel2(__env, __baseURL) {
    timer = (new Date()).getTime();
    if(!instance )
       instance = this;
    else return instance;
    try {
      //if(window.frameElement && !window.frameElement.panelContainer) return;
    } catch(e) {}
    
    original_environment = localStorage['gwp2_' + environment] || __env;
    if(location.search.indexOf('gwpanel_test') != -1) {
      environment = 'testing';
    } else {
      environment = original_environment;
    }
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
  }
  
  function __initFunc(ajax) {
    // Инициализация слушателей событий
    if(!ajax) {
      for(var key in panel_apply.events) {
        $(panel_apply.events[key]).each(function(index, type) {
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
            if(options.blacklist && options.blacklist.indexOf(type.callback) > -1) return;
            instance.loadScript(panel_apply.scripts[type.callback], function() {
              if($.type(instance[type.callback]) == 'undefined') {
                throw('Function ' + type + ' in module ' + panel_apply.scripts[type] + ' not found');
              } else {
                instance[type.callback].apply(that, _args);
              }
            });
          }, type.local);
        });
      }
    }
    // Инициализация подгружаемых скриптов
    var pages = [];
    if($.type(panel_apply.pages[location.pathname]) == 'array') {
      pages = panel_apply.pages[location.pathname];
    }
    if($.type(panel_apply.pages['*']) == 'array') {
      for(var i = 0; i < panel_apply.pages['*'].length; i++) {
        if(pages.indexOf(panel_apply.pages['*'][i]) == -1) {
          pages.push(panel_apply.pages['*'][i]);
        }
      }
    }
    $(pages).each(function(index, func) {
      if(
          /// если функция в чёрном списке
          (options.blacklist && options.blacklist.indexOf(func) > -1) ||
          /// или функция по-дефолту отключена и не в белом списке, либо белого списка нет
          (panel_apply.settings[func].default === false 
            && (!options.whitelist || options.whitelist.indexOf(func) == -1))
        ) return;
      var module = panel_apply.settings[func].module;
      instance.loadScript(getFiles(panel_apply.settings[func].file, module), function() {
        if($.type(instance[func]) == 'undefined') {
          throw('Function ' + func + ' in module ' + panel_apply.settings[func].module + ' not found');
        } else {
          var func_options = {};
          try {
            if(!options.settings) {
              options.settings = {};
            }
            if(!options.settings[module]) {
              options.settings[module] = {};
            }
            if(!options.settings[module][func]) {
              options.settings[module][func] = {};
            }
            $.extend(func_options, options.settings[module][func]);
            if($.isEmptyObject(func_options) && panel_apply.settings[func].configure) {
              /// инициализируем опции с дефолтными значениями
              $.each(panel_apply.settings[func].configure, function(option, configure) {
                if($.type(configure.default) != 'undefined') {
                  func_options[option] = configure.default;
                }
              });
            }
            $.extend(func_options, {
              save: function(callback) {
                for(var key in func_options) {
                  if(key == 'save') continue;
                  options.settings[module][func][key] = func_options[key];
                }
                instance.setOptions(options, undefined, function() {
                  if(callback) callback();
                  /*instance.triggerEvent('options_change_' + func, 
                    {options: func_options, playerID: instance.currentPlayerID()});*/
                });
              }
            });
          } catch(e) {
            instance.dispatchException(e);
          }
          instance[func].apply(instance, [func_options]);
        }
      });
    });

    if(window.vote_for_post) {
      window.vote_for_post = function(fid, tid, mid, vote, sign) {
        $('#vote' + mid).load('/messages.php?do_vote=1&fid=' + fid + '&tid=' + 
          tid + '&mid=' + mid + '&vote=' + vote + '&sign=' + sign);
      }
    }
  }

  /******************************
  *******Публичные методы********
  *******************************/

  $.extend(Panel2.prototype, {
    /**
    * Функция инициализации
    * Была вынесена из конструктора потому что если для загрузки 
    * скриптов используется eval(), то при инициализации нам уже нужен
    * объект window.__panel чтобы успешно подгрузить внешние модули
    */
    init: function() {
      domain = document.domain.indexOf('gwpanel.org') > -1? 'gwpanel.org': 'ganjawars.ru';
      /// Если в localStorage на текущем домене есть копия нужных опций, 
      /// то эта функция будет запущена сразу
      /// если копии нет, то сперва получаем опции из контейнера с ganjawars.ru
      checkTime('init_func');

      /// Инициализация тестов если в запросе указан ?gwpanel_test и это не встроенный фрейм
      if(environment == 'testing' && location.search.indexOf('continue') == -1) {
        //alert('test');
        var initTestFunc = function() {
          instance.loadCSS('../../lib/qunit-1.15.0.css');
          var tests = window.panel_tests || [];
          instance.loadScript(tests);
        }
        if(window.opera || 
           original_environment == "staging" || 
           original_environment == "production") {
          $(initTestFunc);
        } else {
          initTestFunc();
        }
      }

      version = parseInt(instance.getCookies()['gwp2_v']) || 1;

      var variantID = environment + '_opts_var_' + instance.currentPlayerID();
      var __local_variant = localStorage['gwp2_' + variantID];
      /// Опции сперва привязываются к окружению (environment), затем к ID игрока
      /// затем к выбранному варианту, если вариант не найден, то выбираем default
      if(__local_variant != null && 
        __local_variant.length > 0) {
        optionsID = environment + '_' + instance.currentPlayerID() + '_' + 
                        JSON.parse(__local_variant);
        var __local_options = localStorage['gwp2_' + optionsID];
        if(__local_options != null && 
           __local_options.length > 0) {
          $.extend(options, JSON.parse(__local_options));
          if($.type(options) == 'object') {
            fastInitReady = true;
          }
        }
      }

      if(document.domain != domain && (
         !instance.getCookies()['gwp2_c'] ||
         instance.getCookies()['gwp2_c'].split('-').indexOf(document.domain.split('.')[0]) == -1
        )) {
        fastInitReady = false;
        /// мы попали сюда потому что где-то были изменены настройки
        /// очищаем все переменные в localStorage начинающиеся с текущего окружения
        for(var key in localStorage) {
          if(key.indexOf('gwp2_' + environment) == 0) {
            delete localStorage[key];
          }
        }
      }

      if(environment == 'testing') {
        fastInitReady = location.search.indexOf('gwpanel_pause') == -1;
      }

      //if($.type(__options) == 'object') $.extend(options, __options);
      //if($.type__panel_apply.buttons) == 'object') panel_apply.buttons = __panel_apply.buttons;
      //if($.type__panel_apply.widgets) == 'object') panel_apply.widgets = __panel_apply.widgets;
  /*    if(!localStorage.options) {
        localStorage.options = JSON.stringify(panelSettingsCollection.default);
        localStorage.options_upd = (new Date).getTime();
      } else if(localStorage.options) {
        try {
          var local_options = JSON.parse(localStorage.options);
        } catch(e) {}
        $.extend(options, local_options);
      }*/
      /// если быстрая инициализация доступна
      checkTime('fastInitReady');
      if(fastInitReady) {
        __initFunc();
        initInterface();
        /// функция загрузки css довольно долгая, так что выполняем её параллельно
        instance.setTimeout(function() {
          instance.loadCSS('panel.css');
        }, 1);
        checkTime('fastInit');
      }

      // Инициализация кросс-доменного хранилища
      // Хранилище нужно для того, чтобы на всех поддоменах был доступ к localStorage
      // на домене www.ganjawars.ru
      // Если не будет хранилища, то мы никак не сможем например с quest.ganjawars.ru получить 
      // настройки и события с других страниц, и даже тупо не сможем проверить почту чтобы вывести
      // уведомления
      instance.crossWindow = new __crossWindow(
                                    original_environment == 'testing' || original_environment == 'dev'? 
                                    '/tmp/panelcontainer.html':
                                    '/tmp/panel2container.html', function() {
        initialized = true;
        windowID = instance.crossWindow.windowID;
        instance.__load = function() {
          checkTime('initialization Begin');
          $(initializeStack).each(function() {
            try {
              this();
            } catch(e) {
              instance.dispatchException(e);
            }
          });
          checkTime('initialization Finish');
          instance.__load = null;
        }
        if(environment == 'testing' && location.search.indexOf('gwpanel_pause') != -1) {
          instance.__ready = __initFunc;
        } else {
          instance.setTimeout(instance.__load, 1);
        }
      }, domain);
      checkTime('crossWindow init');
      /// функция полной готовности окна
      instance.get(variantID, function(__variant) {
        //parent.console.log('variantID: ', variantID);
        checkTime('get variantID ' + variantID);
        if(!__variant) {
          checkTime('set default variant for ' + __variant);
          instance.set(variantID, 'default');
          if(domain != document.domain) {
            localStorage['gwp2_' + variantID] = JSON.stringify('default');
          }
          __variant = 'default';
        }
        optionsID = environment + '_' + instance.currentPlayerID() + '_' + __variant;
        instance.get(optionsID, function(__options) {
          checkTime('get optionsID ' + optionsID);
          //parent.console.log('optionsID: ', optionsID);
          if(__options != null && $.type(__options) == 'object') {
            if(!fastInitReady) {
              options = $.extend(options, __options);
              var domainPrefix = document.domain.split('.')[0];
              var cachedDomains = instance.getCookies()['gwp2_c'] || '';
              cachedDomains = cachedDomains.split('-');
              if(cachedDomains.indexOf(domainPrefix) == -1) {
                cachedDomains.push(domainPrefix);
                instance.setCacheDomains(cachedDomains);
              }

              if(domain != document.domain) {
                localStorage['gwp2_' + optionsID] = JSON.stringify(options);
              }
            }
          } else {
            /// Вызываем мастер настроек
            if(document.domain.indexOf('ganjawars.ru') > -1 && environment != 'testing' && !instance.getCookies()['gwp2_mc']) {
              instance.loadScript('panel/panel_master.js', function() {
                instance.panel_master();
              });
            } else {
              /// дефолтные настройки
              options = $.extend(options, window.panelSettingsCollection.default);
              instance.set(optionsID, options);
            }
          }

          if(environment == 'testing' && location.search.indexOf('gwpanel_pause') != -1) {
                  /// задержка инициализации, чтобы тесты могли встроить дополнительные функции
            instance.__ready = __initFunc;
            //console.log('gwpanel_pause __ready');
          } else if(!fastInitReady) {
            /// медленная инициализация
            __initFunc();
          }
          is_ready = true;
          checkTime('panel ready stack launch');

          $(readyStack).each(function() {
            try {
              this();
            } catch(e) {
              instance.dispatchException(e);
            }
          });
          checkTime('panel ready stack finished');
        });
      });
      checkTime('crossWindow init complete');

      checkTime('crossWindow create');

      // следим за сменой опций из других окон
      instance.bind('options_change', function(data) {
        if(data.optionsID == optionsID && data.windowID != windowID && 
           data.playerID == instance.currentPlayerID()) {
          $.extend(options, data.options);
        }
      });
      
      $(document.body).addClass(window.location.pathname.replace(/\./g, '-').replace(/\//g, '_').substr(1));
      if(location.hostname != 'www.ganjawars.ru') {
        var href = location.href;
        if(href.charAt(location.href.length - 1) == '?' || href.charAt(location.href.length - 1) == '&')
          href = location.href.substr(0, location.href.length - 1);
        window.parent.postMessage(JSON.stringify({'type': 'frame', 'title': document.title, 'href': href}), '*');
      }

      if(!fastInitReady) {
        instance.loadCSS('panel.css');
        initInterface();
      }

      instance.onload(function() {
        instance.get('cacheListeners', function(data) {
          cacheListeners = data || {};
          $.each(cacheListeners, function(__event, listeners) {
            /// слушаем событие event
            instance.bind(__event, function() {
              for(var i = 0; i < listeners.length; i++) {
                /// удаляем все записи
                instance.del(listeners[i]);
                listeners.splice(i, 1);
              }
              /// Удаляем всех слушателей
              delete cacheListeners[__event];
              instance.set('cacheListeners', cacheListeners);
            });
          });
        });

        /// Проверка обновлений
        instance.getCached(instance.checkVersion, function(new_version) {
          if(new_version != version) {
            instance.updateVersion(new_version);
          }
        }, 1800);
      });

      var _orgAjax = jQuery.ajaxSettings.xhr;
      jQuery.ajaxSettings.xhr = function () {
        xhr = _orgAjax();
        var origonreadystatechange = xhr.onreadystatechange;
        xhr.onreadystatechange = function() {
          if(origonreadystatechange) origonreadystatechange();
        }
        return xhr;
      };

    },
    /**
    * Обработка исключений. Если есть консоль, то выводим в консоль.
    */
    dispatchException: function(e, comment) {
      if(environment != 'production') throw e;
      if(window.console) {
        console.log((comment? comment + " on ": '') + 
                    ((new Error).stack || arguments.callee.toString()).split("\n")[1]);
        console.log(e);
      }
    },
    
    /**
    * Загрузка CSS-файла
    * @param name - название таблицы стилей (путь)
    * @param name - название таблицы стилей, пока не используется
    */
    loadCSS: function(name, callback, failover) {
      if($.type(name) != 'array') {
        name = [name];
      }

      var to_load = [];
      var loaded = 0;

      for(var i = 0; i < name.length; i++) {
        if($.type(stylesheets[name[i]]) != 'undefined') {
          /// запись скрипта не инициализирована
          if(stylesheets[name[i]].loaded) {
            /// скрипт уже был загружен, загружать не нужно
            loaded++;
          } else if(name.length == 1 && callback) {
            /// скрипт был добавлен в очередь загрузки и параллельно загружается где-то ещё,
            /// загружать его не нужно, но выполнить действие нужно если производится
            /// одиночная загрузка этого скрипта
            stylesheets[name[i]].callbacks.push(callback);
          }
          continue;
        }
        stylesheets[name[i]] = {callbacks: [], failovers: [], loaded: false};
        if(name.length == 1) {
          /// Если подгружается только этот скрипт, то добавляем функцию обратного
          /// вызова в список вызовов этой функции, чтобы в случае параллельного
          /// массового вызова, этот callback тоже отработал
          if(callback) stylesheets[name[i]].callbacks.push(callback);
          if(failover) stylesheets[name[i]].failovers.push(failover);
        }

        var ar = name[i].split('/');
        if(environment != 'deploy' && environment != 'dev' && 
            ar[0] == '..' && ar[1] == '..' && ar[2] == 'lib') {
          ar = ar.splice(2);
          var path = ar.join('/');
        } else {
          var path = 'themes/' + options.system.theme + '/' + name[i];
        }

        to_load.push(path);
      }

      if(!to_load.length) {
        if(name.length == 1 && stylesheets[name[0]].loaded) {
          /// Загружать нечего, просто запускаем callback
          try {
            if(callback) callback();
          } catch(e) {
            if(failover) failover();
          }
        }
        return;
      }
      window.__loadCSS(to_load, 
        function() { 
          if(name.length > 1) {
            /// отработал массовый вызов
            /// проходим по всем скриптам и выполяем обратные вызовы для скриптов,
            /// которые ещё не были отмечены как загруженные
            for(var i = 0; i < name.length; i++) {
              instance.loadCSSComplete(name[i]);
            }
            try {
              /// выполняем основной callback
              if(callback) callback();
            } catch(e) {
              if(failover) {
                failover();
              }
            }
          } else {
            /// отработал одиночный вызов
            instance.loadCSSComplete(name[0]) 
          }
        },
        function(e) {
          if(name.length > 1) {
            /// отработал массовый вызов
            /// проходим по всем скриптам и выполяем обратные вызовы
            for(var i = 0; i < name.length; i++) {
              instance.loadCSSFail(name[i]);
            }
            if(failover) failover();
          } else {
            /// отработал одиночный вызов
            instance.loadCSSFail(name[0]) 
          }
        }
      );
      return;
    },
    
    /**
    * Подгрузка юзер-скрипта или нескольких скриптов
    * @param name - путь к скрипту, например "home/home.js", либо массив,
    *               например ["map/map.js", "npc/nps_widget.js"]
    * @param callback - функция, которую следует запустить после загрузки
                        скрипта, либо всех скриптов если указан массив
    */
    loadScript: function(name, callback, failover) {
      if($.type(name) != 'array') {
        name = [name];
      }

      var to_load = [];
      var loaded = 0;

      for(var i = 0; i < name.length; i++) {
        if($.type(scripts[name[i]]) != 'undefined') {
          /// запись скрипта не инициализирована
          if(scripts[name[i]].loaded) {
            /// скрипт уже был загружен, загружать не нужно
            loaded++;
          } else if(name.length == 1 && callback) {
            /// скрипт был добавлен в очередь загрузки и параллельно загружается где-то ещё,
            /// загружать его не нужно, но выполнить действие нужно если производится
            /// одиночная загрузка этого скрипта
            scripts[name[i]].callbacks.push(callback);
          }
          continue;
        }
        scripts[name[i]] = {callbacks: [], failovers: [], loaded: false};
        if(name.length == 1) {
          /// Если подгружается только этот скрипт, то добавляем функцию обратного
          /// вызова в список вызовов этой функции, чтобы в случае параллельного
          /// массового вызова, этот callback тоже отработал
          if(callback) scripts[name[i]].callbacks.push(callback);
          if(failover) scripts[name[i]].failovers.push(failover);
        }
        to_load.push(name[i]);
      }

      if(!to_load.length) {
        if(loaded == name.length) {
          /// Загружать нечего, просто запускаем callback
          try {
            if(callback) callback();
          } catch(e) {
            if(failover) failover();
            instance.dispatchException(e);
          }
        }
        return;
      }
      instance.isLoading++;
      window.__loadScript(to_load, 
        function() { 
          instance.isLoading--;
          if(name.length > 1) {
            /// отработал массовый вызов
            /// проходим по всем скриптам и выполяем обратные вызовы для скриптов,
            /// которые ещё не были отмечены как загруженные
            for(var i = 0; i < name.length; i++) {
              instance.loadScriptComplete(name[i]);
            }
            try {
              /// выполняем основной callback
              if(callback) callback();
            } catch(e) {
              if(failover) {
                failover();
              }
              instance.dispatchException(e);
            }
          } else {
            /// отработал одиночный вызов
            instance.loadScriptComplete(name[0]) 
          }
        },
        function() {
          instance.isLoading--;
          /// отработал одиночный вызов
          instance.loadScriptFail(name, arguments);
          if(name.length > 1) {
            if(failover) failover();
          }
        }
      );
    },
    
    /**
    * Обработчик окончания загрузки скрипта
    * @param name - путь скрипта, например "home/home.js"
    */
    loadScriptComplete: function(name) {
      if(scripts[name].loaded) return;
      scripts[name].loaded = true;
      for(var i = 0; i < scripts[name].callbacks.length; i++) {
        try {
          scripts[name].callbacks[i]();
        } catch(e) {
          instance.dispatchException(e, 'loadScript ' + name + ' callback error: ');
        }
      }
    },
    
    /**
    * Обработчик ошибки загрузки скрипта
    * @param name - путь скрипта, например "home/home.js"
    */
    loadScriptFail: function(names, e) {
      if($.type(names) != 'array') {
        names = [names];
      }
      if(console.log) console.log('Failed to load script(s) "' + names.join(', ') + 
                                    '"', e);
      for(var i = 0; i < names.length; i++) {
        var name = names[i];
        scripts[name].fail = true;
        instance.failedScripts.push(name);
        for(var j = 0; j < scripts[name].failovers.length; j++) {
          try {
            scripts[name].failovers[j]();
          } catch(e) {
            instance.dispatchException(e, 'failoverScript callback error: ');
          }
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
    checkFocused: function(callback, failure) {
      instance.crossWindow.get('focused', function(data) {
        //parent.console.log('focused: ' + data, 'this: ', instance.crossWindow.windowID);
        if(instance.crossWindow.windowID == data) {
          try {
            callback();
          } catch(e) {
            instance.dispatchException(e, 'Focused callback error: ');
          }
        } else {
          if(failure) failure();
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
    set: function(key, value, callback, playerUnique) {
      if(playerUnique) {
        key = instance.currentPlayerID() + '_' + key;
      }
      if(['options'].indexOf(key) != -1) {
        throw('Error: you can\'t set protected property directly');
      }
      /// Если значение есть на текущем домене, то выставляем и его
      if(document.domain == 'ganjawars.ru') {
        localStorage['gwp2_' + key] = JSON.stringify(value);
        if(callback) callback();
        return;
      } else if($.type(localStorage['gwp2_' + key]) != 'undefined') {
        localStorage['gwp2_' + key] = JSON.stringify(value);
      }

      var __callback = function() {
        /// выставляем на текущий домен чтобы затем сразу возвращать
        localStorage['gwp2_' + key] = JSON.stringify(value);
        if(callback) callback();
      }
      //console.log('initialized: ', initialized);
      //console.log('window set', key, value);
      if(initialized) {
        //console.log('set because initialized: ', initialized);
        instance.crossWindow.set(key, value, __callback);
      } else {
        instance.onload(function() {
          //console.log('set after onload: ', initialized);
          instance.crossWindow.set(key, value, __callback);
        });
      }
    },
    
    /**
    * Считывание значения из хранилища
    * @param key - название переменной
    * @param callback - функция, которая будет вызвана после считывания значения
    * в эту функцию первым аргументом передаётся считанное значение
    */
    get: function(key, callback, playerUnique) {
      if(playerUnique) {
        key = instance.currentPlayerID() + '_' + key;
      }
      checkTime('get ' + key);
      /// Пытаемся найти значение на текущем домене
      if(document.domain == 'ganjawars.ru') {
        try {
          var val = JSON.parse(localStorage['gwp2_' + key]);
          return callback(val);
        } catch(e) {
          instance.dispatchException(e);
        }
        callback(null);
        return;
      } else if($.type(localStorage['gwp2_' + key]) != 'undefined') {
        try {
          var val = JSON.parse(localStorage['gwp2_' + key]);
          checkTime('get ' + key + ' from local storage');
          callback(val);
          return;
        } catch(e) {
          console.log(e);
          localStorage.removeItem('gwp2_' + key);
        }
      }
      var __callback = function(value) {
        if(document.domain != 'ganjawars.ru') {
          localStorage['gwp2_' + key] = JSON.stringify(value);
        }
        if(callback) callback(value);
      }
      /// Если на текущем домене нет, то запрашиваем из основного
      checkTime('begin to get ' + key + ' from main storage');
      if(initialized) {
        instance.crossWindow.get(key, __callback);
      } else {
        instance.onload(function() {
          instance.crossWindow.get(key, __callback);
        });
      }
    },
    
    /**
    * Удаление значения из хранилища
    * @param key - название переменной
    * @param callback - функция, которая будет вызвана после удаления значения
    */    
    del: function(key, callback, playerUnique) {
      if(playerUnique) {
        key = instance.currentPlayerID() + '_' + key;
      }
      if($.type(localStorage['gwp2_' + key]) != 'undefined') {
        delete localStorage['gwp2_' + key];
      }
      //console.log('panel del ' + key, localStorage['gwp2_' + key]);
      if(initialized) {
        instance.crossWindow.del(key, callback);
      } else {
        instance.onload(function() {
          instance.crossWindow.del(key, callback);
        });
      }
    },
    /**
    * Запуск события
    * @param type - название события
    * @param data - данные, в любом виде - объект/хеш/массив/строка
    * @param local - флаг локального события, если =true, 
    *                то событие отработает только в текущем окне
    */
    triggerEvent: function(type, data, local) {
      if(instance.crossWindow) {
        return instance.crossWindow.triggerEvent(type, data || {}, local);
      } else {
        instance.ready(function() {
          instance.crossWindow.triggerEvent(type, data || {}, local);
        });
      }
    },
    
    /**
    * Привязка к событиям
    * @param type - название события
    * @param callback - слушатель события
    *                   первым аргументом в слушатель события передаются данные
    * @return listenerID - идентификатор слушателя (для отвязки)
    */
    bind: function(type, callback) {
      if(instance.crossWindow) {
        return instance.crossWindow.bind(type, callback);
      } else {
        /// Генерируем ID привязки самостоятельно
        var callerFunc = ((new Error).stack || arguments.callee.toString()).split("\n")[1] || 'anonymous';
        var listenerID = (callerFunc.substring(0, callerFunc.indexOf("@")).replace(/[<>]+/g, '') 
                          || "anoynmous") + '_' + (new Date).getTime() + '_preinit';
        if(!listenersStack[type]) listenersStack[type] = {};
        var index = 0;
        while(listenersStack[type][listenerID]) {
          listenerID += index++;
        }

        instance.ready(function() {
          return instance.crossWindow.bind(type, callback, listenerID);
        })
      }
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

    setOptionsID: function(id) {
      optionsID = id;
    },
    /**
    * Установка опций
    * @param set_options - хеш всех опций либо для конкретного модуля,
    *                      если указан namespace
    * @param namespace - строка, название модуля или пространства имён,
    *                    в котором хранятся указанные опции
    */
    setOptions: function(set_options, namespace, callback) {
      instance.ready(function() {
        if($.type(optionsID) == 'undefined') {
          console.log('wrong optionsID: ' + optionsID);
          console.log((new Error).stack);
          return;
        }
        if(namespace && $.type(namespace) != 'undefined') {
          options[namespace] = set_options;
        } else {
          options = set_options;
        }
        var new_options = {};
        for(var key in options) {
          var type = $.type(options[key]);
          if(type != 'undefined' && options[key] !== null) {
            new_options[key] = options[key];
          }
        }
        options = new_options;
        check_settings_button();

        instance.set(optionsID, options, function() {
          instance.triggerEvent('options_change', {options: options, 
                                optionsID: optionsID, windowID: windowID,
                                playerID: instance.currentPlayerID()});
          if(callback) {
            callback();
          }
        });
      });
      /// Очищаем кеш быстрой загрузки, чтобы быстрые настройки везде сохранились
      instance.setCacheDomains([]);
    },
    
    /**
    * Установка опций виджета
    * @param set_options - хеш опций
    * @param widget - jQuery-объект виджета, для которого нужно установить опции
    */
    setWidgetOptions: function(set_options, widget) {
      if(widget[0].widget.float) {
        $.extend(options.widgets[widget[0].widget.index].arguments, set_options);
      } else {
        $.extend(options.panes[widget[0].widget.paneID].widgets[widget[0].widget.index].arguments, set_options);
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
    gotoHref: function(href, callback) {
      if(callback) callback();
      if(contentFrame) {
        contentFrame.contentWindow.postMessage(JSON.stringify({'type': 'location', 'href': href}), '*');
        $('.pane:visible').hide();
        $('.pane-bubble.active').removeClass('active');
      } else {
        location.href = href;
      }
    },
    
    /**
    * Метод для запуска функции по готовности работы панели
    * @param callback - функция для запуска
    * Пример:
    * __panel.ready(function() {
    *   alert("Панель готова к работе");
    * });
    */
    ready: function(callback) {
      if(is_ready) {
        try {
          callback();
        } catch(e) {
          console.log((new Error).stack);
          instance.dispatchException(e);
        }
      } else {
        readyStack.push(callback);
      }
    },

    /**
    * Метод для запуска функции по окончании полной инициализации панели, включая фрейм
    * @param callback - функция для запуска
    * Пример:
    * __panel.ready(function() {
    *   alert("Панель готова к работе");
    * });
    */
    onload: function(callback) {
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
    
    onunload: function(callback) {
      tearDownStack.push(callback);
    },
    /**
    * Функция возвращает абсолютный путь к текущей теме
    */
    path_to_theme: function() {
      return baseURL + '/themes/' + options.system.theme + '/';
    },

    base_url: function() {
      return baseURL;
    },
    /*
    * Функция возвращает куки в виде хеша
    * @return хеш кук
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
      return instance.getCookies()['au'] || instance.getCookies()['uid'];
    },

    /**
    * Функция возвращает имя текущего игрока
    * @param callback - метод, вызываемый после получения имени
    * использование: 
    * __panel.currentPlayerName(function(name) {
    *   ...
    * })
    */
    currentPlayerName: function(callback) {
      instance.get('currentPlayerName', callback);
    },

    /**
    * Обработчик для домашней странички
    */
    panel_homepage: function(){
      var name, id;
      if(location.search == "?logged"){
        name = $('a[href*="info.php?id="]').get(0).textContent;
        id = instance.currentPlayerID();
        instance.set("currentPlayerName", name);
        instance.triggerEvent("login", {"currentPlayerName": name, "currentPlayerID": id});
        $.ajax('http://' + document.domain + '/syndicates.php', {
          success: function(data) {
            if($(data).find('li a[href$="/syndicate.php?id=5787"]').length) {
              instance.set('haveServerSync', true);
            }
          }
        });
      }
    },

    /**
    * Обработчик события входа игрока в игру
    */
    panel_login: function(){
      var name, id;
      name = "__notLogged";
      id = -1;
      instance.set("panel_currentPlayerName", name);
      instance.triggerEvent("logout", {"currentPlayerName": name, "currentPlayerID": id});
    },

    /**
    * Функция выставления окружения
    * @param env - строка, название окружения
    * возможные значения: 
    *  -dev - режим разработки
    *  -production - боевой режим
    *  -deploy - режим для тестирования и вылавливания багов перед релизом на production
    *  -testing - этот режим используется в тестах, чтобы настройки и пр. были изолированы
    *             от других окружений
    */
    setEnv: function(env) {
      var possible_values = ['dev', 'production', 'staging', 'deploy', 'testing'];
      if(!possible_values.indexOf(env) == -1) {
        return console.log('Possible environments: ' + possible_values.join(', '));
      }
      environment = env;
      var myDate = new Date();
      myDate.setMonth(myDate.getMonth() + 120);
      document.cookie = "gwp2_e=" + env + ";expires=" + myDate 
                     + ";domain=." + domain + ";path=/";
      console.log('Reload page to commit environment change');
    },
    /**
    * Функция получения текущего окружения
    */
    getEnv: function() {
      return environment;
    },

    /*
    * Функция удаления всех данных панели
    */
    wipeAll: function() {
      if(confirm("Вы действительно хотите удалить все данные GWPanel 2?\n\
                Будут удалены ВСЕ ваши настройки, статистика, журналы.")) {
        for(var key in localStorage) {
          if(key.indexOf('gwp2_') == 0) {
            localStorage.removeItem(key);
          }
        }
      }
    },

    /**
    * Функция для отображения сообщения пользователю
    * @param text - текст сообщения
    * @param type - тип: message, warning, error
    * @param timeout - время отображения, в миллисекундах.
    * Если не указано, то выводится на 20 секунд.
    */
    showFlash: function(text, type, timeout) {
      var types = ['message', 'warning', 'error'];
      if(types.indexOf(type) == -1) type = 'message';

      var alreadyShown;
      $('.panel-flash:visible').each(function() {
        $(this).animate({bottom: parseInt($(this).css('bottom')) + 50});
      });

      var flash = $('<div class="panel-flash"></div>').css({bottom: -40}).addClass(type).html(text)
        .appendTo(document.body).animate({bottom: 20}).click(function() {
          $(this).fadeOut(function() {
            $(this).remove();
          });
        });
      /// таймаут скрытия по-умолчанию
      if(!timeout) timeout = 20000;
      instance.setTimeout(function() {
        flash.animate({bottom: parseInt(flash.css('bottom')) + 300},
          { duration: 200, queue: false });
        flash.fadeOut(100, function() {
          $(this).remove();
        });
      }, timeout);
    },

    clearTimeouts: function (w) {
      if(!w) w = window;
      var s = w.setTimeout('void 0;', 1000);
      for(var i = s; i > s - 100; i--) {
        if(safeIntervals.indexOf(i) == -1) {
          w.clearTimeout(i);
        }
      };
      var s = w.setInterval('void 0;', 1000);
      for(var i = s; i > s - 100; i--) {
        if(safeIntervals.indexOf(i) == -1) {
          w.clearInterval(i);
        }
      };
    },

    /**
    * Функция проверки свободных мест
    * @param paneID - порядковый номер окна, от 0 до 3
    * @param widget - данные виджета
    * @return массив [x, y] - место для виджета, либо false если места не нашлось
    */
    checkPanePlaces: function(paneID, widget) {
      var element_height = widget.height || 1;
      var element_width = widget.width || 1;

      var p_options = instance.getOptions().panes[paneID] || {};
      if(!p_options.buttons) p_options.buttons = [];
      if(!p_options.widgets) p_options.widgets = [];

      var new_top = 0;
      var new_left = 0;
      var place_found = false;
      var hold = {};
      for(var i = 0; i < p_options.buttons.length; i++) {
        if(!hold[p_options.buttons[i].top]) 
          hold[p_options.buttons[i].top] = {};
        hold[p_options.buttons[i].top][p_options.buttons[i].left] = p_options.buttons[i].id || 1;
      }
      for(var i = 0; i < p_options.widgets.length; i++) {
        var _w_height = p_options.widgets[i].height || 
                        panel_apply.widgets[p_options.widgets[i].type].height;
        var _w_width = p_options.widgets[i].width || 
                       panel_apply.widgets[p_options.widgets[i].type].width;

        for(var __top = p_options.widgets[i].top; __top < p_options.widgets[i].top + _w_height; __top++) {
          if(!hold[__top]) 
            hold[__top] = {};
          for(var __left = p_options.widgets[i].left; __left < p_options.widgets[i].left + _w_width; __left++) {
            hold[__top][__left] = p_options.widgets[i].id || 1;
          }
        }
      }
      start:
      for(new_top = 0; new_top < p_options.height - element_height + 1; new_top++) {
        for(new_left = 0; new_left < p_options.width - element_width + 1; new_left++) {
          var new_pane_not_empty = false;
          checkout_new_pos:
          for(var __top = new_top; (new_top + element_height) > __top; __top++) {
            for(var __left = new_left; (new_left + element_width) > __left; __left++) {
              if(!hold[__top]) continue;
              if(hold[__top] && hold[__top][__left] && hold[__top][__left] != widget.id) {
                new_pane_not_empty = true;
                break checkout_new_pos;
              }
            }
          }
          if(!new_pane_not_empty) {
            /// место свободно, всё хорошо
            place_found = true;
            break start;
          }
        }
      }
      if(place_found) {
        return [new_top, new_left];
      }
      return false;
    },

    /**
    * Функция прорисовки плавающих виджетов
    * прорисовывает виджеты, которые ещё не были прорисованы
    */
    redrawFloatWidgets: function() {
      initFloatWidgets(true);
    },

    /**
    * Метод конвертации числа в денежную строку игры
    * @param money - любая строка или число
    */
    convertingIntToMoney: function(money){
      var result, _money;
      if(typeof money == 'string' || typeof money == 'number'){
        _money = parseInt(money, 10);
        if(!isNaN(_money)){
          result = "";
          _money = Math.abs(_money).toString();
          for(var i = _money.length, j = 0; i >= 0; i--, j++){
            if(j % 3 == 0 && j != 0 && i != 0){
              result = ',' + _money.charAt(i) + result;
            } else {
              result = _money.charAt(i) + result;
            }
          }
          if((money < 0) || (typeof money == 'string' && money.charAt(0) == "-")) result = "-" + result;
          result = "$" + result;
        } else {
          result = false;
        }
      } else {
        result = false;
      }
      return result;
    },

    /**
     * Метод конвертации денежной строки в число
     * @param money - любая строка или число
     */
    convertingMoneyToInt: function(money){
      var result;
      if(typeof money == 'string'){
        result = money.match(/[0-9\$\-\., ]+/);
        if(result != null && result[0].length == money.length){
          result = money.replace(/,|\$|\.| |-|/g, '');
          result = Number(result);
          if(money.search(/-\$|\$-/)!= -1) result = result * -1;
        } else {
          result = false;
        }
      } else if(typeof money == 'number'){
        result = parseInt(money, 10);
      } else {
        result = false;
      }
      return result;
    },

    /**
     * Метод для кеширования данных
     * @param generator {function} - функция-генератор данных
     *   в эту функцию первым параметром передаётся callback, который вы должны вызвать
     *   когда получите и обработаете данные, и первым аргументом передать эти данные
     *   После этого эти данные кладутся в кеш, и при повторном вызове вернутся из кеша
     * @param callback {function} - функция, которую нужно вызвать когда данные получены,
     *   в ней вы должны осуществлять прорисовку, вывод и т.д.
     * @param condition {string|int} - таймаут в секундах или строка - имя события
     *   Если указано число, то кеш будет лежать указанное кол-во секунд, когда указанное
     *   время истечёт, кеш будет получен и записан заново.
     *   Если указана строка, то кеш будет сброшен после наступления этого события.
     */
    getCached: function(generator, callback, condition) {
      var cid = 'cached_' + generator.toString().replace(/[\n\s\t]/g, '').hashCode();
      instance.get(cid, function(data) {
        instance.get('cacheListeners', function(__listeners) {
          cacheListeners = __listeners || {};
          //console.log('getCached cid=', cid, 'data=', data);
          if(!condition || $.type(data) == 'null' || 
            (data.type == 'time' && data.expiration < (new Date).getTime())
            ) {
            /// Генерируем
            data = {
              type: isNaN(condition)? 'event': 'time'
            };
            var runFunc = function() {
              /// запускаем генератор
              generator(function(generated_data) {
                data.data = generated_data;
                /// Записываем данные
                //console.log('setCached, cid=', cid, 'data=', data);
                instance.set(cid, data, function() {
                  callback(data.data);
                });
              });
            }
            if(data.type == 'time') {
              data.expiration = (new Date).getTime() + condition * 1000;
              runFunc();
            } else {
              /// Устанавливаем слежку за событием
              instance.bind(condition, function() {
                instance.del(cid);
              });
              /// Добавляем запись кеша к слушателям кеша
              if(!cacheListeners[condition]) cacheListeners[condition] = [];
              if(cacheListeners[condition].indexOf(cid) == -1) {
                cacheListeners[condition].push(cid);
                instance.set('cacheListeners', cacheListeners, function() {
                  //console.log('listeners changed: ', JSON.stringify(cacheListeners));
                  runFunc();
                });
              } else {
                runFunc();
              }
            }
          } else {
            /// данные в кеше есть и они не истекли, вызываем обратную функцию, 
            /// однако проверяем массив cacheListeners, вызов должен быть в массиве
            if(!cacheListeners[condition]) cacheListeners[condition] = [];
            if(cacheListeners[condition].indexOf(cid) == -1) {
              cacheListeners[condition].push(cid);
              instance.set('cacheListeners', cacheListeners, function() {
                //console.log('listeners changed: ', JSON.stringify(cacheListeners));
                callback(data.data);
              });
            } else {
              callback(data.data);
            }
          }
        });
      });
    },

    /**
    * Функция удаления данных из кеша
    */
    clearCached: function(generator, callback) {
      var cid = 'cached_' + generator.toString().replace(/[\n\s\t]/g, '').hashCode();
      //console.log('clearCached, cid:', cid);
      instance.get('cacheListeners', function(__listeners) {
        cacheListeners = __listeners || {};
        //console.log('cleanup listeners before: ', JSON.stringify(cacheListeners));
        var cleaned = false;
        for(var condition in cacheListeners) {
          var i = cacheListeners[condition].indexOf(cid);
          if(i > -1) {
            cacheListeners[condition].splice(i, 1);
            if(cacheListeners[condition].length == 0) {
              delete cacheListeners[condition];
            }
            cleaned = true;
          }
        }
        //console.log('cleanup listeners after: ', JSON.stringify(cacheListeners), 'cleaned: ', cleaned);
        if(cleaned) {
          instance.set('cacheListeners', cacheListeners, function() {
            instance.del(cid, callback);
          });
        } else {
          instance.del(cid, callback);
        }
      });
    },
    /**
    * Функция проверки последней версии
    */
    checkVersion: function(callback) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = baseURL + '/release/version_' + environment + '.js?' + (new Date).getTime();
      s.addEventListener('load', function() {
        if(callback) callback(window.current_panel_version);
      }, false);
      document.getElementsByTagName("head")[0].appendChild(s);

      /// проверка stage
      if(environment == 'staging') {
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = baseURL + '/release/stage.js?' + (new Date).getTime();
        s.addEventListener('load', function() {
          if(instance.getCookies().gwp2_st != window.current_panel_stage) {
            instance.showFlash('В скриптах что-то поменялось, сейчас будут загружены изменения');
            window.__clearCache();
          }
        }, false);
        document.getElementsByTagName("head")[0].appendChild(s);
      }
    },

    /**
    * Функция обновления
    */
    updateVersion: function(new_version, callback) {
      var old_version = version;
      /// Очищаем предыдущий пакет
      if(window.__clearCache) window.__clearCache();
      /// очищаем кеш версии
      instance.clearCached(instance.checkVersion);

      /// Получаем release notes
      var release_path = baseURL + '/release';

      var loaded = 0;
      instance.get('release_notes', function(notes) {
        /// проходим по каждой версии, которые мы ещё не получали 
        var versions = [];

        for(var version_index = old_version + 1; version_index <= new_version; version_index++) {
          versions.push(version_index); 
        }
        $.each(versions, function(i, version_index) {
          str_version = String(version_index);
          var path = release_path; 
          for(var i = 0; i < str_version.length; i++) {
            path += "/" + str_version.charAt(i);
          }
          path += "/" + str_version + ".notes.js";
          var s = document.createElement('script');
          s.type = 'text/javascript';
          s.src = path;
          s.addEventListener('load', function() {
            notes = notes || {};
            notes[version_index] = {
              notes: window.panel_release_notes[version_index] || 'не указано',
              date: window.panel_release_date[version_index]
            }
            /// если в notes есть миграции, то выполняем их все  
            if($.type(window.panel_release_migration) == 'array'
                && window.panel_release_migration.length > 0) {
              for(var m = 0; m < window.panel_release_migration.length; m++) {
                try {
                  window.panel_release_migration[m]();
                  delete window.panel_release_migration[m];
                } catch(e) {
                  /// что же делать в случае корявой миграции?
                  if(window.console) console.log('Bad migration: ' + e);
                }
              }
            }
            if(callback) callback(notes[version_index], version_index);

            loaded++;

            if(loaded >= new_version - old_version) {
              /// всё обновлено до последней версии
              __panel.showFlash('Произошло обновление системы. Новая версия: ' 
                + new_version + '.' + 
                ($('#panel-settings-editor:visible').length? '': 
                  '<br />Посмотреть <a href="#release-notes" onclick="__panel.loadScript(&quot;panel/panel_settings.js&quot;, function() { __panel.panel_settings_editor(&quot;release_notes&quot;); }); return false;">заметки к выпуску</a>.'), 
                'message');
              instance.set('release_notes', notes);
              /// Выставляем версию
              version = new_version;
              var myDate = new Date();
              myDate.setMonth(myDate.getMonth() + 120);
              document.cookie = "gwp2_v=" + new_version + ";expires=" + myDate 
                               + ";domain=." + domain + ";path=/";

            }
          }, false);
          document.getElementsByTagName("head")[0].appendChild(s);
        });
        if(new_version < old_version) {
          /// Откат версии
          if(notes) {
            for(var i = old_version; i > new_version; i--) {
              delete notes[i];
            }
          } else {
            notes = {};
          }
          instance.set('release_notes', notes);
          __panel.showFlash('Произошло обновление системы, была возвращена предыдущая версия.', 
            'message');
          version = new_version;
          var myDate = new Date();
          myDate.setMonth(myDate.getMonth() + 120);
          document.cookie = "gwp2_v=" + new_version + ";expires=" + myDate 
                           + ";domain=." + domain + ";path=/";
        }
      });
    },

    /**
    * Получение текущей версии
    */
    getVersion: function() {
      return version;
    },

    /**
    * Вывод читаемой фразы с количеством
    * @param {int} count - количество
    * @param {string} one - текст на 1, 21, 31... etc
    * @param {string} two - текст на 2, 3, 4
    * @param {string} many - текст на 5, 6, ..., 11, 12, ... 20...
    */
    pluralize: function(count, one, two, many) {
      if((count % 10) == 1 && (count % 100) != 11) {
        return one;
      } else if( (count % 10) >= 2 && (count % 10) <= 4 && 
        ( count % 100 < 10 || count % 100 >=20 )) {
        return two;
      } else {
        return many;
      }
    },

    /**
    * Перекодирование UTF в CP1251 для отправки через AJAX
    */
    encodeURIComponent: function(str) {
      if(!str) return str;
      str = String(str).replace(/%/g, '%25').replace(/\+/g, '%2B')
              .replace(/\r/g, '\\r').replace(/\n/g, '\\n');
      var a = document.createElement('a');
      a.href = "http://www.ganjawars.ru/encoded_str=?" + str;
      return a.href.split('encoded_str=?')[1].replace(/%20/g, '+')
              .replace(/=/g, '%3D').replace(/&/g, '%26')
              .replace(/\\n/g, "\n").replace(/\\r/g, "\r");
    },

    /**
    * Обработчик для аяксифицирования ссылок
    */
    panel_ajaxify: function() {
      if($('#gw-content').length > 0) return;
      if(!history.pushState) return;
      if(location.pathname.indexOf('/b0/') == 0) return;
      if(document.domain.indexOf('gwpanel.org') > -1) return;
      var $elem;
      if($('table.topill').length > 0) {
        ///новое оформление
        $elem = $('table.topill').next();
        try {
          $('.gw-footer').remove();
        } catch(e) {
          /// почему то в хроме выдаёт ошибку в этом месте из-за конфликта с Prototype
        }
      } else {
        ///старое оформление
        var $elem = $('body > table[bgcolor="#f5fff5"]');
        if(!$elem.length) {
          $elem = $('body > table[bgcolor="#d0eed0"]').next('center');
        }
      }
      // У нас есть структура форм в document.forms, которую браузер почему-то
      // создаёт нормально, и есть .innerHTML в корявом виде.
      // Задача: привести формы из корявого innerHTML в нужный вид, используя
      // document.forms в качестве структуры
      var forms_copy = [];
      $(document.forms).each(function(i) {
        /// Если количество элементов на форме сопадает с целевым, то форма рабочая, менять ничего не нужно
        if(this.elements.length == $('form').eq(i).find('input, select, textarea').length) return;
        forms_copy[i] = [];
        $(this).addClass('form-' + i + ' broken-form').attr('form-id', i);
        $(this.elements).addClass('form-' + i);
      });
      if($elem.length > 0) {
        var $all_elements = $elem.nextAll().find('script').remove().end().wrapAll('<div id="gw-content"></div>');
      } else {
        var $all_elements = $('body').children().find('script').remove().end().wrapAll('<div id="gw-content"></div>');
      }
      var $content = $('#gw-content');

      /// вырезаем все оставшиеся текстовые ноды и добавляем к содержимому
      var __break = false;
      var textNodes = $content.parent().contents().filter(function() {
        if(this.id == 'gw-content') __break = true;
        return this.nodeType === 3 && !__break && this.data.length > 1;
      });
      textNodes.remove().prependTo($content);
      $content.after('<!--/#gw-content-->');
      if($all_elements.length > 0 && $content.length > 0) {
        originalTitle = document.title;

/*        history.replaceState({
          data: null, 
          title: document.title
        }, document.title, location.href);*/

        $(ajaxifyContent);

        window.onpopstate = function(event) {
          if(event.state && event.state.data && event.state.title) {
            /*var $div = $('<div>').hide().html(event.state.data).appendTo(document.body);
            if($div.find('#gw-content').length > 0) {
              var content = $div.find('#gw-content').html();
            }*/

            instance.ajaxUpdateContent(event.state.data, null, true);

            prevScrollTop = event.state.scrollTop;

            /*document.title = event.state.title;
            __initFunc();
            ajaxifyContent();
            tearDownFloatWidgets();
            initFloatWidgets();*/
          }
        }
      }
      instance.gotoHref = function(href, callback, refresh) {
        if(href.indexOf('http://') == 0 && href.indexOf('http://' + document.domain + '/') == -1) {
          window.location = href;
          return;
        }
        return ajaxGoto(href, callback, refresh);
      }

      if(!instance.getCookies().gwp2_n && document.domain.indexOf('gwpanel.org') == -1) {
        instance.loadScript('panel/panel_detect.js', function() {
          instance.panel_detect_greasemonkey(instance.panel_extension_notify);
          if(window.chrome) {
            instance.panel_detect_tampermonkey(instance.panel_extension_notify);
          }
        });
      }
    },

    /**
    * Функция для исправления разметки с корявыми формами
    * Поскольку Илья Спрайтович особо не заботится о валидности HTML-разметки,
    * нам приходится делать это за него.
    */
    fixForms: function(data) {
      var prev_start = 0;
      var start, end, tr_open, tr_close, table_open, new_data;
      // проходим по коду до последней формы
      do {
        var start = data.indexOf('<form', prev_start);
        if(start == -1) break;
        
        end = data.indexOf('</form>', start);

        var form_html = data.substr(start, end - start);
        var form_length = data.indexOf('>', start) - start + 1;
        tr_open = form_html.indexOf('<tr>');
        tr_close = form_html.indexOf('</tr>');

        if(tr_open > -1 || tr_close > -1) {
          /// форма сломанная, вытаскиваем <form> за пределы таблицы

          /// первый вариант - <table> перед <form>
          table_open = data.substr(prev_start, start).lastIndexOf('<table') + prev_start;
          /// второй вариант - <table> после <form>
          if(table_open == -1) {
            table_open = data.indexOf('<table', prev_start);
          }

          table_close = data.indexOf('</table>', table_open);
          if(table_open > -1) { /// таблица есть, форма внутри таблицы
            new_data = '';
            if(table_open < start) {  /// Если форма внутри таблицы
              new_data += data.substr(0, table_open) +       // начало данных до <table
              data.substr(start, form_length) +              // <form и вcё что в нём>
              data.substr(table_open, start - table_open);   // всё от <table> до <form> включительно
            } else {
              new_data += data.substr(0, start + form_length);
            }

            // всё что в <form>...</form>
            new_data += data.substr(start + form_length, end - start - form_length);
            
            if(table_close > end) { /// Если закрытие формы до закрытия таблицы
              new_data += data.substr(end + 7, table_close + 8 - end - 7) +// всё что между </form> и </table>
              '</form>' + data.substr(table_close + 8);                    // всё оставшееся за таблицей
            } else {
              new_data += data.substr(end);
            }
            
            data = new_data;
          }
        } else {
          /// фиксим если форма вставлена в <tr>, мы должны унести её в <td>
          td_open = form_html.indexOf('<td');
          td_length = form_html.indexOf('>', td_open) - td_open + 1;
          td_close = form_html.indexOf('</td>');
          if(td_open > -1 && td_close > -1 && form_html.split('<td').length == 2) {
            /// вытаскиваем <td перед <form
            var td_html = form_html.substr(td_open, td_length);
            form_html = td_html + form_html.replace(td_html, '').replace('</td>', '') + '</form>' + '</td>';
            data = data.substr(0, start) + 
                   form_html + 
                   data.substr(end + 7);
          }
        }
        prev_start = end + 1;
      } while(start > -1);

      return data;
    },

    /**
    * Функция закрывает все открытые окна
    */
    hideAllPanes: function(e) {
      if(e && e.type == 'click' && $('.pane:visible').hasClass('configuring')) return true;
      $('.pane:visible').hide();
      $('.pane-bubble.active').removeClass('active');
      $(document.body).off('click', instance.hideAllPanes);
    },

    haveServerSync: function(callback) {
      instance.get('haveServerSync', callback);
    },

    setAuthKey: function(key) {
      instance.authKey = key;
      instance.triggerEvent('auth');
    },

    auth: function(callback) {
      var listenerID;
      if(!listenerID) {
        listenerID = instance.bind('auth', function() {
          callback();
          instance.unbind('auth', listenerID);
          listenerID = false;
        });
      }
      $('<iframe src="http://new.gwpanel.org/csauth.php"></iframe>')
        .hide().load(function() {
          $('<script src="http://new.gwpanel.org/settings.php"></script>')
            .appendTo(document.body);
        }).appendTo(document.body);
    },

    ajaxUpdateContent: function(data, href, noHistory, refresh) {
      if(href && href.indexOf('bid=') !== -1 && href.indexOf('/b0/') > -1) {
        location.href = href;
      }
      if(window.hptimer_header > 0) {
        clearTimeout(window.hptimer_header);
        window.hptimer_header = 0;
      }
      if(window.hptimer > 0) {
        clearTimeout(window.hptimer);
        window.hptimer = 0;
      }
      var pathname, search;
      try {
        if(href) {
          var ar = href.split(document.domain)[1].split('?');
          pathname = ar[0];
          search = '?' + ar[1];
        }
      } catch(e) {}

      var smoothScrollTop, smoothScrollBottom;

      if(pathname == location.pathname) {
        if(search.indexOf('page_id') > -1) {
          // проверяем page_id у предыдущего урла и у следующего, плавно
          // пролистываем только если переход на следующую страницу
          var prev_page, next_page;
          if(location.search.search(/page_id=([0-9]+)/)) {
            prev_page = parseInt(RegExp.$1);
          }
          if(search.search(/page_id=([0-9]+)/)) {
            next_page = parseInt(RegExp.$1);
          }

          if((prev_page < next_page || (!prev_page && next_page > 0)) &&
              $(window).scrollTop() > $(window).height() / 2) {
            /// делаем плавный скролл
            smoothScrollTop = true;
          } else if((prev_page > next_page && next_page > 0) && 
             $(window).scrollTop() < $(window).height() / 2) {
            smoothScrollBottom = true;
          }
        }
      } else if(!noHistory) {
        $(window).scrollTop(0);
      }
      instance.clearTimeouts();
      $(document.body).addClass('ajax-processed');
      if(href && href.indexOf('/sms.php') > -1) $('img[src$="sms.gif"]').closest('a').remove();
      var jqs = false;
      var __title;
      if(data.indexOf('JQS loaded.') == 0) {
        data = data.substr(11);
        jqs = true;
        var first_hr = data.indexOf('<hr>');
        if(first_hr < 300) {
          data = data.substr(0, first_hr) + data.substr(first_hr + 4);
        }
      } else {
        var start = data.indexOf('<body');
        if(start > -1) {
          var body_end = data.indexOf('>', start);
          var body_close = data.indexOf('</body>', start);
          var title_open = data.indexOf('<title>');
          var title_close = data.indexOf('</title>', title_open);
          __title = data.substr(title_open + 7, title_close - title_open - 7);
          data = data.substr(body_end + 1, body_close - body_end - 1);
        } else {
          jqs = true;
        }
      }
      //data = data.replace(/<script[^>]*>.*?<\/script>/ig, '');
      //data = instance.fixForms(data);
      var $content = $('#gw-content').html(data);
      if(jqs) {
        document.title = ($content.find('#doc-title').text() || 'Онлайн игра')
                          + ' GanjaWars.Ru :: Ганджубасовые войны';
      } else {
        document.title = __title;
      }
      //if(title) document.title = title + ' :: Ganjawars.ru :: Ганджубасовые войны';
      $(document.body).removeClass(window.location.pathname.replace(/\./g, '-').replace(/\//g, '_').substr(1));
      if(noHistory) {
        //console.log('noHistory, using prevScrollTop', prevScrollTop);
        $(window).scrollTop(prevScrollTop);
      } else {
        if(smoothScrollTop) {
          $('html,body').animate({
            scrollTop: $('a[href$="' + pathname + search + '"]:first').offset().top - 40
          }, 1000);
        } else if(smoothScrollBottom) {
          $('html,body').animate({
            scrollTop: $('a[href$="' + pathname + search + '"]:last').offset().top - $(window).height() + 100
          }, 1000);
        }
        //console.log('pushing scrollTop: ', prevScrollTop);
        history.pushState({
          data: data, 
          title: document.title,
          scrollTop: prevScrollTop
        }, document.title, href);
      }
      $(document.body).addClass(window.location.pathname.replace(/\./g, '-').replace(/\//g, '_').substr(1));
      clearTimeout(loaderTO);
      loaderTO = 0;
      $(document.body).removeClass('ajax-loading');
      __initFunc(true);
      ajaxifyContent();
      if(!refresh) {
        instance.hideAllPanes();
      }
      tearDownFloatWidgets();
      initFloatWidgets();
    },

    iconURL: function(_img) {
      var img;
      if(!_img) _img = 'no-icon.png';
      if(_img.indexOf('http:') != 0) {
        img = __panel.path_to_theme() + 'icons/' + _img;
      } else {
        img = String(_img);
      }
      return img;
    },

    setCacheDomains: function(domains) {
      var myDate = new Date();
      myDate.setMonth(myDate.getMonth() + 120);
      document.cookie = "gwp2_c=" + domains.join('-') + ";expires=" + myDate 
               + ";domain=." + domain + ";path=/";
    },

    setInterval: function(func, timeout) {
      var i = setInterval(func, timeout);
      safeIntervals.push(i);
      return i;
    },

    setTimeout: function(func, timeout) {
      var i = setTimeout(func, timeout);
      safeTimeouts.push(i);
      return i;
    },
    /**
    * Функция возвращает responseURL последнего AJAX-запроса.
    * её реализовали совсем недавно, см. http://stackoverflow.com/questions/8056277/how-to-get-response-url-in-xmlhttprequest
    */
    responseURL: function() {
      if(xhr) {
        return xhr.responseURL;
      } else {
        return location.href;
      }
    },

    tearDown: function() {
      while(callback = tearDownStack.pop()) {
        try {
          callback();
        } catch(e) {}
      }
    },
    /**
    * Публичные аттрибуты
    */
    /// Скрипты с ошибками
    failedScripts: [],
    /// Стили с ошибками
    failedStyles: [],

    isLoading: 0
  });
  
  return Panel2;
};

/**
* Функция для ajax-отправки формы
* @param options - массив опций, передаётся в функцию jQuery.ajax
*/
$.fn.sendForm = function(options) {
  this.each(function() {
    var $form = $(this);
    options = $.extend({
      type: String($form.attr('method') || 'post').toLowerCase()
    }, options || {});
    if(options.data) {
      var s_data = options.data;
    } else {
      var s_data = $form.serializeArray();
    }

    __panel.setTimeout(function() {
      $(document.body).addClass('ajax-loading');
    }, 300);

    /// функция-обход для отправки через браузер
    function regularSend() {
      var $new_form = $('<form>', {
        method: 'POST',
        action: $form.attr('action') || location.href
      }).appendTo(document.body);
      $.each(s_data, function(i, item) {
        $('<input>', {
          type: 'hidden',
          name: item.name,
          value: item.value
        }).appendTo($new_form);
      });
      $new_form.submit();
    }
    /// Обходим функцию jQuery.param, чтобы данные не кодировались повторно
    var params = [];
    jQuery.each(s_data, function() {
      params.push(this.name + '=' + __panel.encodeURIComponent(this.value || options.data[this.name] || ''));
    });
    /// отдаём в data строку
    options.data = params.join('&');

    /// на ауте не работает форма отплытия если она отправляется сперва аяксом 
    /// а потом обычным способом, надо сразу отправлять обычным
    if(location.hostname == 'quest.ganjawars.ru' && options.data.indexOf('sectorout') > -1) {
      regularSend();
    }

    if(!$form.attr('method') || ($form.attr('method') && $form.attr('method').toLowerCase() == 'get')) {
      var href = ($form.attr('action') || location.pathname);
      if(href.indexOf('javascript:') == 0) {
        return;
      }
      if(href.indexOf('http:') == -1) {
        href = location.protocol + '//' + location.hostname + href;
      }
      __panel.gotoHref(href + '?' + options.data)
      return;
    }

    options.error = function(t) {
      /// В случае ошибки, скорее всего это редирект, 
      /// отправляем форму средствами браузера
      regularSend();
    }

    $.ajax($form.attr('action') || location.href, options);
  });
  return this;
}

/**
* Функция-враппер над стандартным методом .html
* её смысл заключается в том, чтобы предварительно определить какие элементы
* должны быть на форме, пометить их и затем при отправке формы связать их
* с самой формой не смотря на то, помещены они вовнутрь формы или нет.
* функция должна исправлять абсолютно все формы в игре.
*/
var origHtml = jQuery.fn.html;
/// глобальный счётчик форм, каждая форма уникальная.
var form_index = 0;

function parseParams(params) {
  var param_ex = /(\b\w+\b)\s*(=\s*("[^"]+"|'[^']+'|[^"'<>\s]+))?\s*/g
  //console.log('params to parse: ', params);

  var params_ar = [];

  while(m_p = param_ex.exec(params)) {
    //console.log(m_p);
    var name = m_p[1];
    var value = m_p[3];
    if(!value) {
      params_ar.push({name: name});
      continue;
    }

    if(value.charAt(0) == '\'' && value.charAt(value.length - 1) == '\'') {
      value = value.substr(1, value.length - 2);
    }
    if(value.charAt(0) == '"' && value.charAt(value.length - 1) == '"') {
      value = value.substr(1, value.length - 2);
    }

    params_ar.push({name: name, value: value});
  }

  return params_ar;
}

function convertParams(params_ar, className) {
  var has_class = false;

  $.each(params_ar, function(i, item) {
    if(item.name == 'class') {
      has_class = true;
      item.value += ' ' + className;
    }
  });

  if(!has_class) {
    params_ar.push({name: 'class', value: className});
  }

  //console.log('params: ', params, 'new params: ', params_ar);
  return $.map(params_ar, function(item) {
    if(item.value) {
      return item.name + '="' + item.value.replace('"', '&quot;') + '"';
    } else {
      return item.name;
    }
  }).join(' ');
}

$.fn.html = function(html) {
  var forms_fixed = false;
  if(html && $.type(html) == 'string') {
    //console.log('preparing html');
    /// вытаскиваем все формы
    var form_ex = /<form ([^>]+)>([.\s\S]*?)<\/form>/ig
    var input_ex = /<input[ ]?([^>]*)[\/]?>/ig
    var other_ex = /<(button|textarea|select)([^>]*)>([.\s\S]*?)<\/(button|textarea|select)>/ig
//console.log(html);
    var form_start = html.indexOf('<form');

    while(m_f = form_ex.exec(html)) {
      if(m_f[1].indexOf('gwp-form') > -1 || html.substr(m_f.index - 20, 20).indexOf('innerHTML') > -1) {
        continue;
      }

      var form_contents = m_f[2];
      //console.log('form_contents', form_contents);
      var formParams = parseParams(m_f[1]);

      var formID = null;
      var formName = null;
      var _formID = formParams.filter(function(item) { return item.name == 'id'})[0];
      var _formName = formParams.filter(function(item) { return item.name == 'name'})[0];

      //console.log('formParams: ', JSON.stringify(formParams));
      //console.log('_formID: ', _formID, '_formName: ', _formName);
      //console.log('formID: ', formID, 'formName: ', formName);
      /// делаем виртуальную форму
      var $form_element = null;

      if(_formID) {
        // Если форма имеет ID, то мы подменяем его на другой и создаём
        // пустой объект в document.forms.ID_Формы. 
        // Это нужно для того чтобы инлайновые скрипты, которые будут выполнены ниже 
        // при установке html() заполняли этот пустой объект, а затем мы переименуем
        // эту форму и подставим все значения которые выставляли инлайновые скрипты.
        formID = _formID.value;
        _formID.value = 'fake-' + formID;
        $form_element = $('<form id="' + formID + '">').appendTo(document.body);
      }
      if(_formName) {
        // то же самое с именованными формами
        formName = _formName.value;
        _formName.value = 'fake-' + formName;
        if($form_element) {
          /// если форма уже создана
          $form_element.attr('name', formName);
        } else {
          $form_element = $('<form name="' + formName + '">').appendTo(document.body);
        }
      }
      //console.log('form: ', formID, formName);

      while(m_i = input_ex.exec(form_contents)) {
        var params = parseParams(m_i[1]);
        var _name = params.filter(function(item) { return item.name == 'name'})[0];
        var _value = params.filter(function(item) { return item.name == 'value'})[0];
        if(_name) {
          var $item = $('<input>', {type: 'hidden', name: _name.value}).appendTo($form_element);
          if(_value && $.type(_value.value) == 'string') {
            $item.val(_value.value);
          }
          var _id = params.filter(function(item) { return item.name == 'id'})[0];
          if(_id && $.type(_id.value) == 'string') {
            $item.attr('id', _id.value);
          }
        }
        form_contents = form_contents.substr(0, m_i.index) + '<input ' + 
        convertParams(params, 'gwp-form-' + form_index + '-item') + '/>' + 
        form_contents.substr(m_i.index + m_i[0].length);
      }

      while(m_o = other_ex.exec(form_contents)) {
        //console.log(m_o);
        var params = parseParams(m_o[2]);
        var _name = params.filter(function(item) { return item.name == 'name'})[0];
        var _value = params.filter(function(item) { return item.name == 'value'})[0];
        if(_name) {
          var $item = $('<input>', {type: 'hidden', name: _name.value}).appendTo($form_element);
          if(_value && $.type(_value.value) == 'string') {
            $item.val(_value.value);
          }
          var _id = params.filter(function(item) { return item.name == 'id'})[0];
          if(_id && $.type(_id.value) == 'string') {
            $item.attr('id', _id.value);
          }
        }
        form_contents = form_contents.substr(0, m_o.index) + '<' + m_o[1] + ' ' + 
        convertParams(params, 'gwp-form-' + form_index + '-item') + '>' + m_o[3] + 
        '</' + m_o[4] + '>' + form_contents.substr(m_o.index + m_o[0].length);
      }

      //console.log('new form_params: ', convertParams(formParams, 'gwp-fixed-form gwp-form-' + form_index));
      //console.log('new form_contents: ', form_contents);
      /// изменяем html формы
      html = html.substr(0, m_f.index) + '<form index="' + form_index + '" ' + 
        convertParams(formParams, 'gwp-fixed-form gwp-form-' + form_index) + '>' + form_contents + 
        '</form>' + html.substr(m_f.index + m_f[0].length);

      //console.log('new html: ', html);
      form_index++;
      forms_fixed = true;
    }
/*    var ar = html.match() || [];
    $.each(ar, function(index, form) {
      /// вытаскиваем все инпуты
      var inputs = form.match(/<input[^>]+[\/]?>/g) || [];


      /// вытаскиваем все баттоны, textarea
    });*/
    /*if(__panel.responseURL().indexOf('quest.ganjawars.ru') != -1) {
      html = html.replace('document.forms.chatform.newline.focus()', 'jQuery("#newline").focus();');
    }*/
  }

  var result = origHtml.apply(this, [html]);

  if(forms_fixed) {
    if(!forms_fixed) return;
    result.find('.gwp-fixed-form').submit(function() {
      /// Перед сабмитом собираем все элементы
      var $this = $(this);
      var index = $this.attr('index');
      //console.log($('.gwp-form-' + index + '-item').serializeArray());
      var action = $this.attr('action');
      if(action.indexOf('javascript:') > -1) {
        /// Добавляем в форму все элементы, которые были из неё удалены
        try {
          eval(action);
        } catch(e) {
          if(window.console) console.log(e);
        }
        return false;
      }

      $(this).sendForm({
        data: $('.gwp-form-' + index + '-item:not([type=submit]):not([type=image])').serializeArray(),
        success: function(data) {
          __panel.tearDown();
          __panel.ajaxUpdateContent(data, __panel.responseURL() || $this.attr('action'));
          if(location.href.indexOf('messages.php') == -1) {
            $(window).scrollTop(0);
          }
        }
      });
      return false;
    }).each(function() {
      var index = $(this).attr('index');

      /// находим все сабмиты для этой формы и привязываем по клику отправку формы
      $('.gwp-form-' + index + '-item[type=submit], .gwp-form-' + index + '-item[type=image]').click(function(event) {
        if(this.onclick) {
          var result = eval(this.onclick);
          if(result === false) return result;
        }
        var $form = $('.gwp-form-' + index);
        /// мы должны добавить на форму скрытый элемент с именем и значением нажатого сабмита
        if(this.name) {
          $('<input type="hidden" name="' + this.name + '" value="' + this.value +
            '" class="gwp-form-' + index + '-item">').appendTo($form);
        }
        if(!$(this.form).closest('form').hasClass('.gwp-form-' + index)) {
          /// Если сабмит "выпал"" из родной формы, то сабмитим родную форму
          /// а не то где он сейчас находится
          $form.eq(0).submit();
          return false;
        }
      });

      // Если форма именованная, то мы должны убрать из её ID префикс "fake-"
      // и заполнить её всеми инпутами и значениями которые были установлены
      // в "подставной"" объект
      var formID = $(this).attr('id');
      var formName = $(this).attr('name');
      //console.log('processing form, ', 'formID: ', formID, ', formName: ', formName);
      if(formID) {
        formID = formID.split('fake-')[1];
        // получаем "подложный" объект
        var fakeForm = document.forms[formID];
        if(fakeForm) {
          //console.log(fakeForm);
          $(fakeForm).attr('id', 'old-' + formID);
          /// Меняем айди формы на правильный
          $(this).attr('id', formID);
          // заполняем правильную форму значениями из предыдущей
          $.each(fakeForm.elements, function(i, item) {
            if(document.forms[formID][this.name]) {
              document.forms[formID][this.name].value = this.value;
            } else {
              /// Элемент не прописался в форму, добавляем его принудительно
              document.forms[formID][this.name] = document.forms[formID]['elements'][this.name] = 
                $('.gwp-form-' + index + '-item[name="' + this.name + '"]').get(0);
            }
          });
          $(fakeForm).remove();
        }
      } else if(formName) {
        /// То же самое с именем
        formName = formName.split('fake-')[1];
        //console.log('real name: ', formName);
        // получаем "подложный" объект
        var fakeForm = document.forms[formName];
        //console.log('fake form: ', fakeForm);
        if(fakeForm) {
          $(fakeForm).attr('name', 'old-' + formName);
          /// Меняем айди формы на правильный
          $(this).attr('name', formName);
          // заполняем правильную форму значениями из предыдущей
          $.each(fakeForm.elements, function(i, item) {
            if(document.forms[formName][this.name]) {
              document.forms[formName][this.name].value = this.value;
            } else {
              /// Элемент не прописался в форму, добавляем его принудительно
              document.forms[formName][this.name] = document.forms[formName]['elements'][this.name] = 
                $('.gwp-form-' + index + '-item[name="' + this.name + '"]').get(0);
            }
          });
          $(fakeForm).remove();
        }
      }

      /// Переопределяем стандартную функцию сабмита в аяксовую
      var origSubmit = this.submit;
      var that = this;
      this.submit = function() {
        try {
          var action = $(that).attr('action');
          if(action.indexOf('javascript:') > -1) {
            if(eval(action.split('javascript:')[1]) === false) {
              return false;
            }
          }
          $(that).submit();
        } catch(e) {
          origSubmit();
        }
      }
    });
  }
  return result;
}

})(jQuery);
