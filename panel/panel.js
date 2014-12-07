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

  /// Структура гвпанели: все методы, файлы, события, темы, тесты.
  var panel_schema;
  /// Окружение
  /// Возможные варианты: dev, production, deploy, testing
  var environment;
  var original_environment;
  /// слушатели сброса кеша
  var cacheListeners;
  /// стек вызова функции getCached
  var cacheCallStack = {};
  /// текущая версия
  var version;
  /// уникальный идентификатор открытого окна
  var windowID;
  /// ID настроек
  var optionsID;
  /// ID варианта настроек (default, noname, etc...)
  var variant;
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
  var safeTimeouts = [];
  var notSafeTimeouts = [];

  /// последние запомненные таймауты и интервалы
  var lastTimeout = 0;

  /// кеш для перкодировщика в cp1251
  var charEncodeCache = {
    ' ': '%20',
    '+': '%2B',
    '%': '%25',
    '&': '%26',
    '=': '%3D'
  };

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
    if($this.hasClass('right') && !$this.hasClass('footer') && 
       (!e || e.type != 'click') && !$('.pane:visible:not(.inline)').length) {
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
          var type = panel_schema.buttons[this.type];
          if(!type) {
            instance.dispatchException('Unknown button type: ' + this.type, 'Pane ' + paneID + ' draw: ');
            return;
          }
          if(!type.callback) type.callback = this.type.substr(type.module.length + 1);
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
              '</h3></a>')
              .click(function(e) {
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
            )
            .css({
              left: that.left * options.system.btnwidth,
              top: that.top * options.system.btnheight,
              width: options.system.btnwidth,
              height: options.system.btnheight,
              visibility: 'hidden'
            })
            .attr('left', that.left)
            .attr('top', that.top)
            .attr('index', index);

          function btnAfterDraw() {
          //setTimeout(function() {
            var btnTitle = $button.find('h3').get(0);
            /// Если заголовок не вмещается в кнопку
            if(btnTitle.clientHeight > 30 || 
               btnTitle.scrollWidth > $button.get(0).clientWidth) {
              $button.find('h3').addClass('big');
            }
            $button.css({
              visibility: 'visible'
            });
          //}, 1);
          }
          if(type.draw) {
            instance.loadScript(getFiles(type.file, type.module), function() {
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
              try {
                instance[type.draw].apply($button.get(0), [__options]);
              } catch(e) {
                instance.dispatchException(e);
              }
              $button.appendTo(paneContainer);
              setTimeout(btnAfterDraw, 1);
            });
          } else {
            $button.appendTo(paneContainer);
            setTimeout(btnAfterDraw, 1);
          }
          if(!hold_positions[that.top]) hold_positions[that.top] = {};
          hold_positions[that.top][that.left] = $button.attr('id');
        });
      }
      if((pane_options.buttons && pane_options.buttons.length > 0) || 
         (pane_options.widgets && pane_options.widgets.length > 0)) {

        paneContainer.mousedown(function(e) {
          var that = $(e.target).closest('.button, .widget');
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
          var type = panel_schema.widgets[this.type];
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
      $('.pane:visible:not(.inline)').hide();
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
  
  /**
  * Вывод плашек активации
  */
  function draw_pane_bubbles() {
    if(!options || !options.panes || !options.panes.length) return;

    checkTime('draw_pane_bubbles begin');
    instance.check_button('panel_settings');

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
  
  /**
  * Инициализация и отрисовка плавающих виджетов
  */
  function initFloatWidgets(redraw) {
    if(!options || !options.widgets) return;
    var modules = {};
    
    var index = 0;
    $.each(options.widgets, function(index) {
      if(!this.type || !panel_schema.widgets[this.type]) return;
      this.module = panel_schema.widgets[this.type].module;
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

      instance.loadScript(getFiles(panel_schema.widgets[this.type].file, this.module), function() {
        var type = panel_schema.widgets[widget.type];
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
                  instance.panel_settings_form.apply($widget, [panel_schema.widgets[widget.type], 
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
      if(!this.type || !panel_schema.widgets[this.type]) return;
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
        instance.__mousestartTO = setTimeout(function() {
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
    return;
    var new_timer = (new Date()).getTime();
    console.log(name + ': ' + '+' + (prev_timer? (new_timer - prev_timer) + ' ms, ': '') + 
                 (new_timer - timer) + ' ms from start');
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
  * @param __baseURL - адрес, откуда запустилась панель
  */
  function Panel2(__env, __baseURL, __schema) {
    timer = (new Date()).getTime();
    if(!instance )
       instance = this;
    else return instance;
    try {
      //if(window.frameElement && !window.frameElement.panelContainer) return;
    } catch(e) {}
    
    original_environment = __env;
    if(location.search.indexOf('gwpanel_test') != -1) {
      environment = 'testing';
    } else {
      environment = original_environment;
    }
    baseURL = __baseURL;
    panel_schema = $.extend(true, {}, __schema);
    delete __schema;
    delete window.panel_schema;
    
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
      for(var event_name in panel_schema.listeners) {
        $.each(panel_schema.listeners[event_name], function(index, func_name) {
          instance.bind(event_name, function() {
            instance.callMethod(func_name, arguments, this);
          });
        });
      }
    }

    // Инициализация подгружаемых скриптов
    var pages = [];
    if($.type(panel_schema.pages[location.pathname]) == 'array') {
      pages = panel_schema.pages[location.pathname];
    }
    if($.type(panel_schema.pages['*']) == 'array') {
      for(var i = 0; i < panel_schema.pages['*'].length; i++) {
        if(pages.indexOf(panel_schema.pages['*'][i]) == -1) {
          pages.push(panel_schema.pages['*'][i]);
        }
      }
    }
    pages.sort(function(a, b) {
      var a_weight = panel_schema.modules[panel_schema.methods[a].module].weight;
      var b_weight = panel_schema.modules[panel_schema.methods[b].module].weight;
      if(a_weight > b_weight) return 1;
      if(a_weight < b_weight) return -1; 
      return 0;
    });

    $(function() {
      $(pages).each(function(index, func) {
        instance.callMethod(func, arguments, instance);
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
      $('script[src$="prototype.js"]').remove();

      /// Инициализация тестов если в запросе указан ?gwpanel_test и это не встроенный фрейм
      if(environment == 'testing' && location.search.indexOf('continue') == -1) {
        //alert('test');
        var initTestFunc = function() {
          instance.loadCSS('../../lib/qunit-1.15.0.css');
          var tests = panel_schema.tests || [];
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
      var __local_variant = sessionStorage['gwp2_' + variantID];
      /// Опции сперва привязываются к окружению (environment), затем к ID игрока
      /// затем к выбранному варианту, если вариант не найден, то выбираем default
      if(__local_variant && __local_variant.length > 0 && __local_variant != 'undefined') {
        optionsID = environment + '_' + instance.currentPlayerID() + '_' + 
                        JSON.parse(__local_variant);
        var __local_options = sessionStorage['gwp2_' + optionsID];
        if(__local_options != null && 
           __local_options.length > 0 && __local_options != 'undefined') {
          $.extend(options, JSON.parse(__local_options));
          variant = __local_variant;
          if($.type(options) == 'object') {
            fastInitReady = true;
          }
        }
      }

      var flushTime = parseInt(instance.getCookies().gwp2_flush);
      //console.log(sessionStorage['_flush']);
      var sessFlush = parseInt(sessionStorage['_flush']);
      /// Если кеш был слит до отметки в sessionStorage['_flush'], то быстрая инициализация из кеша невозможна
      if(!sessFlush || sessFlush < flushTime) {
        fastInitReady = false;
        //console.log(sessFlush, flushTime);
        //console.log('flushing sessionStorage');
        /// мы попали сюда потому что где-то были изменены настройки
        /// очищаем все переменные в sessionStorage начинающиеся с текущего окружения
        for(var key in sessionStorage) {
          if(key.indexOf('gwp2_' + environment) == 0) {
            delete sessionStorage[key];
          }
        }
        sessionStorage['_flush'] = String((new Date).getTime());
      }

      if(isNaN(flushTime)) {
        var now = new Date();
        now.setMonth(now.getMonth() + 120);
        document.cookie = "gwp2_flush=" + (new Date).getTime() + 
                          ";expires=" + now + ";domain=." + domain + ";path=/";

      }
      if(environment == 'testing') {
        fastInitReady = location.search.indexOf('gwpanel_pause') == -1;
      }

      /// если быстрая инициализация доступна
      checkTime('fastInitReady: ' + fastInitReady);
      if(fastInitReady) {
        __initFunc();
        initInterface();
        /// функция загрузки css довольно долгая, так что выполняем её параллельно
        setTimeout(function() {
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
        sessionStorage['gwp2_windowID'] = windowID = instance.crossWindow.windowID;
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
          setTimeout(instance.__load, 1);
        }
      }, domain);
      checkTime('crossWindow init');
      /// функция полной готовности окна
      instance.get(variantID, function(__variant) {
        variant = __variant;
        //parent.console.log('variantID: ', variantID);
        checkTime('get variantID ' + variantID);
        if(!__variant) {
          checkTime('set default variant for ' + __variant);
          instance.set(variantID, 'default');
          sessionStorage['gwp2_' + variantID] = JSON.stringify('default');
          __variant = 'default';
        }
        optionsID = environment + '_' + instance.currentPlayerID() + '_' + __variant;
        instance.get(optionsID, function(__options) {
          checkTime('get optionsID ' + optionsID);
          //parent.console.log('optionsID: ', optionsID);
          if(__options != null && $.type(__options) == 'object') {
            if(!fastInitReady) {
              options = $.extend(options, __options);

              if(!sessionStorage['_flush']) {
                sessionStorage['_flush'] = String((new Date).getTime());
              }
              sessionStorage['gwp2_' + variantID] = JSON.stringify(__variant);
              sessionStorage['gwp2_' + optionsID] = JSON.stringify(options);
            }
          } else {
            /// Вызываем мастер настроек
            if(document.domain.indexOf('ganjawars.ru') > -1 && environment != 'testing' && !instance.getCookies()['gwp2_mc']) {
              if(location.pathname == '/info.edit.php') { /// выводим мастер только на странице настроек
                instance.loadScript('panel/panel_master.js', function() {
                  instance.panel_master();
                });
              }
              instance.check_button('panel_master');
            } else {
              /// дефолтные настройки
              options = $.extend(options, window.panelSettingsCollection.default);
              delete options['master'];
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
        //console.log('options_change', data);
        variant = data.variant;
        if(data.optionsID == optionsID && data.windowID != windowID && 
           data.playerID == instance.currentPlayerID()) {
          options = data.options;
          // делаем отметку когда был обновлён кэш в этом окне
          sessionStorage['_flush'] = String((new Date).getTime());
          sessionStorage['gwp2_' + data.variantID] = JSON.stringify(data.variant);
          sessionStorage['gwp2_' + data.optionsID] = JSON.stringify(data.options);
        }
      });
      
      $(document.body).addClass(window.location.pathname.replace(/\./g, '-').replace(/\//g, '_').substr(1));
      try {
        var browser = Object.keys($.browser)[0];
        $(document.body).addClass(browser + ' ' + browser + '-' + 
          $.browser.version.split('.')[0] + ' ' + browser + '-' + 
          $.browser.version.replace(/\./g, '-'));
      } catch(e) {};
      
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

      $(window).bind('beforeunload', instance.tearDown);

      /// Запускаем выполнение эффектов запуском фейкового события, это нужно
      /// для того чтобы jQuery проинициализировал свои tick-функции обычным 
      /// setTimeout, чтобы мы его не затёрли
      $('<div>').animate({top: 1});

      window.osetTimeout = window.setTimeout;
      window.osetInterval = window.setInterval;
      window.setTimeout = function(c, t, safe) {
        var id = window.osetTimeout(c, t);

        if((arguments.callee && 
           arguments.callee.caller &&
           (
             arguments.callee.caller.toString().indexOf('createFxNow') > -1 ||
             arguments.callee.caller.toString().indexOf('cr=f.now()') > -1 ||
             arguments.callee.caller.toString().indexOf('fxshow') > -1
           )) ||
           safe ) {
        } else {
          notSafeTimeouts.push(id);
        }
        return id;
      }
      window.setInterval = function(c, t, safe) {
        var id = window.osetInterval(c, t);
        if((arguments.callee && 
           arguments.callee.caller &&
           (
             arguments.callee.caller.toString().indexOf('createFxNow') > -1 ||
             arguments.callee.caller.toString().indexOf('cr=f.now()') > -1 ||
             arguments.callee.caller.toString().indexOf('fxshow') > -1
           )) ||
           safe ) {
        } else {
          notSafeTimeouts.push(id);
        }
        return id;
      }
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
          /*if(name.length > 1) {
            if(failover) failover();
          }*/
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
      } else if($.type(sessionStorage['gwp2_' + key]) != 'undefined') {
        sessionStorage['gwp2_' + key] = JSON.stringify(value);
      }

      var __callback = function() {
        /// выставляем на текущий домен чтобы затем сразу возвращать
        sessionStorage['gwp2_' + key] = JSON.stringify(value);
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
          //instance.dispatchException(e);
        }
        callback(null);
        return;
      } else if(!initialized && $.type(sessionStorage['gwp2_' + key]) != 'undefined' &&
          sessionStorage['gwp2_' + key] != 'undefined') {
        try {
          var val = JSON.parse(sessionStorage['gwp2_' + key]);
          checkTime('get ' + key + ' from session storage');
          callback(val);
          return;
        } catch(e) {
          delete sessionStorage['gwp2_' + key];
          instance.dispatchException(e);
        }
      }
      var __callback = function(value) {
        sessionStorage['gwp2_' + key] = JSON.stringify(value);
        if(callback) callback(value);
      }
      /// Если на текущем домене нет, то запрашиваем из основного
      checkTime('begin to get ' + key + ' from local storage');
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
      if($.type(sessionStorage['gwp2_' + key]) != 'undefined') {
        delete sessionStorage['gwp2_' + key];
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
      if(initialized) {
        return instance.crossWindow.triggerEvent(type, data || {}, local);
      } else {
        instance.onload(function() {
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
        var callerFunc = callback.toString().hashCode();
        var listenerID = callerFunc + '_' + (new Date).getTime() + '_preinit';
        if(!listenersStack[type]) listenersStack[type] = {};
        var index = 0;
        while(listenersStack[type][listenerID]) {
          listenerID += index++;
        }
        listenersStack[type][listenerID] = true;

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
        instance.check_button('panel_settings');

        var variantID = environment + '_opts_var_' + instance.currentPlayerID();
        instance.set(optionsID, options, function() {
          instance.triggerEvent('options_change', {options: options, 
                                optionsID: optionsID, windowID: windowID,
                                variantID: variantID,
                                variant: variant,
                                playerID: instance.currentPlayerID()});

          // делаем отметку когда был обновлён кэш в этом окне
          sessionStorage['_flush'] = String((new Date).getTime());
          sessionStorage['gwp2_' + variantID] = JSON.stringify(variant);
          sessionStorage['gwp2_' + optionsID] = JSON.stringify(options);

          if(callback) {
            callback();
          }
        });
      });
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
        $('.pane:visible:not(.inline)').hide();
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
      if(window.__clearCache) window.__clearCache();
      console.log('Reload page to commit environment change. Disable greasemonkey script if you were in dev.');
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
        sessionStorage.clear();
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

      var $flash = $('<div class="panel-flash"></div>').css({bottom: -40})
        .addClass(type).html(text)
        .appendTo(document.body).click(function() {
          $(this).clearQueue();
          $(this).fadeOut(function() {
            $(this).remove();
          });
        }).animate({bottom: 20});
      /// таймаут скрытия по-умолчанию
      if(!timeout) timeout = 20000;
      instance.setTimeout(function() {
        $flash.animate({bottom: parseInt($flash.css('bottom')) + 300},
          { duration: 200, queue: false });
        $flash.fadeOut(100, function() {
          $(this).remove();
        });
      }, timeout);
    },

    clearTimeouts: function (w) {
      //if(!w) w = window;
      for(var i = 0; i < notSafeTimeouts.length; i++) {
        clearTimeout(notSafeTimeouts[i]);
      }
      notSafeTimeouts = [];
      /// Останавливаем выполнение всех эффектов
      //$.fx.stop();
      //var jqTimerId = $.fx.getTimerId();
      //console.log('jqTimerId', jqTimerId);

      //var s = w.setTimeout('void 0;', 1000);
      /*for(var i = lastTimeout; i <= s; i++) {
        if(safeTimeouts.indexOf(i) == -1 &&
           jqTimerId != i) {
          console.log('clearing to: ', i);
          w.clearTimeout(i);
        }
      };*/
      /// Запускаем выполнение эффектов запуском фейкового события
      //$('<div>').animate({top: 1});
      //lastTimeout = s;
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
                        panel_schema.widgets[p_options.widgets[i].type].height;
        var _w_width = p_options.widgets[i].width || 
                       panel_schema.widgets[p_options.widgets[i].type].width;

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
      //console.log('getCached called from: ', (new Error).stack.split("\n")[1]);
      var cid = 'cached_' + generator.toString().replace(/[\n\s\t]/g, '').hashCode();
      if(!cacheCallStack[cid]) {
        cacheCallStack[cid] = [];
      }
      cacheCallStack[cid].push(callback);

      if(cacheCallStack[cid].length > 1) {
        /// Этот же самый вызов уже был совершён, когда первый вызов отработает, он 
        /// запустит все callback-и
        return;
      }

      var runCallback = function(result) {
        /// вызываем всех слушателей
        while(clbck = cacheCallStack[cid].shift()) {
          clbck(result);
        }
      }

      instance.get(cid, function(data) {
        instance.get('cacheListeners', function(__listeners) {
          cacheListeners = __listeners || {};
          //console.log('getCached cid=', cid, 'data=', data);
          if(!condition || $.type(data) == 'null' || 
            (data.type == 'time' && data.expiration < (new Date).getTime())
            ) {
            /// Генерируем
            data = {
              type: isNaN(parseInt(condition))? 'event': 'time'
            };
            var runFunc = function() {
              /// запускаем генератор
              generator(function(generated_data) {
                data.data = generated_data;
                /// Записываем данные
                //console.log('setCached, cid=', cid, 'data=', data);
                instance.set(cid, data, function() {
                  runCallback(data.data);
                });
              });
            }
            if(data.type == 'time') {
              data.expiration = (new Date).getTime() + condition * 1000;
              //console.log('not in cache, new time: ', new Date(data.expiration));
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
          } else if(isNaN(condition)) {
            /// данные в кеше есть и они не истекли, вызываем обратную функцию, 
            /// однако проверяем массив cacheListeners, вызов должен быть в массиве
            if(!cacheListeners[condition]) cacheListeners[condition] = [];
            if(cacheListeners[condition].indexOf(cid) == -1) {
              cacheListeners[condition].push(cid);
              instance.set('cacheListeners', cacheListeners, function() {
                //console.log('listeners changed: ', JSON.stringify(cacheListeners));
                runCallback(data.data);
              });
            } else {
              runCallback(data.data);
            }
          } else {
            //console.log('in time cache');
            runCallback(data.data);
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
            instance.showFlash('В скриптах что-то поменялось, сейчас будут загружены изменения. Сообщение: <br /><strong>' + window.stage_descr + '</strong>');
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
          path += "/" + str_version + ".notes.js?" + (new Date).getTime();
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
              if(old_version > 0) {
                __panel.showFlash('Произошло обновление системы. Новая версия: ' 
                  + new_version + '.' + 
                  ($('#panel-settings-editor:visible').length? '': 
                    '<br />Посмотреть <a href="#release-notes" onclick="__panel.loadScript(&quot;panel/panel_settings.js&quot;, function() { __panel.panel_settings_editor(&quot;release_notes&quot;); }); return false;">заметки к выпуску</a>.'), 
                  'message');
              }
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

    setVariant: function(newVariant, callback) {
      variant = newVariant;
      instance.set(environment + '_opts_var_' + instance.currentPlayerID(), variant, function() {
        optionsID = environment + '_' + instance.currentPlayerID() + '_' + variant;
        instance.get(optionsID, function(new_options) {
          instance.setOptions(new_options, null, callback);
        });
      });
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

      var result = '';

      for(var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if(typeof(charEncodeCache[char]) != 'undefined') {
          result += charEncodeCache[char];
        } else {
          var utfEncode = encodeURIComponent(char);
          if(utfEncode.charAt(0) == '%' && utfEncode.indexOf('%', 1) > -1) {
            /// это двухбайтовый UTF-ный символ, нужно перекодировать
            if(!instance.__encode_anchor) instance.__encode_anchor = document.createElement('a');
            instance.__encode_anchor.href = "http://" + document.domain + "/encoded_str=?" + char;
            var encodedChar = instance.__encode_anchor.href.split('encoded_str=?')[1];
            charEncodeCache[char] = encodedChar;
            result += encodedChar;
          } else {
            /// однобайтовый, добавляем как есть
            result += char;
          }
        }
      }
      return result;
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
      $('.pane:visible:not(.inline)').hide();
      $('.pane-bubble.active').removeClass('active');
      $(document.body).off('click', instance.hideAllPanes);
    },

    /**
    * Функция проверки есть ли у игрока доступ к серверным функциям
    */
    haveServerSync: function(callback) {
      instance.get('haveServerSync', callback);
    },

    /**
    * Этот метод вызывается при процессе авторизации, запоминает ключ авторизации
    */
    setAuthKey: function(key) {
      instance.authKey = key;
      instance.triggerEvent('auth', {}, true);
    },

    /**
    * Функция авторизации на сервере gwpanel.org для доступа к серверным функциям
    */
    auth: function(callback) {
      var listenerID = instance.bind('auth', function() {
          callback();
          instance.unbind('auth', listenerID);
          listenerID = false;
        });
      setTimeout(function() {
        $('<iframe src="http://new.gwpanel.org/csauth.php"></iframe>')
          .hide().load(function() {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = 'http://new.gwpanel.org/settings.php';
            document.getElementsByTagName('head')[0].appendChild(s);
          }).appendTo(document.body);
      }, 10);
    },

    /**
    * Функция-хелпер, возвращает полный путь к иконке
    * @param _img - иконка (как она указана в настройках кнопки/виджета)
    * @return string - полный путь для подстановки в <img src='...'>
    */
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

    /**
    * Функция для безопасного запуска интервала
    * Обязательно используйте её заместо стандартной, иначе в AJAX-режиме
    * ваши интервалы умрут после перезагрузки, т.к. они затираются
    */
    setInterval: function(func, timeout) {
      var i = setInterval(function() {
        func();
      }, timeout, true);
      safeTimeouts.push(i);
      return i;
    },

    /**
    * Функция для безопасного запуска таймаута
    * Обязательно используйте её заместо стандартной, иначе в AJAX-режиме
    * ваши таймауты никогда не выполнятся, т.к. они затираются
    */
    setTimeout: function(func, timeout) {
      var id = setTimeout(function() {
        func();
        instance.clearTimeout(i);
      }, timeout, true);
      safeTimeouts.push(id);
      return id;
    },

    clearTimeout: function(id) {
      clearTimeout(id);
      var index = safeTimeouts.indexOf(id);
      if(index > -1) {
        safeTimeouts.splice(index, 1);
      }
    },
    /**
    * Интервал, который сработает через указанный промежуток
    * даже после перезагрузки страницы (после перезагрузки вы должны 
    * вызвать этот метод ещё раз чтобы он продолжал работу)
    * Он должен быть использован для выполнения периодических действий
    * в текущем окне независимо от того, были ли произведены переходы
    * 
    * @param callback - функция вызова
    * @param timeout - таймаут выполнения, в миллисекундах
    */
    persistInterval: function(callback, timeout) {
      var hash = callback.toString().hashCode();

      var info = sessionStorage['persist_intrvl_' + hash];
      if(info) {
        try {
          info = JSON.parse(info);
        } catch(e) {}
      }

      if($.type(info) != 'object' || !info) {
        info = {
          start: (new Date).getTime(),
          timeout: timeout,
          lastrun: 0
        }
      } else {
        info.timeout = timeout;
      }

      function start() {
        return instance.setInterval(function() {
          instance.get('persist_intrvl_' + hash, function(_info) {
            if(!_info) _info = info;
            var now = new Date;
            now.setMilliseconds(0);
            now = now.getTime();
            if(!_info.lastrun || now >= _info.lastrun + timeout) {
              _info.lastrun = now;
              instance.set('persist_intrvl_' + hash, _info, function() {
                callback();
              });
            }
          });
        }, timeout);
      }

      sessionStorage['persist_intrvl_' + hash] = JSON.stringify(info);

      if(info.lastrun > 0) {
        // определяем когда следующий запуск
        var nextRun = info.start + timeout;
        var now = (new Date).getTime();
        if(nextRun > now) {
          // откладываем запуск
          setTimeout(function() {
            callback();
            start();
          }, now - nextRun);
        } else {
          // время запуска в прошлом, стартуем задачу сразу
          callback();
          start();
        }
      } else {
        // первый запуск, стартуем сразу
        start();
      }
    },

    /**
    * Таймаут, который сработает через указанный промежуток
    * даже после перезагрузки страницы (после перезагрузки вы должны 
    * вызвать этот метод ещё раз чтобы он отработал в указанное время)
    *
    * @param callback - функция вызова
    * @param timeout - таймаут выполнения, в миллисекундах
    */
    persistTimeout: function(func, timeout) {
      
    },

    /// ручной "подвод" часов
    syncTime: function(data) {
      var lines = data.split("\n");
      if(lines[7]) {
        var timestamp = parseInt(lines[7].split("\t")[1]);
        var nowLocal = new Date;

        var delta = timestamp * 1000 - nowLocal.getTime() + 
          (nowLocal.getTimezoneOffset() + 180) * 60 * 1000;

        localStorage['time_delta'] = delta;
      }
    },
    /**
    * Функция определения точного времени по серверу (до секунды). Асинхронная.
    * @param callback - этот метод вызывается с точным объектом временем 
    *   в качестве первого аргумента
    */
    getTime: function(callback, failover) {
      instance.get('time_delta', function(delta) {
        if(delta) {
          var now = new Date;
          now.setTime(now.getTime() + parseInt(delta));
          callback(now);
          return;
        } else if(document.domain == 'www.ganjawars.ru') {
          $.ajax('http://www.ganjawars.ru/getstate.php?state_uid=' + 
          instance.currentPlayerID() + '&bpvalue=' + instance.getCookies().bp + 
          '&extras=1&bonuses=1', {
            success: function(data) {
              var lines = data.split("\n");
              if(lines[7]) {
                var timestamp = parseInt(lines[7].split("\t")[1]); 
                var nowLocal = new Date;
                var delta = timestamp * 1000 - nowLocal.getTime() + 
                  (nowLocal.getTimezoneOffset() + 180) * 60 * 1000;
                if(delta != 0) {
                  instance.set('time_delta', delta, function() {
                    instance.getTime(callback);
                  });
                }
              } else {
                if(failover) failover();
              }
            }
          });
          return;
        }
        if(failover) failover();
      });
    },
    /**
    * Функция возвращает последний открытый URL. 
    * Без аякса это просто location.href
    */
    responseURL: function() {
      return location.href;
    },

    /**
    * Функция вызова всех слушателей onunload, подчищаем хвосты
    */
    tearDown: function() {
      while(callback = tearDownStack.pop()) {
        try {
          callback();
        } catch(e) {}
      }
    },

    ajaxTearDown: function() {
      instance.tearDown();
      instance.clearTimeouts();
    },

    ajaxRefresh: function(refresh) {
      __initFunc(true);
      if(!refresh) {
        instance.hideAllPanes();
      }
      /// виджеты должны скрываться когда уже совершён переход
      /// иначе им ничего не будет известно на какой мы сейчас странице
      tearDownFloatWidgets();
      /// добавляем те виджеты, которые не проинициализированы или 
      /// отображаем скрытые, которые должны быть на этой странице
      initFloatWidgets();
    },

    /**
    * функция-враппер для доступа к функции вывода таймингов checkTime
    */
    checkTime: function(msg) {
      checkTime(msg);
    },

    /**
    * Функция получения именованной блокировки
    *
    * @param lockId - имя блокировки
    * @param callback - функция, вызываемая при получении блокировки
    * @param failover - функция, вызываемая если блокировку не удалось получить
    * @param timeout - таймут истечения, в секундах, не обязательный параметр
    */
    lockAcquire: function(lockId, callback, failover, timeout) {
      instance.get('lock_' + lockId, function(data) {
        if(!data || data.windowID == windowID || 
            data.expiration < (new Date()).getTime()) {
          /// блокировка получена
          data = data || {};
          data.time = (new Date()).getTime();
          // истечение блокировки - либо указанный таймаут, либо сутки
          data.expiration = data.time + (timeout > 0? timeout * 1000: 86400000);
          data.windowID = windowID;
          instance.set('lock_' + lockId, data, function() {
            instance.onunload(function() {
              instance.lockRelease(lockId);
            });
            callback();
          });
        } else {
          if(failover) failover();
        }
      });
    },

    /**
    * Функция освобождения именованной блокировки
    *
    * @param lockId - имя блокировки
    * @param callback - функция, вызываемая после освобождения блокировки
    */
    lockRelease: function(lockId, callback) {
      instance.del('lock_' + lockId, function() {
        if(callback) callback();
      });
    },

    getSchema: function() {
      /// Не даём ссылку на текущую схему. Нельзя править схему.
      return jQuery.extend(true, {}, panel_schema);
    },

    /// добавление данных в схему, только для тестов
    setSchema: function(data) {
      if(environment == 'testing') {
        $.extend(true, panel_schema, data);
      } else {
        throw 'Нельзя изменять схему на лету';
      }
    },

    /**
    * Вызов метода
    * Вызывается метод со специальным объектом содержащим настройки метода
    * с функцией save() в качестве первого аргумента. После первого аргумента 
    * добавляются аргументы из массива arguments, если они указаны
    * Все методы объявляются в файлах .module.json и могут иметь настраиваемые 
    * пользователем настройки, а также свои собственные, которые они обозначат
    * во время вызова.
    * @param name - имя метода.
    * @param __arguments - дополнительные аргументы
    **/
    callMethod: function(name, __arguments, target) {
      if((options.blacklist && options.blacklist.indexOf(name) > -1) ||
          /// или функция по-дефолту отключена и не в белом списке, либо белого списка нет
          (panel_schema.methods[name].default === false 
            && (!options.whitelist || options.whitelist.indexOf(name) == -1))
        ) return;

      var module = panel_schema.methods[name].module;
      var files = getFiles(panel_schema.methods[name].file, module);
      if(!files.length) {
        throw 'Не указан файл для метода ' + name;
      }
      instance.loadScript(files, function() {
        if($.type(instance[name]) == 'undefined') {
          throw('Метод ' + name + ' в модуле ' + module + ' не найден');
        }

        var func_options = {};
        try {
          if(!options.settings) {
            options.settings = {};
          }
          if(!options.settings[module]) {
            options.settings[module] = {};
          }
          if(!options.settings[module][name]) {
            options.settings[module][name] = {};
          }
          $.extend(func_options, options.settings[module][name]);
          if($.isEmptyObject(func_options) && panel_schema.methods[name].configure) {
            /// инициализируем опции с дефолтными значениями
            $.each(panel_schema.methods[name].configure, function(option, configure) {
              if($.type(configure.default) != 'undefined') {
                func_options[option] = configure.default;
              }
            });
          }
          $.extend(func_options, {
            save: function(callback) {
              for(var key in func_options) {
                if(key == 'save') continue;
                options.settings[module][name][key] = func_options[key];
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

        var args = [];

        if(__arguments && __arguments.length > 0) {
          for(var i = 0; i < __arguments.length; i++) {
            args.push(__arguments[i]);
          }
        }

        args.unshift(func_options);

        instance[name].apply(target, args);

      });
    },

    check_button: function(type) {
      var have_button = false;
      for(var i = 0; i < 7; i++) {
        if(options.panes[i] && $.type(options.panes[i].buttons) == 'array') {
          if(!have_button) {
            for(var j = 0; j < options.panes[i].buttons.length; j++) {
              if(options.panes[i].buttons[j].type == type) {
                have_button = true;
                break;
              }
            }
          }
        }
      }
      if(!have_button) {
        /// Если пользователь каким-то образом удалил кнопку настроек, то добавляем её
        for(var i = 6; i >= 0; i--) {
          if(!options.panes[i]) return;
          if((options.panes[i].buttons && options.panes[i].buttons.length) ||
              (options.panes[i].widgets && options.panes[i].widgets.length)) {
            if($.type(options.panes[i].buttons) != 'array') options.panes[i].buttons = [];

            var free_place = instance.checkPanePlaces(i, {height: 1, width: 1});
            if(free_place) {
              options.panes[i].buttons.push({ 'type': type, 
                                              'left': free_place[1],
                                              'top': free_place[0],
                                              'id': type + '_0' });

              have_button = true;
              break;
            }
          }
        }
      }
      if(!have_button) {
        /// все кнопки были удалены, добавляем дефолтную 
        /// кнопку настроек в первое пустое окошко
        for(var i = 0; i < 7; i++) {
          if(!options.panes[0].buttons.length) {
            options.panes[0].buttons = [];
            options.panes[0].buttons.push({ 'type': type, 
                                              'left': options.panes[0].width - 1,
                                              'top': options.panes[0].height - 1,
                                              'id': 'panel_settings_0' });
            break;
          }
        }
      }
    },

    /**
    * Функция парсит урл и возвращает структурированный объект
    * @param url - строка, урл. Абсолютный или относительный.
    * @return uri - объект вида:
    * {
    *   protocol: "протокол, http или https",
    *   hostname: "имя домена",
    *   port: "номер порта",
    *   pathname: "путь к скрипту, например /b0/b.php",
    *   search: "GET-запрос, например ?bid=123456",
    *   hash: "HASH-строка, например #myhash",
    *   origin: "протокол + домен, например - http://www.ganjawars.ru"
    * }
    */
    parseUrl: function(url) {
      if(url.indexOf('http://') == -1) {
        url = 'http://' + location.hostname + url;
      }
      var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

      var ar = parse_url.exec(url);

      var uri = {
        protocol: ar[1],
        hostname: ar[3],
        port: ar[4] || '',
        pathname: ar[5]? '/' + ar[5]: '',
        search: ar[6]? '?' + ar[6]: '',
        hash: ar[7]? '#' + ar[7]: '',
        origin: ar[1] + '://' + ar[3]
      };

      return uri;
    },

    /**
    * Функция поиска всех кнопок указанного класса
    * @param className - строка, тип кнопки
    * @return array - результат, массив из объектов вида:
    * [
    *   {
    *     paneID: 0, // ID окна
    *     button: { ... } // объект кнопки,
    *     index: 0 // порядковый индекс кнопки в массиве options.panes[N].buttons
    *   }, 
    *   {...}, 
    *   ...
    * ]
    */
    getAllButtons: function(className) {
      var result = [];
      for(var i = 0; i < options.panes.length; i++) {
        if($.type(options.panes[i]) != 'object') continue;
        if($.type(options.panes[i].buttons) != 'array') continue;
        for(var b = 0; b < options.panes[i].buttons.length; b++) {
          if(options.panes[i].buttons[b].type == className || !className) {
            result.push({
              paneID: i,
              button: options.panes[i].buttons[b],
              index: b
            });
          }
        }
      }
      return result;
    },

    /**
    * Программный клик по кнопке
    * @param btnID - идентификатор кнопки, будет произведён поиск во всех окнах
    * @param callback - если функция клика по кнопке поддерживает обратный вызов,
    *                   то будет вызван callback если он указан
    */
    clickButton: function(btnID, callback, failover) {
      $.each(instance.getAllButtons(), function(i, btn) {
        if(btn.button.id == btnID) {
          var type = instance.getSchema().buttons[btn.button.type];

          instance.loadScript(getFiles(type.file, type.module), function() {
            if(!instance[type['callback']]) {
              try{
                throw('"' + type['callback'] + '" for button ' + that.type + ', Pane ' + paneID + ' draw: ');
              } catch(e) {
                instance.dispatchException(e, 'Unknown callback function');
              }
              return;
            }
            var btn_callback = instance[type.callback];
            var __options = {};
            if(btn.button.arguments) {
              $.extend(__options, btn.button.arguments);
            }

            $.extend(__options, {
              save: function(__callback) {
                for(var key in __options) {
                  if(key == 'save') continue;
                  options.panes[paneID].buttons[index].arguments[key] = __options[key];
                }
                instance.setOptions(options, undefined, function() {
                  if(__callback) __callback();
                });
              }
            });
            try {
              btn_callback.apply($('<div>'), [__options, callback, failover]);
            } catch(e) {
              instance.dispatchException(e);
            }
          });
        }
      });
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

  $.easing.easeOutCubic = function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  }

  // Перезаписываем функцию $.ajax чтобы аякс работал на других доменах через ganjawars.ru
  var originalAjax = $.ajax;
  $.ajax = function() {
    if($.type(arguments[0]) == 'object') {
      var options = arguments[0];
    } else if($.type(arguments[1]) == 'object') {
      var options = arguments[1];
      options.url = arguments[0];
    }

    if(options.url.indexOf('http:') == -1) {
      var url = {
        origin: location.origin,
        pathname: options.url
      };
    } else {
      var url = __panel.parseUrl(options.url);
    }

    if(url.origin == location.origin || options['__panel_ajax'] || url.origin == 'http://new.gwpanel.org') {
      originalAjax.apply(this, [options]);
    } else if(url.hostname == 'www.ganjawars.ru' || url.hostname == 'ganjawars.ru') {
      options.url = 'http://ganjawars.ru' + url.pathname + (url.search || '');
      __panel.loadScript('panel/panel_ajax.js', function() {
        __panel.crossWindow.ajax(options);
      });
    }
  }

})(jQuery);
