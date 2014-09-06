function waitPanelInitialization(__window, callback) {
  // Ждём появления в документе указанного окна CSS-ки panel.css
  var check = function() {
    if(__window.__panel && __window.__panel.crossWindow) {
      __window.__panel.onload(callback);
      return;
    }
    setTimeout(check, 10);
  }
  check();
}

QUnit.assert.function_exists = function(needle, haystack, message) {
  var exists = String(typeof(haystack)).toLowerCase() == 'function';
  QUnit.push(exists, exists, needle, 'функция ' + needle + ' существует');
}

QUnit.test("Тест объекта __panel", function(assert) {
  assert.equal('object', String(typeof(window.__panel)).toLowerCase(), 
    'объект панели был создан');

  $(['set', 'get', 'loadScript', 'loadScriptComplete', 'loadCSS', 
     'checkFocused', 'dispatchException', 'toQueryParams', 'triggerEvent', 
     'bind', 'unbind', 'getOptions', 'setOptions', 'setWidgetOptions', 
     'gotoHref', 'ready', 'onload', 'path_to_theme', 'currentPlayerID', 
     'currentPlayerName', 'getOptionsID', 'panel_homepage', 'panel_login',
     'setEnv', 'getEnv']).each(function() {
    assert.function_exists('__panel.' + this, __panel[this]);
  })

  assert.deepEqual('array', jQuery.type(__panel.failedScripts), 
                    'массив незагруженных скриптов');
  assert.deepEqual('array', jQuery.type(__panel.failedStyles), 
                  'массив незагруженных стилей');

  assert.deepEqual(__panel.toQueryParams('foo=bar&bar=foo'), 
                   {'foo': 'bar', 'bar': 'foo'}, '__panel.toQueryParams');
  assert.ok(__panel.currentPlayerID() > 0, 'ID игрока > 0');
  assert.ok(String(__panel.getOptionsID()).indexOf("testing") != -1, 
    'optionsID содержат "testing"');
});

QUnit.test("Тест объекта __panel.crossWindow", function(assert) {
  assert.equal('object', String(typeof(__panel.crossWindow)).toLowerCase(), 
    'объект crossWindow был создан');
  $(['bind', 'get', 'set', 'triggerEvent', 'unbind']).each(function() {
    assert.function_exists('__panel.' + this, __panel[this]);
  });
}); 

QUnit.asyncTest("Тест ready()", function(assert) {
  expect(1);
  __panel.ready(function() {
    assert.ok(true, "Функция отработала после инициализации");
    QUnit.start();
  });
});

QUnit.asyncTest("Тест onload()", function(assert) {
  expect(2);
  __panel.onload(function() {
    assert.ok(true, "Функция отработала после инициализации");
    assert.equal('object', String(typeof(__panel.crossWindow)), 
                  'Объект __panel.crossWindow инициализирован');
    QUnit.start();
  });
});

QUnit.asyncTest("Тест передачи строки", function(assert) {
  expect(2);
  var rand = String(Math.random());
  __panel.set("test1", rand, function() {
    assert.ok(true, "значение установлено");
    __panel.get("test1", function(value) {
      assert.equal(rand, value, "значение должно совпадать");
      QUnit.start();
    });
  });
});

QUnit.asyncTest("Тест передачи хеша", function(assert) {
  expect(2);
  var hash = {'hash': {'1': 'test', 'test': 1}, 
              'array': [1, 'test', 0], 
              'string': 'string'};
  __panel.set("test_hash", hash, function() {
    assert.ok(true, "значение установлено");
    __panel.get("test_hash", function(value) {
      assert.deepEqual(hash, value, "значение должно совпадать");
      QUnit.start();
    });
  });
});

QUnit.asyncTest("Тест передачи массива", function(assert) {
  expect(2);
  var ar = [1, 2, 'test'];
  __panel.set("test_ar", ar, function() {
    assert.ok(true, "значение установлено");
    __panel.get("test_ar", function(value) {
      assert.deepEqual(ar, value, "значение должно совпадать");
      QUnit.start();
    });
  });
});


QUnit.asyncTest("Тест передачи длинной строки", function(assert) {
  expect(2);
  var huge_string = '';
  for(var i = 0; i < 10000; i++) {
    huge_string += ' ' + Math.random();
  }
  __panel.set("huge_string", huge_string, function() {
    assert.ok(true, "значение установлено");
    __panel.get("huge_string", function(value) {
      assert.deepEqual(huge_string, value, "значение должно совпадать");
      QUnit.start();
    });
  });
});

