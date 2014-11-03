QUnit.module('panel_settings');

function waitPanelInitialization(__window, callback) {
  // Ждём появления в документе указанного окна CSS-ки panel.css
  var check = function() {
    if(__window.__panel && __window.__panel.crossWindow) {
      __window.__panel.ready(callback);
      return;
    }
    setTimeout(check, 10);
  };
  check();
}

function waitFor(condition_func, success_func, timeout) {
  timeout = timeout || 10000; // Максимальный таймаут ожидания - 10 секунд

  var count = 0;
  var f = function() {
    if(condition_func()) {
      success_func();
      return;
    }
    count++;
    if(count * 10 > timeout) {
      QUnit.ok(false, 'Превышен интервал ожидания waitFor: ' + condition_func.toString());
      QUnit.start();
      return;
    }
    setTimeout(f, 10);
  }
  f();
}

QUnit.assert.function_exists = function(needle, haystack, message) {
  var exists = String(typeof(haystack)).toLowerCase() == 'function';
  QUnit.push(exists, exists, needle, 'функция ' + needle + ' существует');
};

QUnit.asyncTest("Тест открытия окна настроек", function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = options.panes[i].widgets = [];
  }

  __panel.setOptions(options, undefined, function() {
    $('<iframe id="settings-open-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
          assert.equal($('.pane-bubble:visible').length, 1, 
            'При пустой концигурации кнопка настроек должна появиться в первом окне');
          if($('.pane-bubble:visible').length != 1) {
            window.jQuery('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
            return;
          }
          /// кликаем по бабблу
          $('.pane-bubble:first').click();

          waitFor(function() {
            return $('.pane:visible .button').length > 0;
          }, function() {
            var pane = $('.pane:visible');
            /// Ждём прорисовки виджета
            assert.ok(pane.length > 0, 'Открылось окошко');
            var button = pane.find('.button');

            assert.ok(button.length > 0,
                      'Кнопка видна');

            button.find('a').click();

            waitFor(function() {
              return $('#panel-settings-editor:visible').length > 0;
            }, function() {
              assert.equal($('#panel-settings-editor:visible').length, 1, 
                'Открылось окошко настроек');
              assert.equal($('#panel-settings-editor div[data-role=navbar] a.ui-link').length,
                4, 'Видны 4 кнопки настроек');
              QUnit.start();
            });
          });
        }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest("Тест добавления кнопки", function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = [];
    options.panes[i].widgets = [];
  }

  __panel.setOptions(options, undefined, function() {
    $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
        assert.equal($('.pane-bubble:visible').length, 1, 
          'При пустой концигурации кнопка настроек должна появиться в первом окне');
        if($('.pane-bubble:visible').length != 1) {
          window.jQuery('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
          return;
        }
        /// кликаем по бабблу
        $('.pane-bubble:first').click();
        var pane = $('.pane:visible');
        /// Ждём прорисовки виджета
        assert.ok(pane.length > 0, 'Открылось окошко');
        var button = pane.find('.button');

        assert.ok(button.length > 0,
                  'Кнопка видна');

        button.find('a').click();

        waitFor(function() {
          return $('a[href=#edit-buttons-wrapper]').length > 0;
        }, function() {
          $('a[href=#edit-buttons-wrapper]').click();

          $('#button_panel_settings a').click();
          assert.equal($('#settings-form-popup:visible').length, 1,
            'окошко добавления кнопки должно появиться');
          $('#param-title').val('Тестовая кнопка');
          $('#select-pane-1').attr('checked', 'checked');
          $('#settings-form-popup .widget-save').click();

          assert.ok($('.panel-flash').text().indexOf('добавлен') > -1, 
            'Должно выйти сообщение');

          $('#panel-settings-editor .close-settings').click();

          $('#pane-bubble-1').click();

          waitFor(function() {
            return $('#panel-settings-editor:visible').length == 0;
          }, function() {
            assert.equal($('#panel-settings-editor:visible').length, 0, 
              'Окно настроек должно закрыться');
            assert.equal($('#pane-1:visible').length, 1, 'Окно №2 должно открыться');
            assert.equal($('#pane-1 .button.panel_settings').length, 1, 
              'Добавленная кнопка должна быть видна');

            assert.equal($('#pane-1 .button.panel_settings').text(), 'Тестовая кнопка',
              'проверка текста кнопки');
            assert.equal(that.contentWindow.__panel.getOptions().panes[1].buttons[0].id,
              'panel_settings_0', 'проверка ID кнопки');
            QUnit.start();
          }, 1500);
        });
      }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest("Тест добавления виджета", function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  options.panes[1].width = 4;
  options.panes[2].width = 6;

  options.widgets = [];

  __panel.setOptions(options, undefined, function() {
    $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
        /// Создаём виртуальный класс виджетов
        that.contentWindow.__panel.panel_foo_widget = function(options) {
          this.append('<p>Panel foo widget</p>');
        };

        that.contentWindow.panel_apply.widgets['panel_foo_widget'] = {
          callback: 'panel_foo_widget',
          title: 'Тестовый виджет',
          height: 2,
          width: 6,
          file: 'panel.js',
          module: 'panel'
        };
        /// кликаем по бабблу
        $('.pane-bubble:first').click();
        var pane = $('.pane:visible');
        /// Ждём прорисовки виджета
        var button = pane.find('.button');
        button.find('a').click();

        setTimeout(function() {
          $('a[href=#edit-widgets-wrapper]').click();

          assert.equal($('#add-widget-panel_foo_widget').length, 1, 
            'Видна кнопка добавления виджета');
          $('#add-widget-panel_foo_widget').click();

          assert.equal($('#settings-form-popup').length, 1,
            'Открылся попап добавления');

          assert.equal($('#select-pane-1').attr('disabled'), 'disabled',
            'Виджет шириной 6 не должен влазить во второе окошко');

          assert.notEqual($('#select-pane-2').attr('disabled'), 'disabled',
            'Виджет шириной 6 должен влазить в третье окошко');

          $('#select-pane-2').click();

          $('.widget-save').click();

          $('#panel-settings-editor .close-settings').click();
          $('#pane-bubble-2').click();
          
          setTimeout(function() {
            assert.equal($('#pane-2:visible').length, 1, 
              'Открылось третье окошко');

            assert.equal($('#pane-2 #panel_foo_widget_1').length, 1,
              'Добавленный виджет виден');
            QUnit.start();
          }, 100);
        }, 1000);
      }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
});

QUnit.asyncTest("Тест формы добавления и настройки плавающего виджета", function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = options.panes[i].widgets = [];
  }
  options.widgets = [];

  __panel.setOptions(options, undefined, function() {
    $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
        /// Создаём виртуальный класс виджетов
        that.contentWindow.__panel.panel_foo_widget = function(options) {
          this.append('<p>Panel foo widget</p>');
          var that = this;
          $.each(options, function(key, val) {
            if(key == 'save') return;
            that.append('<p>' + key + '=' + val + '</p>');
          });
        };

        that.contentWindow.__panel.test_checkboxes_options = function() {
          return ['test1', 'test2', 'test3'];
        };

        that.contentWindow.__panel.test_checkboxes_options_assoc = function() {
          return {'test1': 'Тест1', 'test2': 'Тест2', 'test3': 'Тест3'};
        };

        that.contentWindow.panel_apply.widgets['panel_foo_widget'] = {
          callback: 'panel_foo_widget',
          configure: {
            checkbox1: {
              title: 'Тест checkbox1',
              type: 'checkbox',
              default: 0
            },
            checkbox2: {
              title: 'Тест checkbox2',
              type: 'checkbox',
              default: 1
            },
            checkboxes1: {
              title: 'Тест checkboxes 1',
              type: 'checkboxes',
              options: '__panel.test_checkboxes_options()',
              default: []
            },
            checkboxes2: {
              title: 'Тест checkboxes 2',
              type: 'checkboxes',
              options: '__panel.test_checkboxes_options()',
              default: ['test1']
            },
            checkboxes3: {
              title: 'Тест checkboxes 3',
              type: 'checkboxes',
              options: '__panel.test_checkboxes_options_assoc()',
              default: ''
            },
            checkboxes4: {
              title: 'Тест checkboxes 4',
              type: 'checkboxes',
              options: '__panel.test_checkboxes_options_assoc()',
              default: ['test3']
            },
            select1: {
              title: 'Тест select 1',
              type: 'select',
              options: '__panel.test_checkboxes_options()',
              default: ''
            },
            select2: {
              title: 'Тест select 2',
              type: 'select',
              options: '__panel.test_checkboxes_options()',
              default: 'test1'
            },            
            select3: {
              title: 'Тест select 3',
              type: 'select',
              options: '__panel.test_checkboxes_options_assoc()',
              default: ''
            },
            select4: {
              title: 'Тест select 4',
              type: 'select',
              options: '__panel.test_checkboxes_options_assoc()',
              default: 'test3'
            },
            text1: {
              title: 'Тест text1',
              type: 'text',
              default: ''
            },
            text2: {
              title: 'Тест text2',
              type: 'text',
              default: 'тест'
            }

          },
          title: 'Тестовый виджет',
          height: 1,
          width: 2,
          file: 'panel.js',
          module: 'panel'
        };
        /// кликаем по бабблу
        $('.pane-bubble:first').click();
        var pane = $('.pane:visible');
        /// Ждём прорисовки виджета
        var button = pane.find('.button');
        button.find('a').click();

        waitFor(function() {
          return $('a[href=#edit-widgets-wrapper]').length > 0;
        }, function() {
          $('a[href=#edit-widgets-wrapper]').click();

          assert.equal($('#add-widget-panel_foo_widget').length, 1, 
            'Видна кнопка добавления виджета');
          $('#add-widget-panel_foo_widget').click();

          assert.equal($('#settings-form-popup').length, 1,
            'Открылся попап добавления');

          assert.notEqual($('#param-panel_foo_widget-checkbox1').attr('checked'), 'checked',
            'Чекбокс 1 должен быть отжат');
          assert.equal($('#param-panel_foo_widget-checkbox2').attr('checked'), 'checked',
            'Чекбокс 2 должен быть нажат');

          assert.equal($('input[name=panel_foo_widget_checkboxes1][checked=checked]').length, 0,
            'Чекбоксы №1 не должны содержать значение');
          assert.equal($('input[name=panel_foo_widget_checkboxes2][checked=checked]').attr('id'),
            'param-panel_foo_widget-test1-checkboxes2', 'Чекбоксы №2 должны быть равны [test1]');
          assert.equal($('input[name=panel_foo_widget_checkboxes3][checked=checked]').length, 0,
            'Чекбоксы №3 не должны содержать значение');
          assert.equal($('input[name=panel_foo_widget_checkboxes4][checked=checked]').attr('id'),
            'param-panel_foo_widget-test3-checkboxes4', 'Чекбоксы №4 должны быть равны [test3]');

          assert.equal($('#param-panel_foo_widget-select1').val(), '',
            'Селекты №1 не должны содержать значение');
          assert.equal($('#param-panel_foo_widget-select2').val(),
            'test1', 'Селекты №2 должны быть равны test1');
          assert.equal($('#param-panel_foo_widget-select3').val(), '',
            'Селекты №3 не должны содержать значение');
          assert.equal($('#param-panel_foo_widget-select4').val(),
            'test3', 'Селекты №4 должны быть равны test3');

          assert.equal($('#param-panel_foo_widget-text1').val(), '',
            'Текстовый инпут 1 не должен содержать значение');
          assert.equal($('#param-panel_foo_widget-text2').val(), 'тест',
            'Текстовый инпут 2 должен содержать дефолтное значение "тест"');

          /// Меняем значения и добавляем виджет
          $('#param-panel_foo_widget-checkbox1').attr('checked', 'checked').change();
          $('#param-panel_foo_widget-checkbox2').removeAttr('checked').change();

          $('input[name=panel_foo_widget_checkboxes1]').attr('checked', 'checked').change();
          $('input[name=panel_foo_widget_checkboxes2]').removeAttr('checked').change();
          $('input[name=panel_foo_widget_checkboxes3]').attr('checked', 'checked').change();
          $('input[name=panel_foo_widget_checkboxes4]').removeAttr('checked').change();

          $('#param-panel_foo_widget-select1').val('test1').change();
          $('#param-panel_foo_widget-select2').val('').change();
          $('#param-panel_foo_widget-select3').val('test3').change();
          $('#param-panel_foo_widget-select4').val('').change();

          $('#param-panel_foo_widget-text1').val('тест').change();
          $('#param-panel_foo_widget-text2').val('').change();

          $('#select-pane-float').click();

          $('.widget-save').click();

          waitFor(function() {
            return that.contentWindow.__panel.getOptions().widgets.length > 0;
          }, function() {
            var widget = that.contentWindow.__panel.getOptions().widgets[0];

            assert.equal(widget.arguments.checkbox1, true, 'Проверка checkbox1');
            assert.equal(widget.arguments.checkbox2, false, 'Проверка checkbox2');
            assert.deepEqual(widget.arguments.checkboxes1, 
              ['test1', 'test2', 'test3'], 'Проверка checkboxes1');
            assert.deepEqual(widget.arguments.checkboxes2, [], 'Проверка checkboxes2');
            assert.deepEqual(widget.arguments.checkboxes3, 
              ['test1', 'test2', 'test3'], 'Проверка checkboxes3');
            assert.deepEqual(widget.arguments.checkboxes4, [], 'Проверка checkboxes4');
            assert.deepEqual(widget.arguments.select1, 'test1', 'Проверка select1');
            assert.deepEqual(widget.arguments.select2, '', 'Проверка select2');
            assert.deepEqual(widget.arguments.select3, 'test3', 'Проверка select3');
            assert.deepEqual(widget.arguments.select4, '', 'Проверка select4');

            assert.deepEqual(widget.arguments.text1, 'тест', 'Проверка text1');
            assert.deepEqual(widget.arguments.text2, '', 'Проверка text2');

            $('#panel-settings-editor .close-settings').click();
            assert.equal($('#float-0-panel_foo_widget:visible').length, 1, 'Виджет виден');
            assert.equal($('#float-0-panel_foo_widget').text(), 'Panel foo widgetcheckbox1=truecheckbox2=falsecheckboxes1=test1,test2,test3checkboxes2=checkboxes3=test1,test2,test3checkboxes4=select1=test1select2=select3=test3select4=text1=тестtext2=');

            waitFor(function() {
              return $('#panel-settings-editor:visible').length == 0;
            }, function() {
              $('#float-0-panel_foo_widget').dblclick();

              assert.equal($('#settings-form-popup').length, 1,
                'Открылся попап редактирования');

              assert.equal($('#param-panel_foo_widget_1-checkbox1').attr('checked'), 'checked',
                'Чекбокс 1 должен быть нажат');
              assert.notEqual($('#param-panel_foo_widget_1-checkbox2').attr('checked'), 'checked',
                'Чекбокс 2 должен быть отжат');

              assert.equal($('input[name=panel_foo_widget_1_checkboxes1][checked=checked]').length, 3,
                'Чекбоксы №1 должны содержать 3 значения');
              assert.equal($('input[name=panel_foo_widget_1_checkboxes2][checked=checked]').length, 0,
                'Чекбоксы №2 не должны содержать значения');
              assert.equal($('input[name=panel_foo_widget_1_checkboxes3][checked=checked]').length, 3,
                'Чекбоксы №3 должны содержать 3 значения');
              assert.equal($('input[name=panel_foo_widget_1_checkboxes4][checked=checked]').length, 0,
                'Чекбоксы №4 не должны содержать значения');

              assert.equal($('#param-panel_foo_widget_1-select1').val(), 'test1',
                'Селекты №1 должны быть равны test1');
              assert.equal($('#param-panel_foo_widget_1-select2').val(), '', 
                'Селекты №2 не должны содержать значение');
              assert.equal($('#param-panel_foo_widget_1-select3').val(), 'test3',
                'Селекты №3 должны быть равны test3');
              assert.equal($('#param-panel_foo_widget_1-select4').val(), '',
                'Селекты №2 не должны содержать значение');

              assert.equal($('#param-panel_foo_widget_1-text1').val(), 'тест',
                'Текстовый инпут 1 должен содержать дефолтное значение "тест"');
              assert.equal($('#param-panel_foo_widget_1-text2').val(), '',
                'Текстовый инпут 2 не должен содержать значение');

              $('#param-panel_foo_widget_1-checkbox1').attr('checked', 'checked').change();
              $('#param-panel_foo_widget_1-checkbox2').removeAttr('checked').change();

              $('input[name=panel_foo_widget_1_checkboxes1]').attr('checked', 'checked').change();
              $('input[name=panel_foo_widget_1_checkboxes2]').removeAttr('checked').change();
              $('input[name=panel_foo_widget_1_checkboxes3]').attr('checked', 'checked').change();
              $('input[name=panel_foo_widget_1_checkboxes4]').removeAttr('checked').change();

              $('#param-panel_foo_widget_1-select1').val('test1').change();
              $('#param-panel_foo_widget_1-select2').val('').change();
              $('#param-panel_foo_widget_1-select3').val('test3').change();
              $('#param-panel_foo_widget_1-select4').val('').change();

              $('#param-panel_foo_widget_1-text1').val('тест').change();
              $('#param-panel_foo_widget_1-text2').val('').change();

              assert.equal($('#fixed').length, 1, 'Должен быть чекбокс фиксации');
              $('#fixed').attr('checked', 'checked').change().checkboxradio('refresh');
              assert.equal($('#no-opacity').length, 1, 'Должен быть чекбокс убирания прозрачности');
              $('#no-opacity').attr('checked', 'checked').change().checkboxradio('refresh');
              assert.equal($('#blacklist-page').length, 1, 'Должен быть чекбокс не показывать на этой странице');
              assert.equal($('#only-page').length, 1, 'Должен быть чекбокс показывать только на этой странице');
              $('#only-page').attr('checked', 'checked').change().checkboxradio('refresh');
              
              $('.widget-save').click();

              waitFor(function() {
                return $('#settings-form-popup:visible').length == 0;
              }, function() {
                assert.equal($('#settings-form-popup:visible').length, 0,
                  'Попап редактирования закрылся');

                var widget = that.contentWindow.__panel.getOptions().widgets[0];

                assert.equal(widget.arguments.checkbox1, true, 'Проверка checkbox1');
                assert.equal(widget.arguments.checkbox2, false, 'Проверка checkbox2');
                assert.deepEqual(widget.arguments.checkboxes1, 
                  ['test1', 'test2', 'test3'], 'Проверка checkboxes1');
                assert.deepEqual(widget.arguments.checkboxes2, [], 'Проверка checkboxes2');
                assert.deepEqual(widget.arguments.checkboxes3, 
                  ['test1', 'test2', 'test3'], 'Проверка checkboxes3');
                assert.deepEqual(widget.arguments.checkboxes4, [], 'Проверка checkboxes4');
                assert.deepEqual(widget.arguments.select1, 'test1', 'Проверка select1');
                assert.deepEqual(widget.arguments.select2, '', 'Проверка select2');
                assert.deepEqual(widget.arguments.select3, 'test3', 'Проверка select3');
                assert.deepEqual(widget.arguments.select4, '', 'Проверка select4');

                assert.deepEqual(widget.arguments.text1, 'тест', 'Проверка text1');
                assert.deepEqual(widget.arguments.text2, '', 'Проверка text2');

                assert.deepEqual(widget.fixed, true, 'Проверка fixed');
                assert.deepEqual(widget.no_opacity, true, 'Проверка no_opacity');
                assert.deepEqual(widget.only_page, location.pathname + that.contentWindow.location.search, 'Проверка only_page');

                QUnit.start();
                /// переходим на другую страницу
              });
            });
          });
        });
      }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
});

QUnit.asyncTest("Тест изменения видимости плавающих виджетов", function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = options.panes[i].widgets = [];
  }
  options.widgets = [];
  options.widgets.push({
    type: 'panel_foo_widget',
    width: 6,
    height: 1,
    left: 100,
    top: 200,
    arguments: {},
    module: 'panel'
  });

  var current = location.pathname;
  var suff = '?gwpanel_testing&continue&gwpanel_pause';
  var dest = (current == '/forum.php'? '/me/': '/forum.php');

  var $widget;

  __panel.setOptions(options, undefined, function() {
    $('<iframe id="goto-href-iframe" src="' + current + suff + '"></iframe>').load(function() {
      var __window = this.contentWindow;
      waitFor(function() {
        return __window.__panel && __window.__panel.__ready && __window.__panel.__load;
      }, function() {
        var $ = __window.jQuery;
        __window.__panel.panel_foo_widget = function(options) {
          $widget = this;
          this.append('<p>Panel foo widget</p>');
          var that = this;
          $.each(options, function(key, val) {
            if(key == 'save') return;
            that.append('<p>' + key + '=' + val + '</p>');
          });
        };

        __window.panel_apply.widgets['panel_foo_widget'] = {
          callback: 'panel_foo_widget',
          configure: {},
          title: 'Тестовый виджет',
          height: 1,
          width: 2,
          file: 'panel.js',
          module: 'panel'
        };

        __window.__panel.__ready();
        __window.__panel.__load();

        //console.log('current location: ', __window.location.pathname + __window.location.search + __window.location.hash);
        //console.log('__window.location.pathname =', __window.location.pathname , 'current=', current);
        if(__window.location.pathname == current) {
          if (__window.location.hash.indexOf('test-finish') > -1) {
            /// это завершение теста, мы отрубили виджет на этой странице
            assert.equal($('.panel_foo_widget:visible').length, 0, 'Виджета не должно быть на этой странице');
            QUnit.start();
            return;
          }
          /// на этой странице мы выставляем настройки виджета
          waitFor(function() {
            return $widget && $widget.length > 0;
          }, function() {
            $widget.dblclick();
          });
          waitFor(function() {
            return $('#blacklist-page').length > 0;
          }, function() {
            if(__window.location.hash.indexOf('blacklist') > -1) {
              //console.log('Шаг 3, тестируем blacklist');
              $('#blacklist-page').attr('checked', 'checked').change().checkboxradio('refresh');
              $('.widget-save').click();
              __window.location.href = dest + suff + '#blacklist';
              $widget = false;
            } else if(__window.location.hash.indexOf('only-page-class') > -1) {
              //console.log('Шаг 2. тестируем выставление only-page-class');
              $('#only-page-class').attr('checked', 'checked').change().checkboxradio('refresh');
              $('.widget-save').click();
              __window.location.href = dest + suff + '#only-page-class';
              $widget = false;
            } else {
              //console.log('Шаг первый, выставляем "только на этой странице" и переходим на dest');
              /// Шаг первый, выставляем "только на этой странице" и переходим на dest
              $('#only-page').attr('checked', 'checked').change().checkboxradio('refresh');
              $('.widget-save').click();
              __window.location.href = dest + suff + '#only-page';
              $widget = false;
            }
          });
        } else if(__window.location.pathname == dest) {
          /// на этой странице мы проверяем видимость
          if(__window.location.hash.indexOf('only-page-class') > -1) {
            //console.log('Конец шага 2, должен быть выставлен only_page_class');
            assert.equal(__window.__panel.getOptions().widgets[0].only_page_class, current);
            assert.equal($('.panel_foo_widget:visible').length, 0, 'Виджета не должно быть на этой странице');
            __window.location.href = current + suff + '#blacklist';
          } else if(__window.location.hash.indexOf('only-page') > -1) {
            /// конец шага 1, виджета не должно здесь быть, только на главной
            //console.log('конец шага 1, виджета не должно здесь быть, только на главной');
            assert.equal(__window.__panel.getOptions().widgets[0].only_page, current + __window.location.search);
            assert.equal($('.panel_foo_widget:visible').length, 0, 'Виджета не должно быть на этой странице');
            /// возвращаемся на предыдущую страницу и тестируем класс страниц
            __window.location.href = current + suff + '#only-page-class';
          } else if(__window.location.hash.indexOf('blacklist') > -1) {
            //console.log('Конец шага 3, blacklist должен содержать страницу /me/');
            assert.deepEqual(__window.__panel.getOptions().widgets[0].blacklist, [current]);
            assert.equal($('.panel_foo_widget:visible').length, 0, 'Виджет не должен быть на этой странице');
            /// переходим на основную
            __window.location.href = current + suff + '#test-finish';
          }
        }
      });

    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
});

QUnit.asyncTest("Тест изменения настроек модулей", function(assert) {
  expect(7);
  var options = jQuery.extend({}, panelSettingsCollection.empty);

  var apply_initialized;

  __panel.setOptions(options, undefined, function() {
    var frame;

    waitFor(function() {
      return frame && frame.contentWindow && frame.contentWindow.__panel &&
             frame.contentWindow.__panel.__ready &&
             frame.contentWindow.__panel.__load &&
             frame.contentWindow.panel_apply;
    }, function() {
      with(frame.contentWindow) {
        if(!panel_apply.pages[document.location.pathname]) {
          panel_apply.pages[document.location.pathname] = [];
        }
        panel_apply.pages[document.location.pathname].push('panel_test_func');
        panel_apply.settings['panel_test_func'] = {
          file: 'panel.js',
          module: 'panel',
          description: 'тестовая функция',
          configure: {
            checkbox: {
              type: 'checkbox',
              title: 'тестовый checkbox',
              default: true
            },
            checkbox1: {
              type: 'checkbox',
              title: 'тестовый checkbox2',
              default: true
            }
          }
        }
        __panel.panel_test_func = function(params) {
        }

        apply_initialized = true;

        __panel.__ready();
        __panel.__load();
      }
    }, 5000);
    
    frame = $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
        waitFor(function() {
          return apply_initialized;
        }, function() {
          $('.pane-bubble:first').click();
          var pane = $('.pane:visible');
          /// Ждём прорисовки виджета
          var button = pane.find('.button.panel_settings');
          button.find('a').click();

          waitFor(function() {
            return $('a[href=#edit-modules-wrapper]').length > 0;
          }, function() {
            $('a[href=#edit-modules-wrapper]').click();

            $('.ui-collapsible-heading-toggle').each(function() {
              if($(this).text().indexOf('Базовый модуль GWPanel 2') != -1) {
                $(this).click();
                assert.equal($('input[name=panel_test_func]:visible').length, 1,
                  'чекбокс включения-выключения модуля должен быть виден');

                assert.equal($('input[name=panel_test_func][checked=checked]').length, 1,
                  'чекбокс должен быть включен');

                assert.equal($('#param-panel_test_func-checkbox').length, 1,
                  'чекбокс настроек должен быть виден');
                assert.equal($('#param-panel_test_func-checkbox').attr('checked'), 'checked',
                  'чекбокс настроек должен быть включен');

                $('label[for=param-panel_test_func-checkbox]').click();

                var options = that.contentWindow.__panel.getOptions();
                assert.equal(options.settings.panel.panel_test_func.checkbox, false,
                  'чекбокс в настройках должен быть отключен');
                assert.equal(options.settings.panel.panel_test_func.checkbox1, true,
                  'чекбокс в настройках должен быть включен');

                $('input[name=panel_test_func]').prev().click();

                var options = that.contentWindow.__panel.getOptions();

                assert.notEqual(options.blacklist.indexOf('panel_test_func'), -1,
                  'panel_test_func должен быть в чёрном списке');

                QUnit.start();
              }
            });
          });
        });
      }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show().get(0);
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
});

QUnit.asyncTest("Тест отключения функций", function(assert) {
  expect(1);
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  options.blacklist = ['panel_test_func'];

  var apply_initialized;

  __panel.setOptions(options, undefined, function() {
    var frame;
    waitFor(function() {
      return frame && frame.contentWindow && frame.contentWindow.__panel 
             && frame.contentWindow.__panel.__ready 
             && frame.contentWindow.__panel.__load;
    }, function() {

      with(frame.contentWindow) {
        if(!panel_apply.pages[document.location.pathname]) {
          panel_apply.pages[document.location.pathname] = [];
        }
        panel_apply.pages[document.location.pathname].push('panel_test_func');
        panel_apply.pages[document.location.pathname].push('panel_test_func_default_false');
        panel_apply.settings['panel_test_func'] = {
          file: 'panel.js',
          module: 'panel',
          description: 'тестовая функция',
          configure: {
            checkbox: {
              type: 'checkbox',
              title: 'тестовый checkbox',
              default: true
            }
          }
        }
        panel_apply.settings['panel_test_func_default_false'] = {
          file: 'panel.js',
          module: 'panel',
          description: 'тестовая функция',
          configure: {
            checkbox: {
              type: 'checkbox',
              title: 'тестовый checkbox',
              default: true
            }
          },
          default: false
        }
        __panel.panel_test_func = function(params) {
          QUnit.ok(false, 'функция panel_test_func не должна была запуститься');
          QUnit.start();
        }
        __panel.panel_test_func_default_false = function(params) {
          QUnit.ok(false, 'функция panel_test_func_default_false не должна была запуститься');
          QUnit.start();
        }
        /// инициализируем панель
        __panel.__ready();
        __panel.__load();

        apply_initialized = true;
      }
    })
    
    frame = $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        waitFor(function() {
          return apply_initialized;
        }, function() {
          QUnit.ok(true, 'Отключенная функция не запустилась');
          QUnit.start();
        });
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show().get(0);
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
});

QUnit.asyncTest("Тест включения функций, отключенных по-дефолту", function(assert) {
  expect(1);
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  options.whitelist = ['panel_test_func'];

  var apply_initialized;

  var completed = false;
  __panel.setOptions(options, undefined, function() {
    var frame;
    waitFor(function() {
      return frame && frame.contentWindow && frame.contentWindow.__panel 
             && frame.contentWindow.__panel.__ready 
             && frame.contentWindow.__panel.__load;
    }, function() {

      with(frame.contentWindow) {
        if(!panel_apply.pages[document.location.pathname]) {
          panel_apply.pages[document.location.pathname] = [];
        }
        panel_apply.pages[document.location.pathname].push('panel_test_func');
        panel_apply.settings['panel_test_func'] = {
          file: 'panel.js',
          module: 'panel',
          description: 'тестовая функция, которая по-дефолту отключена',
          configure: {
            checkbox: {
              type: 'checkbox',
              title: 'тестовый checkbox',
              default: true
            }
          },
          default: false
        }
        __panel.panel_test_func = function(params) {
          QUnit.ok(true, 'Эта функция должна была запуститься');
          completed = true;
          QUnit.start();
        }
        /// инициализируем панель
        __panel.__ready();
        __panel.__load();

        apply_initialized = true;
      }
    })
    
    frame = $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        waitFor(function() {
          return apply_initialized;
        }, function() {
          if(!completed) {
            QUnit.ok(false, 'Отключенная функция не запустилась');
            QUnit.start();
          }
        });
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show().get(0);
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
});

QUnit.asyncTest('Тест сохранения опций для плавающих виджетов встроенной функцией options.save', function(assert) {
  expect(6);

  var options = jQuery.extend({}, panelSettingsCollection.empty);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = [];
    options.panes[i].widgets = [];
  }

  options.widgets.push({
    type: 'panel_foo_widget',
    width: 6,
    height: 1,
    left: 100,
    top: 200,
    arguments: {
      param1: true,
      param2: 'test'
    },
    module: 'panel'
  });

  var apply_initialized;

  var index = options.widgets.length - 1;

  __panel.setOptions(options, undefined, function() {
    var frame;

    waitFor(function() {
      return frame && frame.contentWindow && frame.contentWindow.__panel 
             && frame.contentWindow.panel_apply && frame.contentWindow.__panel.__ready
             && frame.contentWindow.__panel.__load;
    }, function() {
      var __window = frame.contentWindow;
      __window.panel_apply.widgets['panel_foo_widget'] = {
        callback: 'panel_foo_widget',
        title: 'Тестовый виджет',
        height: 2,
        width: 6,
        file: 'panel.js',
        configure: {
          param1: {
            type: 'checkbox',
            title: 'тестовый параметр'
          }
        },
        module: 'panel'
      };

      __window.__panel.panel_foo_widget = function(options) {
        assert.equal(jQuery.type(options), 'object');
        assert.equal(options.param1, true);
        assert.equal(options.param2, 'test');
        assert.equal(jQuery.type(options.save), 'function', 
          'Метод save должен присутствовать в опциях');
        options.param1 = false;
        options.param2 = 'test1';
        options.save(function() {
          assert.equal(frame.contentWindow.__panel.getOptions()
            .widgets[index].arguments.param1, false, 
            'Значение param1 должно поменяться');
          assert.equal(frame.contentWindow.__panel.getOptions()
            .widgets[index].arguments.param2, 'test1', 
            'Значение param2 должно поменяться');
          /// Мы не должны сразу вызывать окончание теста, поскольку
          /// событие о смене настроек уйдёт в следующий тест.
          /// Следует немного подождать...
          setTimeout(function() {
            QUnit.start();
          }, 200);
        });
      };
      /// инициализируем панель
      __window.__panel.__ready();
      __window.__panel.__load();

      apply_initialized = true;
    });

    frame = $('<iframe id="float-widgets-options-save-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;
      var __window = this.contentWindow;

      waitPanelInitialization(this.contentWindow, function() {
        waitFor(function() {
          return apply_initialized;
        }, function() {
          __window.__panel.redrawFloatWidgets();
        }, 5000);
      });

    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).get(0);

    //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
  });
});

QUnit.asyncTest('Тест сохранения опций для виджетов встроенной функцией options.save', function(assert) {
  expect(6);
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  options.panes[1].width = 4;
  options.panes[2].width = 6;

  options.panes[0].widgets.push({
    type: 'panel_foo_widget',
    width: 6,
    height: 1,
    left: 0,
    top: 0,
    arguments: {
      param1: true
    },
    id: 'panel_foo_widget_1'
  });

  options.widgets = [];

  var apply_initialized;

  __panel.setOptions(options, undefined, function() {
    assert.equal(__panel.getOptions().panes[0].widgets.length, 1, 'Опции виджета сохранились');
    var frame;

    waitFor(function() {
      return frame && frame.contentWindow && frame.contentWindow.__panel
              && frame.contentWindow.panel_apply && frame.contentWindow.__panel.__ready
             && frame.contentWindow.__panel.__load;
    }, function() {
      var __window = frame.contentWindow;
      __window.__panel.panel_foo_widget = function(options) {
        assert.equal(jQuery.type(options), 'object');
        assert.equal(options.param1, true);
        assert.equal(jQuery.type(options.save), 'function', 
          'Метод save должен присутствовать в опциях');
        options.param1 = false;
        options.save(function() {
          assert.equal(frame.contentWindow.__panel.getOptions()
            .panes[0].widgets[0].arguments.param1, false, 
            'Значение должно поменяться');
          /// Мы не должны сразу вызывать окончание теста, поскольку
          /// событие о смене настроек уйдёт в следующий тест.
          /// Следует немного подождать...
          setTimeout(function() {
            QUnit.start();
          }, 200);
        });
      };

      /// Создаём виртуальный класс виджетов
      __window.panel_apply.widgets['panel_foo_widget'] = {
        callback: 'panel_foo_widget',
        title: 'Тестовый виджет',
        height: 2,
        width: 6,
        file: 'panel.js',
        configure: {
          param1: {
            type: 'checkbox',
            title: 'тестовый параметр'
          }
        },
        module: 'panel'
      };
      /// инициализируем панель
      __window.__panel.__ready();
      __window.__panel.__load();

      apply_initialized = true;
    });

    frame = $('<iframe id="widgets-options-save-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
          assert.equal(this.__panel.getOptions().panes[0].widgets.length, 1, 
            'в настройках должен быть один виджет');
          /// кликаем по бабблу, виджет должен прорисоваться и функция прорисовки 
          /// виджета должна быть вызвана
          waitFor(function() {
            return apply_initialized;
          }, function() {
            $('.pane-bubble:first').click();
          });
      }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show().get(0);
  });
});

QUnit.asyncTest('Тест сохранения опций для кнопок встроенной функцией options.save', function(assert) {
  expect(6);
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = [];
    options.panes[i].widgets = [];
  }
  options.panes[0].buttons.push({
    type: 'panel_test_button',
    title: 'Test button',
    left: 0,
    top: 0,
    arguments: {
      param1: true
    }
  });
  options.panes[0].buttons.push({
    type: 'panel_settings',
    title: 'настройки',
    left: 1,
    top: 0,
    arguments: {
      param1: true
    }
  });

  var apply_initialized;

  __panel.setOptions(options, undefined, function() {
    assert.equal(options.panes[0].buttons.length, 2, 'Опции кнопок сохранились');

    var frame;

    waitFor(function() {
      return frame && frame.contentWindow && frame.contentWindow.__panel &&
             frame.contentWindow.panel_apply && frame.contentWindow.__panel.__ready
             && frame.contentWindow.__panel.__load;
    }, function() {
      var __window = frame.contentWindow;
      __window.__panel.panel_test_button = function(options) {
        assert.equal(jQuery.type(options), 'object');
        assert.equal(options.param1, true);
        assert.equal(jQuery.type(options.save), 'function', 
          'Метод save должен присутствовать в опциях');
        options.param1 = false;
        options.save(function() {
          assert.equal(frame.contentWindow.__panel.getOptions()
            .panes[0].buttons[0].arguments.param1, false, 
            'Значение должно поменяться');
          /// Мы не должны сразу вызывать окончание теста, поскольку
          /// событие о смене настроек уйдёт в следующий тест.
          /// Следует немного подождать...
          setTimeout(function() {
            QUnit.start();
          }, 200);
        });
      };
      /// Создаём виртуальный класс кнопок
      __window.panel_apply.buttons['panel_test_button'] = {
        callback: 'panel_test_button',
        title: 'Test button',
        file: 'panel.js',
        configure: {
          param1: {
            type: 'checkbox',
            title: 'тестовый параметр'
          }
        },
        module: 'panel'
      };
      /// инициализируем панель
      __window.__panel.__ready();
      __window.__panel.__load();

      apply_initialized = true;
    });

    frame = $('<iframe id="button-options-save-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;

      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
          assert.equal(that.contentWindow.__panel.getOptions().panes[0].buttons.length, 2, 
            'в настройках должны быть две кнопки');
          waitFor(function() {
            return apply_initialized;
          }, function() {
            /// кликаем по бабблу, виджет должен прорисоваться и функция прорисовки 
            /// виджета должна быть вызвана
            $('.pane-bubble:first').click();

            /// Кликаем по кнопке
            $('#button_panel_test_button_0 a').click();
          }, 5000);
      }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show().get(0);
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest('Тестирование менеджера настроек, создание с нуля', function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = [];
    options.panes[i].widgets = [];
  }

  var salt = Math.random();
  var test_key = 'test_' + String(Math.random() * 100000).split('.')[0];
  options.system[test_key] = salt;
  var variantID;

  __panel.set(__panel.getEnv() + '_variants', null, function() {
  __panel.setOptions(options, undefined, function() {
    var frame;
    frame = $('<iframe id="button-options-variants-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue"></iframe>').load(function() {
      var that = this;

      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
          if(that.contentWindow.location.search.indexOf(salt) == -1) {
            /// кликаем по бабблу, виджет должен прорисоваться и функция прорисовки 
            /// виджета должна быть вызвана
            $('.pane-bubble:first').click();

            /// Кликаем по кнопке
            $('.button.panel_settings a').click();

            waitFor(function() {
              return $('#panel-settings-editor .ui-icon-edit').length > 0;
            }, function() {
              $('#panel-settings-editor .ui-icon-edit').click();
              $('.add-options-variant .ui-collapsible-heading-toggle:first').click();
              $('#add-title').val('test2');
              $('.add-options-variant input[type=submit]').click();

              setTimeout(function() {
                assert.equal($('#add-title:visible').length, 0, 'Форма добавления должна закрыться');

                assert.ok($('#variant-name option:contains(test2)').length > 0, 'Вариант добавлен');
                variantID = $('#variant-name option:contains(test2)').attr('value');
                $('#variant-name').val(variantID).change();

                that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
                  assert.equal(data, variantID, 'Вариант должен совпадать');
                  setTimeout(function() {
                    that.contentWindow.location.href = that.contentWindow.location.href + '&' + salt;
                  }, 200);
                });
              }, 400);
              //QUnit.start();
            });
          } else if(that.contentWindow.location.search.indexOf('finish') == -1) {
            // после обновления страницы с солью, проверяем вариант
            var current_options = that.contentWindow.__panel.getOptions();
            that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
              assert.equal(data, variantID, 'Вариант в новом окне должен совпадать');
              assert.equal(current_options.widgets.length, 0);
              assert.equal(current_options.panes[0].buttons.length, 1);
              assert.equal(current_options.panes[0].widgets.length, 0);
              assert.equal(current_options.panes[1].buttons.length, 0);
              assert.equal(current_options.panes[1].widgets.length, 0);
              assert.equal(current_options.panes[2].buttons.length, 0);
              assert.equal(current_options.panes[2].widgets.length, 0);
              assert.equal(current_options.panes[3].buttons.length, 0);
              assert.equal(current_options.panes[3].widgets.length, 0);

              $('.pane-bubble:first').click();

              /// Кликаем по кнопке
              $('.button.panel_settings a').click();

              waitFor(function() {
                return $('#panel-settings-editor .ui-icon-edit').length > 0;
              }, function() {
                $('#panel-settings-editor .ui-icon-edit').click();

                $('#variant-name').val('default').change();
                that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
                  assert.equal(data, 'default', 'Вариант должен быть default');
                  setTimeout(function() {
                    that.contentWindow.location.href = that.contentWindow.location.href + '&finish';
                  }, 500);
                });
              });
            });
          } else {
            /// Окончание теста, проверяем первоначальные настройки
            that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
              assert.equal(data, 'default', 'Вариант в новой вкладке должен быть default');
              var current_options = that.contentWindow.__panel.getOptions();
              assert.equal(current_options.system[test_key], salt, 'Первоначальные настройки возвращены');
              QUnit.start();
            });
          }
        }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 500, width: 1000}).show().get(0);
  });
  }, true);
  //$('#qunit-fixture').css({height: 500, width: 1000, position: 'static'}).show();
  
});

QUnit.asyncTest('Тестирование менеджера настроек, создание из шаблона', function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.empty);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = [];
    options.panes[i].widgets = [];
  }

  var salt = Math.random();
  var test_key = 'test_' + String(Math.random() * 100000).split('.')[0];
  options.system[test_key] = salt;
  var variantID;

  __panel.set(__panel.getEnv() + '_variants', null, function() {
  __panel.setOptions(options, undefined, function() {
    var frame;

    frame = $('<iframe id="button-options-variants-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue"></iframe>').load(function() {
      var that = this;

      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
          if(that.contentWindow.location.search.indexOf(salt) == -1) {
            /// кликаем по бабблу, виджет должен прорисоваться и функция прорисовки 
            /// виджета должна быть вызвана
            $('.pane-bubble:first').click();

            /// Кликаем по кнопке
            $('.button.panel_settings a').click();

            waitFor(function() {
              return $('#panel-settings-editor .ui-icon-edit').length > 0;
            }, function() {
              $('#panel-settings-editor .ui-icon-edit').click();
              $('.add-options-variant .ui-collapsible-heading-toggle:first').click();
              $('#add-title').val('test2');
              $('#add-collection').val('default');
              $('.add-options-variant input[type=submit]').click();

              setTimeout(function() {
                assert.equal($('#add-title:visible').length, 0, 'Форма добавления должна закрыться');

                assert.ok($('#variant-name option:contains(test2)').length > 0, 'Вариант добавлен');
                variantID = $('#variant-name option:contains(test2)').attr('value');
                $('#variant-name').val(variantID).change();

                that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
                  assert.equal(data, variantID, 'Вариант должен совпадать');
                  that.contentWindow.location.href = that.contentWindow.location.href + '&' + salt;
                });
              }, 500);
              //QUnit.start();
            });
          } else if(that.contentWindow.location.search.indexOf('finish') == -1) {
            // после обновления страницы с солью, проверяем вариант
            that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
              assert.equal(data, variantID, 'Вариант в новом окне должен совпадать');
              var current_options = that.contentWindow.__panel.getOptions()
              delete current_options.settings;
              var def = {};
              jQuery.extend(def, that.contentWindow.panelSettingsCollection.default);
              delete def['master'];
              var opts = {};
              jQuery.extend(opts, current_options);
              delete opts['settings'];
              delete def['settings'];
              assert.deepEqual(opts, def);

              $('.pane-bubble:first').click();

              /// Кликаем по кнопке
              $('.button.panel_settings a').click();

              waitFor(function() {
                return $('#panel-settings-editor .ui-icon-edit').length > 0;
              }, function() {
                $('#panel-settings-editor .ui-icon-edit').click();

                $('#variant-name').val('default').change();
                that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
                  assert.equal(data, 'default', 'Вариант должен быть default');
                  setTimeout(function() {
                    that.contentWindow.location.href = that.contentWindow.location.href + '&finish';
                  }, 500);
                });
              });
            });
          } else {
            /// Окончание теста, проверяем первоначальные настройки
            that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
              assert.equal(data, 'default', 'Вариант в новой вкладке должен быть default');
              var current_options = that.contentWindow.__panel.getOptions();
              assert.equal(current_options.system[test_key], salt, 'Первоначальные настройки возвращены');
              QUnit.start();
            });
          }
        }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 500, width: 1000}).show().get(0);
  });
  }, true);
  //$('#qunit-fixture').css({height: 500, width: 1000, position: 'static'}).show();
  
});
