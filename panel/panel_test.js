QUnit.module('panel');

function waitPanelInitialization(__window, callback) {
  // Ждём появления в документе указанного окна CSS-ки panel.css
  var check = function() {
    if(__window.__panel && __window.__panel.crossWindow) {
      __window.__panel.onload(callback);
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
    if(count * 5 > timeout) {
      QUnit.ok(false, 'Превышен интервал ожидания waitFor');
      QUnit.start();
      return;
    }
    setTimeout(f, 5);
  }
  f();
}

QUnit.assert.function_exists = function(needle, haystack, message) {
  var exists = String(typeof(haystack)).toLowerCase() == 'function';
  QUnit.push(exists, exists, needle, 'функция ' + needle + ' существует');
};

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
  });

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
    assert.deepEqual(eventdata, data, "значение должно совпадать");
    QUnit.start();
  });
  __panel.triggerEvent('self-event-test', eventdata);
});

QUnit.asyncTest("Тест событий из чужого окна (iframe)", function(assert) {
  expect(1);
  var eventdata = {'foreign test': 'успех'};
  __panel.bind("foreign-event-test", function(data) {
    assert.deepEqual(eventdata, data, "значение должно совпадать");
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
  __panel.onload(function() {
    __panel.bind('mass-event-test', function(data) {
      if(data && data.test == 'mass event test' && data.salt == rand) {
        counter++;
        thread_counter[data.thread]++;
      } else {
        assert.deepEqual(-1, data, 'неправильные данные');
      }
    });

    waitFor(function() {
      return counter == 200;
    }, function() {
      assert.equal(200, counter, '200 событий из текущего окна и из чужого было запущено');
      assert.deepEqual(thread_counter, [50, 50, 50, 50], 
          'Все потоки выполнены успешно');
      QUnit.start();
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
});

QUnit.asyncTest("Отвязка событий", function(assert) {
  expect(1);
  var eventdata = {'test': 'успех'};
  var listener_id = __panel.bind('event-unbind-test', function(data) {
    assert.deepEqual(eventdata, data, "значение должно совпадать");
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

//QUnit.asyncTest('Проверка фокусировки', function(assert) {
//  expect(1);
//  __panel.onload(function() {
//    jQuery(window).focus();
//    __panel.checkFocused(function() {
//      assert.ok(true, 'Текущее окно в фокусе');
//      QUnit.start();
//    });
//  });
//});

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
        var local_options = JSON.parse(localStorage['gwp2_' + __panel.getOptionsID()]);
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
//QUnit.test('Тестирование бабблов', function(assert) {
//  var options = __panel.getOptions();
//  var activePanes = 0;
//  for(var i = 0; i < 4; i++) {
//    if(options.panes[i].widgets && options.panes[i].widgets.length + 
//       options.panes[i].buttons && options.panes[i].buttons.length > 0) {
//      activePanes++;
//    }
//  }
//  assert.equal(activePanes, $('.pane-bubble:visible').length, 
//    'Количество видимых бабблов');
//});

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
      waitFor(function() {
        return $('.pane:visible .button').length > 0;
      }, function() {
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
      });
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
      var that = this;
      /// кликаем по бабблу
      $('.pane-bubble:first').click();
      waitFor(function() {
        return $('.pane:visible .button').length > 0;
      }, function() {
        var pane = $('.pane:visible');
        assert.ok(pane.length > 0, 'Открылось окошко');
        var button = pane.find('.button');
        assert.ok(button.length > 0,
                  'Кнопка видна');

        var e = $.Event('mousemove');
        var padding = parseInt(pane.css('padding'));
        if(isNaN(padding)) padding = 0;
        e.pageX = pane[0].offsetLeft + padding + 10;
        e.pageY = pane[0].offsetTop + padding + 10;
        button.trigger(e);

        var mousedown = $.Event('mousedown');
        /// левая кнопка мыши
        mousedown.which = 1;
        mousedown.pageX = e.pageX;
        mousedown.pageY = e.pageY;
        var target = button.find('a');
        mousedown.target = target[0];
        button.trigger(mousedown);

        waitFor(function() {
          return button.hasClass('ui-draggable-dragging');
        }, function() {
          assert.ok(button.hasClass('ui-draggable'), 'Drag start');
          assert.ok(pane.find('.pane-placeholder').length > 0, 
            'Есть доступные места для перетаскивания');
          var mousemove = $.Event('mousemove');
          mousemove.pageX = mousedown.pageX + 75;
          mousemove.pageY = mousedown.pageY + 150;
          button.trigger(mousemove);

          var mouseup = $.Event('mouseup');
          mouseup.which = 1;
          mouseup.pageX = mousemove.pageX;
          mouseup.pageY = mousemove.pageY;
          mouseup.target = target[0];
          button.trigger(mouseup);

          waitFor(function() {
            return !button.hasClass('ui-draggable');
          }, function() {
            assert.ok(!button.hasClass('ui-draggable'), 'Drag end');
            assert.ok(pane.find('.pane-placeholder').length == 0, 
              'Нет отметок для перетаскивания');
            assert.equal(that.__panel.getOptions().panes[0].buttons[0].left, 1,
              'Позиция кнопки слева должна быть = 1');
            assert.equal(that.__panel.getOptions().panes[0].buttons[0].top, 2, 
              'Позиция кнопки сверху должна быть = 2');

            QUnit.start();
          });
        });
      });
      //QUnit.start();
    }).apply(that.contentWindow, [that.contentWindow.jQuery])
    });
  }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest('Перетаскивание кнопок за недопустимые границы', function(assert) {
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
      waitFor(function() {
        return $('.pane:visible .button').length > 0;
      }, function() {
        var pane = $('.pane:visible');
        assert.ok(pane.length > 0, 'Открылось окошко');
        var that = this;
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

        waitFor(function() {
          return button.hasClass('ui-draggable-dragging');
        }, function() {
          assert.ok(button.hasClass('ui-draggable'), 'Drag start');
          assert.ok(pane.find('.pane-placeholder').length > 0, 
            'Есть доступные места для перетаскивания');

          var mousemove = $.Event('mousemove');
          mousemove.pageX = mousedown.pageX + 750;
          mousemove.pageY = mousedown.pageY + 350;
          button.trigger(mousemove);

          var mouseup = $.Event('mouseup');
          mouseup.pageX = mousemove.pageX;
          mouseup.pageY = mousemove.pageY;
          button.trigger(mouseup);

          /// ждём окончания revert-а
          waitFor(function() {
            return !button.hasClass('ui-draggable');
          }, function() {
            assert.ok(!button.hasClass('ui-draggable'), 'Drag end');
            assert.ok(pane.find('.pane-placeholder').length == 0, 
              'Нет отметок для перетаскивания');
            assert.equal(__window.__panel.getOptions().panes[0].buttons[0].left, 0,
              'Позиция кнопки слева должна быть = 0');
            assert.equal(__window.__panel.getOptions().panes[0].buttons[0].top, 0, 
              'Позиция кнопки сверху должна быть = 0');

            QUnit.start();
          });
        });
      });
      //QUnit.start();
    }).apply(that.contentWindow, [that.contentWindow.jQuery])
    });
  }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest('Перетаскивание кнопок в другие окна', function(assert) {
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
    var __window = this.contentWindow;
    waitPanelInitialization(this.contentWindow, function() {
      (function($) {
      /// кликаем по бабблу
      $('.pane-bubble:first').click();
      waitFor(function() {
        return $('.pane:visible .button').length;
      }, function() {
        var pane = $('.pane:visible');
        assert.ok(pane.length > 0, 'Открылось окошко');
        var button = pane.find('.button');
        assert.ok(button.length > 0,
                  'Кнопка видна');

        var e = $.Event('mousemove');
        var padding = parseInt(pane.css('padding'));
        if(isNaN(padding)) padding = 0;
        e.pageX = pane[0].offsetLeft + padding + 10;
        e.pageY = pane[0].offsetTop + padding + 10;
        button.trigger(e);

        var mousedown = $.Event('mousedown');
        /// левая кнопка мыши
        mousedown.which = 1;
        mousedown.pageX = e.pageX;
        mousedown.pageY = e.pageY;
        var target = button.find('a');
        mousedown.target = target[0];
        button.trigger(mousedown);

        waitFor(function() {
          return button.hasClass('ui-draggable-dragging');
        }, function() {
          assert.ok(button.hasClass('ui-draggable'), 'Drag start');
          var mousemove = $.Event('mousemove');
          mousemove.pageX = mousedown.pageX + 5;
          mousemove.pageY = mousedown.pageY + 15;
          button.trigger(mousemove);

          assert.ok($('.pane-bubble.external').length > 0, 
            'Должны отобразиться бабблы для других окон');

          /// на первый mousemove выводятся дополнительные бабблы
          var mousemove = $.Event('mousemove');
          mousemove.pageX = $('#pane-bubble-2').get(0).offsetLeft;
          mousemove.pageY = $('#pane-bubble-2').get(0).offsetTop + 20;
          button.trigger(mousemove);
          /// на второй переносится объект
          var mousemove = $.Event('mousemove');
          mousemove.pageX = $('#pane-bubble-2').get(0).offsetLeft;
          mousemove.pageY = $('#pane-bubble-2').get(0).offsetTop + 20;
          button.trigger(mousemove);

          var tries = 0;
          while(!$('.pane-bubble.drag-over').length && tries++ < 10) {
            var mousemove = $.Event('mousemove');
            mousemove.pageX = $('#pane-bubble-2').get(0).offsetLeft + 5 + (parseInt(Math.random * 10) - 5);
            mousemove.pageY = $('#pane-bubble-2').get(0).offsetTop + 40 + (parseInt(Math.random * 20) - 10);
            button.trigger(mousemove);
          }

          assert.equal($('.pane-bubble.drag-over').length, 1, 
            'При наведении на бабл он должен подсвечиваться. Кол-во движений: ' + tries);

          var mouseup = $.Event('mouseup');
          mouseup.pageX = mousemove.pageX;
          mouseup.pageY = mousemove.pageY;
          button.trigger(mouseup);

          /// ждём окончания revert-а
          waitFor(function() {
            return !button.hasClass('ui-draggable');
          }, function() {
            assert.ok(!button.hasClass('ui-draggable'), 'Drag end');
            assert.ok(pane.find('.pane-placeholder').length == 0, 
              'Нет отметок для перетаскивания');
            assert.equal(__window.__panel.getOptions().panes[2].buttons[0].left, 0,
              'Позиция кнопки в новом окне слева должна быть = 0');
            assert.equal(__window.__panel.getOptions().panes[2].buttons[0].top, 0, 
              'Позиция кнопки в новом окне сверху должна быть = 0');

            assert.ok($('.panel-flash').length > 0, 'Должно выйти сообщение');

            QUnit.start();
          });
        });
      });
      //QUnit.start();
    }).apply(__window, [__window.jQuery])
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
      var __window = this.contentWindow;
      waitPanelInitialization(__window, function() {
        (function($) {
          /// кликаем по бабблу
          $('.pane-bubble:first').click();

          waitFor(function() {
            /// Ждём прорисовки окна и виджета
            return $('.pane:visible .widget').length;
          }, function() {
            var pane = $('.pane:visible');
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

            waitFor(function() {
              return widget.hasClass('ui-draggable-dragging');
            }, function() {
              assert.ok(widget.hasClass('ui-draggable-dragging'), 'Drag start');
              assert.ok(pane.find('.pane-placeholder').length > 0, 
                'Есть доступные места для перетаскивания');

              var mousemove = $.Event('mousemove');
              mousemove.pageX = mousedown.pageX + 0;
              mousemove.pageY = mousedown.pageY + 150;
              __window.jQuery(__window.document).trigger(mousemove);

              var mouseup = $.Event('mouseup');
              mouseup.pageX = mousemove.pageX;
              mouseup.pageY = mousemove.pageY;
              widget.trigger(mouseup);

              waitFor(function() {
                return !widget.hasClass('ui-draggable-dragging');
              }, function() {
                assert.ok(!widget.hasClass('ui-draggable-dragging'), 'Drag end');
                assert.ok(pane.find('.pane-placeholder').length == 0, 
                  'Нет отметок для перетаскивания');
                assert.equal(__window.__panel.getOptions().panes[0].widgets[0].left, 0,
                  'Позиция виджета слева должна быть = 0, т.к. виджет на всю ширину');
                assert.equal(__window.__panel.getOptions().panes[0].widgets[0].top, 2,
                  'Позиция виджета сверху должна быть = 2');
                QUnit.start();
              });
            });
          });
        //QUnit.start();
        }).apply(__window, [__window.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest('Перетаскивание виджетов за недопустимые границы', function(assert) {
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

          waitFor(function() {
            /// Ждём прорисовки виджета
            return $('.pane:visible .widget').length > 0;
          }, function() {
            var pane = $('.pane:visible');
            assert.ok(pane.length > 0, 'Открылось окошко');
            var widget = pane.find('.widget');

            assert.ok(widget.length > 0,
                      'Виджет виден');

            var e = $.Event('mousemove');
            var padding = parseInt(pane.css('padding'));
            if(isNaN(padding)) padding = 0;
            e.pageX = pane[0].offsetLeft + padding + 30;
            e.pageY = pane[0].offsetTop + padding + 30;
            widget.trigger(e);

            var mousedown = $.Event('mousedown');
            /// левая кнопка мыши
            mousedown.which = 1;
            mousedown.pageX = e.pageX;
            mousedown.pageY = e.pageY;
            mousedown.target = widget[0].firstChild;
            widget.trigger(mousedown);
            var __window = that.contentWindow;

            waitFor(function() {
              return widget.hasClass('ui-draggable-dragging');
            }, function() {
              assert.ok(widget.hasClass('ui-draggable-dragging'), 'Drag start');
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

              /// Ждём пока отработает revert 
              waitFor(function() {
                return !widget.hasClass('ui-draggable-dragging');
              }, function() {
                assert.ok(!widget.hasClass('ui-draggable-dragging'), 'Drag end');
                assert.ok(pane.find('.pane-placeholder').length == 0, 
                  'Нет отметок для перетаскивания');
                assert.equal(__window.__panel.getOptions().panes[0].widgets[0].left, 0,
                  'Позиция виджета слева должна быть = 0');
                assert.equal(__window.__panel.getOptions().panes[0].widgets[0].top, 0,
                  'Позиция виджета сверху должна быть = 0');
                QUnit.start();
              });
            });
          });
          //QUnit.start();
        }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show();
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest('Перетаскивание виджетов в другие окна', function(assert) {
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

          waitFor(function() {
            /// Ждём прорисовки виджета
            return $('.pane:visible .widget').length > 0;
          }, function() {
            var pane = $('.pane:visible');
            assert.ok(pane.length > 0, 'Открылось окошко');
            var widget = pane.find('.widget');

            assert.ok(widget.length > 0,
                      'Виджет виден');

            var e = $.Event('mousemove');
            var padding = parseInt(pane.css('padding'));
            if(isNaN(padding)) padding = 0;
            e.pageX = pane[0].offsetLeft + padding + 30;
            e.pageY = pane[0].offsetTop + padding + 30;
            widget.trigger(e);

            var mousedown = $.Event('mousedown');
            /// левая кнопка мыши
            mousedown.which = 1;
            mousedown.pageX = e.pageX;
            mousedown.pageY = e.pageY;
            mousedown.target = widget[0].firstChild;
            widget.trigger(mousedown);
            var __window = that.contentWindow;

            waitFor(function() {
              return widget.hasClass('ui-draggable-dragging');
            }, function() {
              assert.ok(widget.hasClass('ui-draggable-dragging'), 'Drag start');
              var mousemove = $.Event('mousemove');
              mousemove.pageX = mousedown.pageX + 5;
              mousemove.pageY = mousedown.pageY + 15;
              widget.trigger(mousemove);

              assert.ok($('.pane-bubble.external').length > 0, 
                'Должны отобразиться бабблы для других окон');

              /// на первый mousemove выводятся дополнительные бабблы
              var mousemove = $.Event('mousemove');
              mousemove.pageX = $('#pane-bubble-2').get(0).offsetLeft;
              mousemove.pageY = $('#pane-bubble-2').get(0).offsetTop + 20;
              widget.trigger(mousemove);
              /// на второй mousemove переносится объект
              var mousemove = $.Event('mousemove');
              mousemove.pageX = $('#pane-bubble-2').get(0).offsetLeft;
              mousemove.pageY = $('#pane-bubble-2').get(0).offsetTop + 20;
              widget.trigger(mousemove);

              assert.equal($('.pane-bubble.drag-over').length, 1, 
                'При наведении на бабл он должен подсвечиваться');

              var mouseup = $.Event('mouseup');
              mouseup.pageX = mousemove.pageX;
              mouseup.pageY = mousemove.pageY;
              widget.trigger(mouseup);

              /// Ждём пока отработает revert 
              waitFor(function() {
                return !widget.hasClass('ui-draggable-dragging');
              }, function() {
                assert.ok(!widget.hasClass('ui-draggable-dragging'), 'Drag end');
                assert.ok(pane.find('.pane-placeholder').length == 0, 
                  'Нет отметок для перетаскивания');
                assert.equal(__window.__panel.getOptions().panes[2].widgets[0].left, 0,
                  'Позиция кнопки в новом окне слева должна быть = 0');
                assert.equal(__window.__panel.getOptions().panes[2].widgets[0].top, 0, 
                  'Позиция кнопки в новом окне сверху должна быть = 0');

                assert.ok($('.panel-flash').length > 0, 'Должно выйти сообщение');
                QUnit.start();
              });
            });
          });

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

QUnit.asyncTest("Тест открытия окна настроек", function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.default);
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
  var options = jQuery.extend({}, panelSettingsCollection.default);
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
  var options = jQuery.extend({}, panelSettingsCollection.default);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = options.panes[i].widgets = [];
  }
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
              'Открылось второе окошко');

            assert.equal($('#pane-2 #panel_foo_widget_0').length, 1,
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
  var options = jQuery.extend({}, panelSettingsCollection.default);
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

              assert.equal($('#param-panel_foo_widget-checkbox1').attr('checked'), 'checked',
                'Чекбокс 1 должен быть нажат');
              assert.notEqual($('#param-panel_foo_widget-checkbox2').attr('checked'), 'checked',
                'Чекбокс 2 должен быть отжат');

              assert.equal($('input[name=panel_foo_widget_checkboxes1][checked=checked]').length, 3,
                'Чекбоксы №1 должны содержать 3 значения');
              assert.equal($('input[name=panel_foo_widget_checkboxes2][checked=checked]').length, 0,
                'Чекбоксы №2 не должны содержать значения');
              assert.equal($('input[name=panel_foo_widget_checkboxes3][checked=checked]').length, 3,
                'Чекбоксы №3 должны содержать 3 значения');
              assert.equal($('input[name=panel_foo_widget_checkboxes4][checked=checked]').length, 0,
                'Чекбоксы №4 не должны содержать значения');

              assert.equal($('#param-panel_foo_widget-select1').val(), 'test1',
                'Селекты №1 должны быть равны test1');
              assert.equal($('#param-panel_foo_widget-select2').val(), '', 
                'Селекты №2 не должны содержать значение');
              assert.equal($('#param-panel_foo_widget-select3').val(), 'test3',
                'Селекты №3 должны быть равны test3');
              assert.equal($('#param-panel_foo_widget-select4').val(), '',
                'Селекты №2 не должны содержать значение');

              assert.equal($('#param-panel_foo_widget-text1').val(), 'тест',
                'Текстовый инпут 1 должен содержать дефолтное значение "тест"');
              assert.equal($('#param-panel_foo_widget-text2').val(), '',
                'Текстовый инпут 2 не должен содержать значение');

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
                QUnit.start();
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

QUnit.asyncTest("Тест изменения настроек модулей", function(assert) {
  expect(6);
  var options = jQuery.extend({}, panelSettingsCollection.default);
  /// Создаём конфигурацию с модулем на текущей странице
  if(!panel_apply.pages[document.location.pathname]) {
    panel_apply.pages[document.location.pathname] = [];
  }
  panel_apply.pages[document.location.pathname].push('panel_test_func');
  __panel.panel_test_func = function(options) {
    console.log(options);
  }

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
            }
          }
        }
        __panel.panel_test_func = function(params) {
          console.log(params);
        }
        __panel.__ready();
        __panel.__load();
      }
    });
    
    frame = $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
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

              $('input[name=panel_test_func]').prev().click();

              var options = that.contentWindow.__panel.getOptions();

              assert.notEqual(options.blacklist.indexOf('panel_test_func'), -1,
                'panel_test_func должен быть в чёрном списке');

              QUnit.start();
            }
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
  var options = jQuery.extend({}, panelSettingsCollection.default);
  options.blacklist = ['panel_test_func'];

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
          description: 'тестовая функция',
          configure: {
            checkbox: {
              type: 'checkbox',
              title: 'тестовый checkbox',
              default: true
            }
          }
        }
        __panel.panel_test_func = function(params) {
          QUnit.ok(false, 'Эта функция не должна была запуститься');
          QUnit.start();
        }
        /// инициализируем панель
        __panel.__ready();
        __panel.__load();
      }
    })
    
    frame = $('<iframe id="goto-href-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;
      waitPanelInitialization(this.contentWindow, function() {
        QUnit.ok(true, 'Отключенная функция не запустилась');
        QUnit.start();
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show().get(0);
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
});

// Тест конвертации денег в число.
QUnit.test("Тест конвертации денег в число", function(assert) {
  assert.equal(__panel.convertingMoneyToInt(100), 100, "Converting: 100 > 100");
  assert.equal(__panel.convertingMoneyToInt(-574.9), -574, "Converting: -574.9 > 574");
  assert.equal(__panel.convertingMoneyToInt('$1,000,000'), 1000000, "Converting: '$1,000,000' > 1000000");
  assert.equal(__panel.convertingMoneyToInt('$1'), 1, "Converting: '$1' > 1");
  assert.equal(__panel.convertingMoneyToInt('$10.526'), 10526, "Converting: '$10.526' > 10526");
  assert.equal(__panel.convertingMoneyToInt('$-123456'), -123456, "Converting: '-123456' > -123456");
  assert.equal(__panel.convertingMoneyToInt('-$10.00 00,0-'), -1000000, "Converting: '-$10.00 00,0-' > -1000000");
  assert.equal(__panel.convertingMoneyToInt('$1 000 000'), 1000000, "Converting: '$1 000 000' > 1000000");
  assert.equal(__panel.convertingMoneyToInt('FakeNumber'), false, "Converting: 'FakeNumber' > false");
  assert.equal(__panel.convertingMoneyToInt('-$FakeNumber'), false, "Converting: '-$FakeNumber' > false");
  assert.equal(__panel.convertingMoneyToInt({}), false, "Converting: {} > false");
  assert.equal(__panel.convertingMoneyToInt(new String("String")), false, "Converting: new String('String') > false");
});

// Тест конвертации числа в деньги.
QUnit.test("Тест конвертации числа в деньги", function(assert) {
  assert.equal(__panel.convertingIntToMoney('1000'), '$1,000', "Converting: '1000' > '$1,000'");
  assert.equal(__panel.convertingIntToMoney('-100.4'), '$-100', "Converting: '-100.4' > '$-100'");
  assert.equal(__panel.convertingIntToMoney('skl5024'), false, "Converting: 'skl5024' > false");
  assert.equal(__panel.convertingIntToMoney('-5557u3jnd'), '$-5,557', "Converting: '-5557u3jnd' > '$-5,557'");
  assert.equal(__panel.convertingIntToMoney(1000000), '$1,000,000', "Converting: -1000000 > '$1,000,000'");
  assert.equal(__panel.convertingIntToMoney(100), '$100', "Converting: 100 > '$100'");
  assert.equal(__panel.convertingIntToMoney(1250), '$1,250', "Converting: 1250 > '$1,250'");
  assert.equal(__panel.convertingIntToMoney(1), '$1', "Converting: 1 > '$1'");
  assert.equal(__panel.convertingIntToMoney(-100), '$-100', "Converting: -100 > '$-100'");
  assert.equal(__panel.convertingIntToMoney(-1158), '$-1,158', "Converting: -1158 > '$-1,158'");
  assert.equal(__panel.convertingIntToMoney(-100006), '$-100,006', "Converting: -100006 > '$-100,006'");
  assert.equal(__panel.convertingIntToMoney(1.84), '$1', "Converting: 1.84 > '$1'");
  assert.equal(__panel.convertingIntToMoney(-1000.56), '$-1,000', "Converting: -1000.56 > '$-1,000'");
  assert.equal(__panel.convertingIntToMoney({}), false, "Converting: {} > false");
  assert.equal(__panel.convertingIntToMoney(new String("String")), false, "Converting: new String('String') > false");
});

QUnit.asyncTest('Тест сохранения опций для плавающих виджетов встроенной функцией options.save', function(assert) {
  expect(6);

  var options = jQuery.extend({}, panelSettingsCollection.default);
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
  var index = options.widgets.length - 1;

  __panel.setOptions(options, undefined, function() {
    console.log('test1 options set: ', __panel.getOptions());
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
    });

    frame = $('<iframe id="float-widgets-options-save-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;
      var __window = this.contentWindow;

      waitPanelInitialization(this.contentWindow, function() {
        setTimeout(function() {
          __window.__panel.redrawFloatWidgets();
        }, 200);
      });

    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).get(0);

    //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
  });
});

QUnit.asyncTest('Тест сохранения опций для виджетов встроенной функцией options.save', function(assert) {
  expect(6);
  var options = jQuery.extend({}, panelSettingsCollection.default);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = [];
    options.panes[i].widgets = [];
  }
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
    }
  });

  options.widgets = [];

  __panel.setOptions(options, undefined, function() {
    console.log('test2 options set: ', __panel.getOptions());
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
          $('.pane-bubble:first').click();
      }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show().get(0);
  });
});