QUnit.asyncTest("Тест передачи большого массива", function(assert) {
  expect(2);
  var huge_array = [];
  for(var i = 0; i < 10000; i++) {
    huge_array.push(Math.random());
  }

  __panel.set("huge_array", huge_array, function() {
    assert.ok(true, "значение установлено");
    __panel.get("huge_array", function(value) {
      assert.deepEqual(huge_array, value, "значение должно совпадать");
      QUnit.start();
    });
  });
});

QUnit.asyncTest("Тест передачи русских символов", function(assert) {
  expect(2);
  __panel.set("russian", "тест", function() {
    assert.ok(true, "значение установлено");
    __panel.get("russian", function(value) {
      assert.deepEqual("тест", value, "значение должно совпадать");
      QUnit.start();
    });
  });
});

QUnit.asyncTest("Тест очистки", function(assert) {
  var items = ['russian', 'huge_array', 'huge_string', 'test_ar', 'test_hash',
               'test1'];
  expect(items.length);
  $(items).map(function(i, item) {
    __panel.del(item, function() {
      __panel.get(item, function(value) {
        assert.deepEqual(null, value, 'значения ' + item + ' не должно быть');
        if(item == items[items.length - 1]) {
          QUnit.start();
        }
      });
    });
  });
});

QUnit.asyncTest("Тест событий из текущего окна", function(assert) {
  expect(1);
  var eventdata = {'test': 'успех'};
  __panel.bind("self-event-test", function(data) {
    assert.deepEqual(eventdata, data, "значение должно сопадать");
    QUnit.start();
  });
  __panel.triggerEvent('self-event-test', eventdata);
});

QUnit.asyncTest("Тест событий из чужого окна (iframe)", function(assert) {
  expect(1);
  var eventdata = {'foreign test': 'успех'};
  __panel.bind("foreign-event-test", function(data) {
    assert.deepEqual(eventdata, data, "значение должно сопадать");
    QUnit.start();
  });

  $('<iframe id="foreign-event-iframe" src="' + document.location.href.split('?')[0]
     + '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(this.contentWindow, function() {
      that.contentWindow.__panel.triggerEvent('foreign-event-test', eventdata);
    });
  }).appendTo('#qunit-fixture');
});

QUnit.asyncTest("Массовый тест событий", function(assert) {
  expect(2);
  var counter = 0;
  var thread_counter = [0, 0, 0, 0];
  var rand = Math.random();
  __panel.bind('mass-event-test', function(data) {
    if(data && data.test == 'mass event test' && data.salt == rand) {
      counter++;
      thread_counter[data.thread]++;
      if(counter == 200) {
        setTimeout(function() {
          assert.equal(200, counter, '200 событий из текущего окна и из чужого было запущено');
          assert.deepEqual(thread_counter, [50, 50, 50, 50], 
              'Все потоки выполнены успешно');
          QUnit.start();
        }, 1000);
      }
    } else {
      assert.deepEqual(-1, data, 'неправильные данные');
    }
  });
  var thread = 0;
  /// Запускаем 2 потока по 100 сообщений
  for(var t = 0; t < 2; t++) {
    setTimeout(function() {
      for(var i = 0; i < 50; i++) {
        __panel.triggerEvent('mass-event-test', 
          {'test': 'mass event test', 'salt': rand, 'index': i, 'thread': thread});
      }
      thread++;
    }, 1);
  }

  $('<iframe id="foreign-event-iframe" src="' + document.location.href.split('?')[0]
     + '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(this.contentWindow, function() {
      /// Запускаем ещё 2 потока из соседнего окна
      for(var t = 0; t < 2; t++) {
        setTimeout(function() {
          for(var i = 0; i < 50; i++) {
            that.contentWindow.__panel.triggerEvent('mass-event-test', 
              {'test': 'mass event test', 'salt': rand, 'index': i, 
               'thread': thread});
          }
          thread++;
        }, 1);
      }
    });
  }).appendTo('#qunit-fixture');
});

QUnit.asyncTest("Отвязка событий", function(assert) {
  expect(1);
  var eventdata = {'test': 'успех'};
  var listener_id = __panel.bind('event-unbind-test', function(data) {
    assert.deepEqual(eventdata, data, "значение должно сопадать");
    __panel.unbind("event-unbind-test", listener_id);
    __panel.triggerEvent('event-unbind-test"', eventdata);
    QUnit.start();
  });
  __panel.triggerEvent('event-unbind-test', eventdata);
});

QUnit.asyncTest('Подгрузка скриптов', function(assert) {
  expect(1);
  __panel.loadScript('lib/tests/foobar.js', function () {
    assert.deepEqual(__panel.__foo_bar_script, 'foo bar', 'Скрипт загружен');
    QUnit.start();
  }, function() {
    console.log((new Error).stack);
    assert.ok(false, 'Скрипт не загружен');
    QUnit.start();
  })
});

QUnit.asyncTest('Подгрузка ошибочных скриптов', function(assert) {
  expect(1);
  __panel.loadScript('lib/tests/foobar_unexists.js', function () {
    assert.ok(false, 'Скрипт не должен быть загружен');
    QUnit.start();
  }, function() {
    assert.ok(true, 'Скрипт не загружен');
    QUnit.start();
  })
});

QUnit.asyncTest('Подгрузка нескольких скриптов, синхронизация', function(assert) {
  expect(3);
  var passed_count = 0;

  $('<iframe id="foreign-event-iframe" src="' + document.location.href.split('?')[0]
   + '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(this.contentWindow, function() {
      var panel = that.contentWindow.__panel;
      setTimeout(function() {
        panel.loadScript(['lib/tests/foobar.js', 'lib/tests/foobar2.js'], function () {
          assert.deepEqual(panel.__foo_bar_script, 'foo bar', 'Скрипт загружен');
          assert.deepEqual(panel.__foo_bar_script2, 'foo bar', 'Второй скрипт загружен');
          passed_count++;
          if(passed_count > 1) {
            QUnit.start();
          }
        }, function() {
          console.log((new Error).stack);
          assert.ok(false, 'Скрипт не загружен');
          QUnit.start();
        })
      }, 1);
      setTimeout(function() {
        panel.loadScript('lib/tests/foobar.js', function () {
          assert.deepEqual(panel.__foo_bar_script, 'foo bar', 
                          'Скрипт загружен параллельно');
          passed_count++;
          if(passed_count > 1) {
            QUnit.start();
          }
        }, function() {
          console.log((new Error).stack);
          assert.ok(false, 'Скрипт не загружен');
          QUnit.start();
        })
      }, 1);      
    });
  }).appendTo('#qunit-fixture');
});

QUnit.asyncTest('Параллельная подгрузка нескольких скриптов', function(assert) {
  expect(5);
  var passed_count = 0;

  $('<iframe id="foreign-event-iframe" src="' + document.location.href.split('?')[0]
   + '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(this.contentWindow, function() {
      var panel = that.contentWindow.__panel;
      setTimeout(function() {
        panel.loadScript(['lib/tests/foobar.js', 'lib/tests/foobar2.js'], function () {
          assert.deepEqual(panel.__foo_bar_script, 'foo bar', 'Скрипт загружен');
          assert.deepEqual(panel.__foo_bar_script2, 'foo bar', 'Второй скрипт загружен');
          passed_count++;
          if(passed_count > 2) {
            QUnit.start();
          }
        }, function() {
          console.log((new Error).stack);
          assert.ok(false, 'Скрипт не загружен');
          QUnit.start();
        })
      }, 1);
      setTimeout(function() {
        panel.loadScript(['lib/tests/foobar2.js', 
                          'lib/tests/foobar3.js'], function () {
          assert.deepEqual(panel.__foo_bar_script2, 'foo bar', 
                          'Второй скрипт загружен параллельно');
          assert.deepEqual(panel.__foo_bar_script3, 'foo bar', 
                          'Третий скрипт загружен параллельно');
          passed_count++;
          if(passed_count > 2) {
            QUnit.start();
          }
        }, function() {
          console.log((new Error).stack);
          assert.ok(false, 'Скрипт не загружен');
          QUnit.start();
        })
      }, 1);   
      setTimeout(function() {
        panel.loadScript('lib/tests/foobar2.js', function () {
          assert.deepEqual(panel.__foo_bar_script2, 'foo bar', 
                          'Второй скрипт загружен параллельно');
          passed_count++;
          if(passed_count > 2) {
            QUnit.start();
          }
        }, function() {
          console.log((new Error).stack);
          assert.ok(false, 'Скрипт не загружен');
          QUnit.start();
        })
      }, 1);      
    });
  }).appendTo('#qunit-fixture');
});