QUnit.asyncTest('Тест сохранения опций для кнопок встроенной функцией options.save', function(assert) {
  expect(6);
  var options = jQuery.extend({}, panelSettingsCollection.default);
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
    });

    frame = $('<iframe id="button-options-save-iframe" src="' + document.location.href.split('?')[0]
       + '?gwpanel_testing&continue&gwpanel_pause"></iframe>').load(function() {
      var that = this;

      waitPanelInitialization(this.contentWindow, function() {
        (function($) {
          assert.equal(this.__panel.getOptions().panes[0].buttons.length, 2, 
            'в настройках должны быть две кнопки');
          setTimeout(function() {
            /// кликаем по бабблу, виджет должен прорисоваться и функция прорисовки 
            /// виджета должна быть вызвана
            $('.pane-bubble:first').click();

            /// Кликаем по кнопке
            $('#button_panel_test_button_0 a').click();
          }, 500);
      }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 1000, width: 1000}).show().get(0);
  });
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();

});

QUnit.asyncTest('Проверка функции checkPanePlaces', function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.default);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = [];
    options.panes[i].widgets = [];
  }
  options.panes[0].width = 6;
  options.panes[0].height = 4;
  /// добавляем кнопки и виджеты, чтобы места были заняты
  options.panes[0].buttons.push({
    type: 'panel_test_button',
    title: 'Test button',
    left: 0,
    top: 0,
    id: 'button_panel_test_button_0'
  });
  options.panes[0].buttons.push({
    type: 'panel_settings',
    title: 'настройки',
    left: 1,
    top: 0,
    id: 'button_panel_settings_button_1'
  });
  options.panes[0].widgets.push({
    type: 'panel_foo_widget',
    width: 6,
    height: 1,
    left: 0,
    top: 1,
    id: 'widget_panel_foo_widget_0'
  });
  
  __panel.setOptions(options, undefined, function() {
    var places = __panel.checkPanePlaces(0, {height: 1, width: 1});
    assert.deepEqual(places, [0, 2], 'Свободные места должны быть [0, 2]');
    var places = __panel.checkPanePlaces(0, {height: 1, width: 2});
    assert.deepEqual(places, [0, 2], 'Свободные места должны быть [0, 2]');
    var places = __panel.checkPanePlaces(0, {height: 1, width: 5});
    assert.deepEqual(places, [2, 0], 'Свободные места должны быть [2, 0]');
    var places = __panel.checkPanePlaces(0, {height: 1, width: 7});
    assert.equal(places, false, 'Свободных мест для виджета такого размера быть не должно');

    var places = __panel.checkPanePlaces(1, {height: 1, width: 1});
    assert.deepEqual(places, [0, 0], 'Свободные места должны быть [0, 0]');
    QUnit.start();
  });

});