QUnit.asyncTest('Подгрузка стилей', function(assert) {
  expect(2);
  $('#qunit-fixture').append('<div class="foo-bar">test</div>');
  assert.notEqual($('#qunit-fixture .foo-bar').css('font-size'), '32px', 
                     'Стилей не должно быть');
  __panel.loadCSS('test.css', function () {
    assert.deepEqual($('#qunit-fixture .foo-bar').css('font-size'), '32px', 
                     'Стили загружены');
    QUnit.start();
  }, function() {
    assert.ok(false, 'Таблица стилей не загружена');
    QUnit.start();
  })
});

if(window.opera || jQuery.browser.msie) {
  QUnit.asyncTest('Подгрузка ошибочных стилей', function(assert) {
    expect(1);
    __panel.loadCSS('test_unexisted.css', function () {
      assert.ok(false, 'Несуществующий файл стилей не должен быть загружен');
      QUnit.start();
    }, function() {
      assert.ok(true, 'Стиль не загружен');
      QUnit.start();
    })
  });
}

/*QUnit.asyncTest('Проверка фокусировки', function(assert) {
  expect(1);
  __panel.onload(function() {
    jQuery(window).focus();
    __panel.checkFocused(function() {
      assert.ok(true, 'Текущее окно в фокусе');
      QUnit.start();
    });
  });
});*/

QUnit.asyncTest('Проверка фокусировки другого окна', function(assert) {
  expect(1);

  $('<iframe id="foreign-event-iframe" src="' + document.location.href.split('?')[0]
     + '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(this.contentWindow, function() {
      setTimeout(function() {
        that.contentWindow.jQuery(that.contentWindow).focus();
        that.contentWindow.__panel.checkFocused(function() {
          assert.ok(true, 'Новое открытое окно в фокусе');
          window.__panel.checkFocused(function() {
            assert.ok(false, 'Текущее окно не должно быть в фокусе');
            QUnit.start();
          });

          QUnit.start();
        });
      }, 100);
    });
  }).appendTo('#qunit-fixture');


});

QUnit.asyncTest('Установка и считывание опций', function(assert) {
  expect(7);
  /// установка защищённой опции
  try {
    __panel.set('options', {});
    assert.ok(false, 'Защищённая не должна быть установлена');
  } catch(e) {
    __panel.dispatchException(e);
    assert.ok(true, e.toString());
  }
  var options = __panel.getOptions();
  assert.equal(String(typeof(options)).toLowerCase(), 'object', 'опции получены');
  options['test_module'] = {'test1': 'test1'};
  __panel.setOptions(options);
  setTimeout(function() {
    var new_options = __panel.getOptions();
    assert.deepEqual(new_options['test_module'], {'test1': 'test1'}, 
                      'опции были установлены');
    new_options['test_module']['test1'] = 'test2';
    __panel.setOptions(new_options['test_module'], 'test_module');
    setTimeout(function() {
      var new_options = __panel.getOptions();
      assert.deepEqual(new_options['test_module'], {'test1': 'test2'}, 
                      'опции через namespace были установлены');
      /// удаляем
      new_options['test_module'] = undefined;
      __panel.setOptions(new_options);
      setTimeout(function() {
        var new_options = __panel.getOptions();
        assert.deepEqual('undefined', 
                          String(typeof(new_options['test_module'])).toLowerCase(), 
                          'опции удалены');
        var local_options = JSON.parse(localStorage[__panel.getOptionsID()]);
        assert.deepEqual('undefined', 
                          String(typeof(local_options['test_module'])).toLowerCase(), 
                          'опции удалены из localStorage');
        $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
           + '?gwpanel_testing&continue"></iframe>').load(function() {
          var that = this;
          waitPanelInitialization(this.contentWindow, function() {
            var new_options = that.contentWindow.__panel.getOptions();
            assert.deepEqual('undefined', 
                              String(typeof(new_options['test_module'])).toLowerCase(), 
                              'опции действительно удалены');

            QUnit.start();
          });
        }).appendTo('#qunit-fixture');
      }, 100);
    }, 100);
  }, 100);
});

QUnit.asyncTest('переход по ссылке', function(assert) {
  expect(1);
  var gotoURL = 'http://www.ganjawars.ru/forum.php';
  var gotoHref = false;
  $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
     + '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(this.contentWindow, function() {
      if(gotoHref) {
        /// Если мы перешли, то проверяем местоположение
        assert.equal(gotoURL, that.contentWindow.location.href, 
                      'переход произведён');
        QUnit.start();
      } else {
        /// Если первый запуск, то переходим
        gotoHref = true;
        that.contentWindow.__panel.gotoHref(gotoURL);
      }
    });
  }).appendTo('#qunit-fixture');

});

/// Тестирование интерфейса
QUnit.test('Тестирование бабблов', function(assert) {
  var options = __panel.getOptions();
  var activePanes = 0;
  for(var i = 0; i < 4; i++) {
    if(options.panes[i].widgets && options.panes[i].widgets.length + 
       options.panes[i].buttons && options.panes[i].buttons.length > 0) {
      activePanes++;
    }
  }
  assert.equal(activePanes, $('.pane-bubble:visible').length, 
    'Количество видимых бабблов');
});

QUnit.asyncTest('Тестирование открытия и закрытия бабблов', function(assert) {
  expect(8);
  var options = jQuery.extend({}, panelSettingsCollection.default);
  options.panes[0] = {
    width: 6,
    height: 4,
    buttons: [{type: 'panel_link', top: 0, left: 0, title: 'Форум', 
    img: 'http://images.ganjawars.ru/img/forum/f27.gif', 
    arguments: {
      blank: 0,
      link: 'http://www.ganjawars.ru/forum.php'
    }}],
    widgets: []
  };
  __panel.setOptions(options);

  $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
     + '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(this.contentWindow, function() {
      (function($) {
      /// кликаем по бабблу
      $('.pane-bubble:first').click();
      assert.ok($('.pane:visible').length > 0, 'Открылось окошко');
      var that = this;
      setTimeout(function() {
        assert.ok($('.pane:visible').find('.button').length > 0,
                  'Кнопка видна');
        $('.pane-bubble:first').click();
        assert.ok($('.pane:visible').length == 0, 'Закрылось окошко');
        $('.pane-bubble:first').click();
        assert.ok($('.pane:visible').length > 0, 'Открылось окошко');
        $(that.document.body).click();
        assert.ok($('.pane:visible').length == 0, 'Закрылось окошко по клику по документу');

        var e = $.Event('mousemove');
        e.clientX = 500;
        e.clientY = 500;

        $(that).trigger(e);

        var bubbleObject = $('.pane-bubble:first')[0];

        var e = $.Event('mousemove');
        e.clientX = bubbleObject.offsetLeft + 5;
        e.clientY = bubbleObject.offsetTop + 50;
        $(that).trigger(e);

        $(bubbleObject).trigger('mouseover');
        
        assert.ok($('.pane:visible').length > 0, 'Открылось окошко при наведении');
        $('.pane-bubble:first').click();
        assert.ok($('.pane:visible').length == 0, 'Закрылось окошко');
    
        $(that).trigger(e);      
        $(bubbleObject).trigger('mouseover');
        assert.ok($('.pane:visible').length == 0, 
          'При незапланированном наведении открыться не должно');

        QUnit.start();
      }, 100);
    }).apply(that.contentWindow, [that.contentWindow.jQuery])
    });
  }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest('Тест drag-n-drop для перетаскивании кнопок', function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.default);
  options.panes[0] = {
    width: 6,
    height: 4,
    buttons: [{type: 'panel_link', top: 0, left: 0, title: 'Форум', 
    img: 'http://images.ganjawars.ru/img/forum/f27.gif', 
    arguments: {
      blank: 0,
      link: 'http://www.ganjawars.ru/forum.php'
    }}],
    widgets: []
  };
  __panel.setOptions(options);

  $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
     + '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(this.contentWindow, function() {
      (function($) {
      /// кликаем по бабблу
      $('.pane-bubble:first').click();
      var pane = $('.pane:visible');
      assert.ok(pane.length > 0, 'Открылось окошко');
      var that = this;
      setTimeout(function() {
        var button = pane.find('.button');
        assert.ok(button.length > 0,
                  'Кнопка видна');

        var e = $.Event('mousemove');
        var padding = parseInt(pane.css('padding'));
        if(isNaN(padding)) padding = 0;
        e.pageX = pane[0].offsetLeft + padding + 10;
        e.pageY = pane[0].offsetTop + padding + 10;
        $(that).trigger(e);

        var mousedown = $.Event('mousedown');
        /// левая кнопка мыши
        mousedown.which = 1;
        mousedown.pageX = e.pageX;
        mousedown.pageY = e.pageY;
        var target = button.find('a');
        mousedown.target = target[0];
        button.trigger(mousedown);
        var __window = that;

        setTimeout(function() {
          assert.ok(button.hasClass('ui-draggable'), 'Drag start');
          assert.ok(pane.find('.pane-placeholder').length > 0, 
            'Есть доступные места для перетаскивания');

          var mousemove = $.Event('mousemove');
          mousemove.pageX = mousedown.pageX + 75;
          mousemove.pageY = mousedown.pageY + 150;
          __window.jQuery(__window.document).trigger(mousemove);

          var mouseup = $.Event('mouseup');
          mouseup.pageX = mousemove.pageX;
          mouseup.pageY = mousemove.pageY;
          button.trigger(mouseup);

          assert.ok(!button.hasClass('ui-draggable'), 'Drag end');
          assert.ok(pane.find('.pane-placeholder').length == 0, 
            'Нет отметок для перетаскивания');
          assert.equal(__window.__panel.getOptions().panes[0].buttons[0].left, 1,
            'Позиция кнопки слева должна быть = 1');
          assert.equal(__window.__panel.getOptions().panes[0].buttons[0].top, 2, 
            'Позиция кнопки слева должна быть = 2');

          QUnit.start();
        }, 1000);
      }, 100);
      //QUnit.start();
    }).apply(that.contentWindow, [that.contentWindow.jQuery])
    });
  }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest('Тест drag-n-drop для перетаскивании виджетов', function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.default);
  /// Делаем бекап опций окон
  options.panes[0] = {
    width: 6,
    height: 4,
    buttons: [],
    widgets: [{
      'type': 'npc_npc_z',
      top: 0,
      left: 0,
      arguments: {
        friends: [5, 11],
        enemies: [1, 4, 7, 9],
        undress: 1
      }
    }]
  };
  __panel.setOptions(options, undefined, function() {
    $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
        /// кликаем по бабблу
        $('.pane-bubble:first').click();

        setTimeout(function() {
        var pane = $('.pane:visible');
        /// Ждём прорисовки виджета
        setTimeout(function() {
        (function($) {
          assert.ok(pane.length > 0, 'Открылось окошко');
          var widget = pane.find('.widget');

          assert.ok(widget.length > 0,
                    'Виджет виден');

          var e = $.Event('mousemove');
          var padding = parseInt(pane.css('padding'));
          if(isNaN(padding)) padding = 0;
          e.pageX = pane[0].offsetLeft + padding + 30;
          e.pageY = pane[0].offsetTop + padding + 30;
          $(this).trigger(e);

          var mousedown = $.Event('mousedown');
          /// левая кнопка мыши
          mousedown.which = 1;
          mousedown.pageX = e.pageX;
          mousedown.pageY = e.pageY;
          mousedown.target = widget[0].firstChild;
          widget.trigger(mousedown);
          var __window = this;

          setTimeout(function() {
            assert.ok(widget.hasClass('ui-draggable'), 'Drag start');
            assert.ok(pane.find('.pane-placeholder').length > 0, 
              'Есть доступные места для перетаскивания');

            var mousemove = $.Event('mousemove');
            mousemove.pageX = mousedown.pageX + 75;
            mousemove.pageY = mousedown.pageY + 150;
            __window.jQuery(__window.document).trigger(mousemove);

            var mouseup = $.Event('mouseup');
            mouseup.pageX = mousemove.pageX;
            mouseup.pageY = mousemove.pageY;
            widget.trigger(mouseup);

            assert.ok(!widget.hasClass('ui-draggable'), 'Drag end');
            assert.ok(pane.find('.pane-placeholder').length == 0, 
              'Нет отметок для перетаскивания');
            assert.equal(0, __window.__panel.getOptions().panes[0].widgets[0].left,
              'Позиция виджета слева должна быть = 0, т.к. виджет на всю ширину');
            assert.equal(2, __window.__panel.getOptions().panes[0].widgets[0].top,
              'Позиция виджета слева должна быть = 2');
            QUnit.start();
          }, 2000);
        }).apply(that.contentWindow, [that.contentWindow.jQuery])}, 100);

        }, 100);
        //QUnit.start();
      }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});
/// TODO: тест setWidgetOptions

QUnit.asyncTest("Тест функции __panel.currentPlayerName()", function(assert) {
  expect(1);
  __panel.currentPlayerName(function(name) {
    assert.equal('string', String(typeof(name)).toLowerCase(),
        'Имя игрока установлено');
    QUnit.start();
  });
});