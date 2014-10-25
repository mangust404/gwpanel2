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

if(!jQuery.browser.safari) {
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
}

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

if(!jQuery.browser.safari) {
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
}

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
    // на деплое и в продакшне событие загрузки стилей не приводит к мгновенной
    // активации правил из этой таблицы. Мы должны немного подождать...
    waitFor(function() {
      return $('#qunit-fixture .foo-bar').css('font-size') == '32px';
    }, function() {
      assert.deepEqual($('#qunit-fixture .foo-bar').css('font-size'), '32px', 
                       'Стили загружены');
      QUnit.start();
    }, 5000);
  }, function() {
    assert.ok(false, 'Таблица стилей не загружена');
    QUnit.start();
  })
});

/*if(!window.opera || window.opera.version() > 13) {
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
}*/

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
    //__panel.dispatchException(e);
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

/*QUnit.asyncTest('переход по ссылке', function(assert) {
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
*/
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
  var options = jQuery.extend({}, panelSettingsCollection.default);
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
          $widget.dblclick();
          waitFor(function() {
            return $('#blacklist-page').length > 0;
          }, function() {
            if(__window.location.hash.indexOf('blacklist') > -1) {
              //console.log('Шаг 3, тестируем blacklist');
              $('#blacklist-page').attr('checked', 'checked').change().checkboxradio('refresh');
              $('.widget-save').click();
              __window.location.href = dest + suff + '#blacklist';
            } else if(__window.location.hash.indexOf('only-page-class') > -1) {
              //console.log('Шаг 2. тестируем выставление only-page-class');
              $('#only-page-class').attr('checked', 'checked').change().checkboxradio('refresh');
              $('.widget-save').click();
              __window.location.href = dest + suff + '#only-page-class';
            } else {
              //console.log('Шаг первый, выставляем "только на этой странице" и переходим на dest');
              /// Шаг первый, выставляем "только на этой странице" и переходим на dest
              $('#only-page').attr('checked', 'checked').change().checkboxradio('refresh');
              $('.widget-save').click();
              __window.location.href = dest + suff + '#only-page';
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
            assert.equal($('.panel_foo_widget:visible').length, 1, 'Виджета должен быть на этой странице');
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
  expect(6);
  var options = jQuery.extend({}, panelSettingsCollection.default);

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
  var options = jQuery.extend({}, panelSettingsCollection.default);
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
  var options = jQuery.extend({}, panelSettingsCollection.default);
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

  var apply_initialized;

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

  var apply_initialized;

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

QUnit.asyncTest('Тестирование функции getCached с истечением по времени', function(assert) {
  var val1 = Math.random() * 10000000;
  var generator = 0;

  __panel.getCached(function(callback) {
    generator++;
    callback(val1);
  }, function(data) {
    assert.equal(data, val1);
  }, 2)
  __panel.getCached(function(callback) {
    generator++;
    callback(val1);
  }, function(data) {
    assert.equal(data, val1);
  }, 2);

  setTimeout(function() {
    __panel.getCached(function(callback) {
      generator++;
      callback(val1);
    }, function(data) {
      assert.equal(data, val1);
    }, 2)
  }, 1000);

  setTimeout(function() {
    __panel.getCached(function(callback) {
      generator++;
      callback(val1);
    }, function(data) {
      assert.equal(data, val1);
      assert.equal(generator, 2, 'Генератор должен быть вызван два раза');
      QUnit.start();
    }, 2)
  }, 3000);
});

QUnit.asyncTest('Тестирование функции getCached с истечением по событию', function(assert) {
  var val2 = Math.random() * 10000000;
  var generator = 0;

  /// Для запуска теста мы должны удостовериться что данных по этому кешу нет
  /// привязываемся к этому событию, чтобы затем вызвать его, и тем самым
  /// очистить кеш от предыдущего запуска
  var listen = __panel.bind('test_cached_event', function() {
    /// теперь мы можем быть уверены что данные от предыдущего запуска стёрлись
    /// иначе тест покажет несоответствие
    runTest();
  });

  __panel.getCached(function(callback) {
    generator++;
    callback(val2);
  }, function(data) {
    // здесь значение из предыдущего теста
  }, 'test_cached_event');

  setTimeout(function() {
    /// запуск события
    __panel.triggerEvent('test_cached_event');
  }, 1000);

  function runTest() {
    /// Теперь данные гарантированно должны быть удалены
    /// удаляем слушателя событий чтобы тест не запустился повторно
    __panel.unbind('test_cached_event', listen);
    __panel.getCached(function(callback) {
      generator++;
      callback(val2);
    }, function(data) {
      assert.equal(data, val2);
    }, 'test_cached_event')
    __panel.getCached(function(callback) {
      generator++;
      callback(val2);
    }, function(data) {
      assert.equal(data, val2);
    }, 'test_cached_event');

    setTimeout(function() {
      __panel.getCached(function(callback) {
        generator++;
        callback(val2);
      }, function(data) {
        assert.equal(data, val2);
        assert.equal(generator, 2, 'Генератор должен быть вызван два раза');
      }, 'test_cached_event');

      __panel.bind('test_cached_event', function() {
        __panel.getCached(function(callback) {
          generator++;
          callback(val2);
        }, function(data) {
          assert.equal(data, val2);
          assert.equal(generator, 3, 'Генератор должен быть вызван три раза');
          QUnit.start();
        }, 'test_cached_event');
      });

      __panel.triggerEvent('test_cached_event');

    }, 2000);
  }
});

QUnit.asyncTest('Тестирование менеджера настроек, создание с нуля', function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.default);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = [];
    options.panes[i].widgets = [];
  }

  var salt = Math.random();
  options.system.test = salt;
  var variantID;

  __panel.set('variants_' + __panel.currentPlayerID(), null, function() {
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
            $('#button_panel_settings_0 a').click();

            waitFor(function() {
              return $('#panel-settings-editor .ui-icon-edit').length > 0;
            }, function() {
              $('#panel-settings-editor .ui-icon-edit').click();
              $('.add-options-variant .ui-collapsible-heading-toggle:first').click();
              $('#add-title').val('test2');
              $('.add-options-variant input[type=submit]').click();

              assert.equal($('#add-title:visible').length, 0, 'Форма добавления должна закрыться');

              assert.ok($('#variant-name option:contains(test2)').length > 0, 'Вариант добавлен');
              variantID = $('#variant-name option:contains(test2)').attr('value');
              $('#variant-name').val(variantID).change();

              that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
                assert.equal(data, variantID, 'Вариант должен совпадать');
                that.contentWindow.location.href = that.contentWindow.location.href + '&' + salt;
              });
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
              $('#button_panel_settings_0 a').click();

              waitFor(function() {
                return $('#panel-settings-editor .ui-icon-edit').length > 0;
              }, function() {
                $('#panel-settings-editor .ui-icon-edit').click();

                $('#variant-name').val('default').change();
                that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
                  assert.equal(data, 'default', 'Вариант должен быть default');
                  that.contentWindow.location.href = that.contentWindow.location.href + '&finish';
                });
              });
            });
          } else {
            /// Окончание теста, проверяем первоначальные настройки
            that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
              assert.equal(data, 'default', 'Вариант в новой вкладке должен быть default');
              var current_options = that.contentWindow.__panel.getOptions();
              assert.equal(current_options.system.test, salt, 'Первоначальные настройки возвращены');
              QUnit.start();
            });
          }
        }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 500, width: 1000}).show().get(0);
  });
  });
  //$('#qunit-fixture').css({height: 500, width: 1000, position: 'static'}).show();
  
});

QUnit.asyncTest('Тестирование менеджера настроек, создание из шаблона', function(assert) {
  var options = jQuery.extend({}, panelSettingsCollection.default);
  /// Создаём конфигурацию с пустыми окнами
  for(var i = 0; i < 4; i++) {
    options.panes[i].buttons = [];
    options.panes[i].widgets = [];
  }

  var salt = Math.random();
  options.system.test = salt;
  var variantID;

  __panel.set('variants_' + __panel.currentPlayerID(), null, function() {
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
            $('#button_panel_settings_0 a').click();

            waitFor(function() {
              return $('#panel-settings-editor .ui-icon-edit').length > 0;
            }, function() {
              $('#panel-settings-editor .ui-icon-edit').click();
              $('.add-options-variant .ui-collapsible-heading-toggle:first').click();
              $('#add-title').val('test2');
              $('#add-collection').val('default');
              $('.add-options-variant input[type=submit]').click();

              assert.equal($('#add-title:visible').length, 0, 'Форма добавления должна закрыться');

              assert.ok($('#variant-name option:contains(test2)').length > 0, 'Вариант добавлен');
              variantID = $('#variant-name option:contains(test2)').attr('value');
              $('#variant-name').val(variantID).change();

              that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
                assert.equal(data, variantID, 'Вариант должен совпадать');
                that.contentWindow.location.href = that.contentWindow.location.href + '&' + salt;
              });
              //QUnit.start();
            });
          } else if(that.contentWindow.location.search.indexOf('finish') == -1) {
            // после обновления страницы с солью, проверяем вариант
            that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
              assert.equal(data, variantID, 'Вариант в новом окне должен совпадать');
              var current_options = that.contentWindow.__panel.getOptions()
              delete current_options.settings;
              assert.deepEqual(current_options, that.contentWindow.panelSettingsCollection.default);

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
                  that.contentWindow.location.href = that.contentWindow.location.href + '&finish';
                });
              });
            });
          } else {
            /// Окончание теста, проверяем первоначальные настройки
            that.contentWindow.__panel.get(__panel.getEnv() + '_opts_var_' + __panel.currentPlayerID(), function(data) {
              assert.equal(data, 'default', 'Вариант в новой вкладке должен быть default');
              var current_options = that.contentWindow.__panel.getOptions();
              assert.equal(current_options.system.test, salt, 'Первоначальные настройки возвращены');
              QUnit.start();
            });
          }
        }).apply(that.contentWindow, [that.contentWindow.jQuery])
      });
    }).appendTo('#qunit-fixture').css({height: 500, width: 1000}).show().get(0);
  });
  });
  //$('#qunit-fixture').css({height: 500, width: 1000, position: 'static'}).show();
  
});

QUnit.test('Тест функции pluralize', function(assert) {
  with(__panel) {
    assert.equal(pluralize(1, 'единица', 'единицы', 'единиц'), 'единица');
    assert.equal(pluralize(2, 'единица', 'единицы', 'единиц'), 'единицы');
    assert.equal(pluralize(3, 'единица', 'единицы', 'единиц'), 'единицы');
    assert.equal(pluralize(4, 'единица', 'единицы', 'единиц'), 'единицы');
    assert.equal(pluralize(5, 'единица', 'единицы', 'единиц'), 'единиц');
    assert.equal(pluralize(9, 'единица', 'единицы', 'единиц'), 'единиц');
    assert.equal(pluralize(11, 'единица', 'единицы', 'единиц'), 'единиц');
    assert.equal(pluralize(12, 'единица', 'единицы', 'единиц'), 'единиц');
    assert.equal(pluralize(21, 'единица', 'единицы', 'единиц'), 'единица');
    assert.equal(pluralize(22, 'единица', 'единицы', 'единиц'), 'единицы');
    assert.equal(pluralize(99, 'единица', 'единицы', 'единиц'), 'единиц');
    assert.equal(pluralize(100, 'единица', 'единицы', 'единиц'), 'единиц');
    assert.equal(pluralize(101, 'единица', 'единицы', 'единиц'), 'единица');
  }
});

QUnit.test('Тест функции encodeURIComponent', function(assert) {
  with(__panel) {
    assert.equal(encodeURIComponent('привет'), '%EF%F0%E8%E2%E5%F2', 'привет');
    assert.equal(encodeURIComponent('привет +/?'), '%EF%F0%E8%E2%E5%F2+%2B/?', 'привет +/?');
    assert.equal(encodeURIComponent('привет +/?'), '%EF%F0%E8%E2%E5%F2+%2B/?', 'привет +/?');
    assert.equal(encodeURIComponent('привет %20 + ?'), '%EF%F0%E8%E2%E5%F2+%2520+%2B+?', 'привет %20 + ?');
    assert.equal(encodeURIComponent('привет привет'), '%EF%F0%E8%E2%E5%F2+%EF%F0%E8%E2%E5%F2', 'привет привет');
    assert.equal(encodeURIComponent('привет +/? +/?'), '%EF%F0%E8%E2%E5%F2+%2B/?+%2B/?', 'привет +/? +/?');
    assert.equal(encodeURIComponent('привет %20 + ? %20 + ?'), '%EF%F0%E8%E2%E5%F2+%2520+%2B+?+%2520+%2B+?', 'привет %20 + ? %20 + ?');
    assert.equal(encodeURIComponent('ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏ'), '%80%81%82%83%84%85%86%87%88%89%8A%8B%8C%8D%8E%8F', 'ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏ');
    assert.equal(encodeURIComponent('°±Ііґµ¶·ё№є»јЅѕї'), '%B0%B1%B2%B3%B4%B5%B6%B7%B8%B9%BA%BB%BC%BD%BE%BF', '°±Ііґµ¶·ё№є»јЅѕї');
    assert.equal(encodeURIComponent('АБВГДЕЖЗИЙКЛМНОП'), '%C0%C1%C2%C3%C4%C5%C6%C7%C8%C9%CA%CB%CC%CD%CE%CF', 'АБВГДЕЖЗИЙКЛМНОП');
    assert.equal(encodeURIComponent('РСТУФХЦЧШЩЪЫЬЭЮЯ'), '%D0%D1%D2%D3%D4%D5%D6%D7%D8%D9%DA%DB%DC%DD%DE%DF', 'РСТУФХЦЧШЩЪЫЬЭЮЯ');
    assert.equal(encodeURIComponent('абвгдежзийклмноп'), '%E0%E1%E2%E3%E4%E5%E6%E7%E8%E9%EA%EB%EC%ED%EE%EF', 'абвгдежзийклмноп');
    assert.equal(encodeURIComponent('рстуфхцчшщъыьэюя'), '%F0%F1%F2%F3%F4%F5%F6%F7%F8%F9%FA%FB%FC%FD%FE%FF', 'рстуфхцчшщъыьэюя');
  }
});

QUnit.asyncTest('Тест jQuery.fn.sendForm', function(assert) {
  var salt = (new Date).getTime();
  __panel.currentPlayerName(function(name) {
    jQuery.ajax('/sms-create.php', {
      success: function(data) {
        jQuery('<div>').hide().appendTo(document.body)
        .append(data)
        .find('form').sendForm({
          data: {
            mailto: 'Riki_tiki_tavi',
            subject: 'тест ' + salt,
            msg: 'тестовое сообщение через аякс'
          },
          success: function() {
            jQuery.ajax('/sms.php', {
              success: function(data) {
                data = jQuery(data);
                assert.ok(data.text().indexOf('[новое] тест ' + salt), 'Письмо получено');
                jQuery.ajax(jQuery(data).find('a:contains(тест ' + salt + ')').attr('href'), {
                  success: function(data) {
                    data = jQuery(data);
                    var button = data.find('a:contains(Удалить сообщение)');
                    assert.ok(button.length > 0, 'найдена кнопка удаления письма');
                    assert.ok(data.text().indexOf('тестовое сообщение через аякс') > 0, 'найден отправленный текст');
                    jQuery.ajax(button.attr('href'), {
                      success: function() {
                        assert.ok(true, 'письмо удалено');
                        QUnit.start();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
});

QUnit.test('Тестирование функции __panel.fixForms', function(assert) {
  /// все возможные варианты ошибок спрайта
  assert.equal(__panel.fixForms('<table><form><tr><td></form></td></tr></table>'),
    '<form><table><tr><td></td></tr></table></form>');
  assert.equal(__panel.fixForms('<table><form><tr><td></td></tr></form></table>'),
    '<form><table><tr><td></td></tr></table></form>');
  assert.equal(__panel.fixForms('<table><form><tr><td></td></tr></table></form>'),
    '<form><table><tr><td></td></tr></table></form>');
  assert.equal(__panel.fixForms('<div><form><table><tr><td></td></tr></table></form></div>'),
    '<div><form><table><tr><td></td></tr></table></form></div>');
  assert.equal(__panel.fixForms('<form><table><tr><td></td></tr></table></form>'),
    '<form><table><tr><td></td></tr></table></form>');
  assert.equal(__panel.fixForms('<form><table><tr><td></td></form></tr></table>'),
    '<form><table><tr><td></td></tr></table></form>');

  /// всё по два раза
  assert.equal(__panel.fixForms('<table><form><tr><td></form></td></tr></table><table><form><tr><td></form></td></tr></table>'),
    '<form><table><tr><td></td></tr></table></form><form><table><tr><td></td></tr></table></form>');
  assert.equal(__panel.fixForms('<table><form><tr><td></td></tr></form></table><table><form><tr><td></td></tr></form></table>'),
    '<form><table><tr><td></td></tr></table></form><form><table><tr><td></td></tr></table></form>');
  assert.equal(__panel.fixForms('<table><form><tr><td></td></tr></table></form><table><form><tr><td></td></tr></table></form>'),
    '<form><table><tr><td></td></tr></table></form><form><table><tr><td></td></tr></table></form>');
  assert.equal(__panel.fixForms('<div><form><table><tr><td></td></tr></table></form></div><div><form><table><tr><td></td></tr></table></form></div>'),
    '<div><form><table><tr><td></td></tr></table></form></div><div><form><table><tr><td></td></tr></table></form></div>');
  assert.equal(__panel.fixForms('<form><table><tr><td></td></tr></table></form><form><table><tr><td></td></tr></table></form>'),
    '<form><table><tr><td></td></tr></table></form><form><table><tr><td></td></tr></table></form>');
  assert.equal(__panel.fixForms('<form><table><tr><td></td></form></tr></table><form><table><tr><td></td></form></tr></table>'),
    '<form><table><tr><td></td></tr></table></form><form><table><tr><td></td></tr></table></form>');

  /// Более комплексный вариант
  assert.equal(__panel.fixForms('<table><tr><td><table><tr><td></td></tr><form><tr><td></td></tr></table></form></td></tr></table><form><table><tr><td></td></tr></table></form>'),
    '<table><tr><td><form><table><tr><td></td></tr><tr><td></td></tr></table></form></td></tr></table><form><table><tr><td></td></tr></table></form>');
  assert.equal(__panel.fixForms('<table><tr><td></td></tr><tr><td></td></tr><tr><td><form></td></tr><tr><td><input type="submit"></form></td></tr></table>'),
    '<form><table><tr><td></td></tr><tr><td></td></tr><tr><td></td></tr><tr><td><input type="submit"></td></tr></table></form>', 
    'Такая структура формы на ферме');

  var result = __panel.fixForms('<table width=100% cellpadding=4 cellspacing=2 border=0>\
\
<tr><td bgcolor=#e0eee0>Ближайшее действие: <a href=/ferma.php?x=0&y=0>полить Тюльпаны</a> (через 15 мин.)</td></tr>\
\
<tr><td bgcolor=#f0fff0>Грядка пустая. \
Самое время на нее что-нибудь посадить!<br>\
На счете фермы <b>$50396</b>, получен опыт 6.576 ед.</td></tr>\
<tr><td bgcolor=#f0fff0>\
<center><a href=/ferma.php?x=1&y=0&section=plants>Посадки</a> | <a \
href=/ferma.php?x=1&y=0&section=items>Постройки</a></center><form style=\'display:inline;\' action=/ferma.php method=POST>\
<input type=hidden name=hsh value=\'df8a0\'>\
<input type=hidden name=action value=\'plant\'>\
<input type=hidden name=x value=1>\
<input type=hidden name=y value=0>\
<input type=radio name=plant_id value=\'ukrop\' id=btn_ukrop><label for=btn_ukrop><font color=#006600><b>Укроп</b>, <b>$5</b></font></label><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Зеленый укроп для зеленого салата<br><li> Время созревания: 12 минут<br>\
<li> Премия за урожай: <font color=#990000><b>$6</b></font>, +0.007 опыта<br><br><input type=radio name=plant_id value=\'opyata\' id=btn_opyata><label for=btn_opyata><font color=#006600><b>Странные опята</b>, <b>$10</b></font></label><br><li> Время созревания: 376 минут<br>\
<li> Премия за урожай: <font color=#990000><b>$40</b></font>, +0.204 опыта<br><br><input type=radio name=plant_id value=\'tulips\' id=btn_tulips checked ><label for=btn_tulips><font color=#006600><b>Тюльпаны</b>, <b>$20</b></font></label><br><li> Время созревания: 67 минут<br>\
<li> Премия за урожай: <font color=#990000><b>$26</b></font>, +0.04 опыта<br><br><input type=radio name=plant_id value=\'mak\' id=btn_mak disabled ><label for=btn_mak><font color=#0066f00><b>Полевой мак</b>, <b>$12</b></font></label><br><li> Время созревания: 27 минут<br>\
<li> Премия за урожай: <font color=#990000><b>$15</b></font>, +0.02 опыта<br><i>(Не хватает 6.924 ед. опыта)</i><br><br><center><b><a href=/ferma.php?x=1&y=0&page_id=0><font color=red>1</font></a> | <a href=/ferma.php?x=1&y=0&page_id=1>2</a> | <a href=/ferma.php?x=1&y=0&page_id=2>3</a> | <a href=/ferma.php?x=1&y=0&page_id=3>4</a> | <a href=/ferma.php?x=1&y=0&page_id=4>5</a> | <a href=/ferma.php?x=1&y=0&page_id=5>&gt;&gt;</a></b></center></td></tr><tr><td bgcolor=#d0eed0 align=center><input type=submit value=\'Посадить\'></form></td></tr></table> test test\
');
  jQuery(result).appendTo('#qunit-fixture');
  assert.equal($('#qunit-fixture form').length, 1, 'форма есть');
  assert.equal($('#qunit-fixture form input[type=submit]').length, 1, 'кнопка есть');

  var result = __panel.fixForms('<table cellspacing=0 cellpadding=5 align=center>\n\
<tr><td class=greenbrightbg>\n\
<table align=center width=90>\n\
<tr>\n\
<form action=/map.move.php method=post><input type=hidden name=moveup value=1><input type=hidden name=moveleft value=1><td align=center>\n\
<input type=image src=\'http://images.ganjawars.ru/i/m-n.png\' width=26 height=26 border=0 alt=\'Перейти на клетку вверх\'></td></form>\n\
\n\
<form action=/map.move.php method=post><input type=hidden name=moveup value=1><td align=center>\n\
<input type=image src=\'http://images.ganjawars.ru/i/m-n.png\' width=26 height=26 border=0 alt=\'Перейти на клетку вверх\'></td></form>\n\
\n\
<form action=/map.move.php method=post><input type=hidden name=moveup value=1><input type=hidden name=moveright value=1><td align=center>\n\
<input type=image src=\'http://images.ganjawars.ru/i/m-n.png\' width=26 height=26 border=0 alt=\'Перейти на клетку вверх\'></td></form>\n\
\n\
</tr>\n\
</table>\n\
</td></tr></table>');

  jQuery('#qunit-fixture').html(result);
  assert.equal($('#qunit-fixture form').length, 3, '3 формы есть');
  assert.equal($('#qunit-fixture form input[type=image]').length, 3, '3 кнопки есть');

  var result = __panel.fixForms('&nbsp;&nbsp;Вместимость: <b>30</b> предметов, <b>500</b> ед. ресурсов<br><br>\n\
<form action=object-hdo.php method=POST style=\'display:inline;\'>\n\
<input type=hidden name=object_id value=41498>\n\
<input type=hidden name=t value=2>\n\
\n\
<table border=0 cellpadding=5 cellspacing=1 width=550 style=\'border-bottom:1px solid #003300; border-top:1px solid #003300;\'><tr>\n\
<td class=greenbg><nobr><B>Ввод, Гб</b></nobr></td>\n\
<td class=greenbg><nobr><b>Вывод, Гб</b></nobr></td>\n\
<td width=50% align=center class=greenbg><nobr><b>Примечание</b></nobr></td>\n\
</tr>\n\
\n\
<tr>\n\
<td class=greenlightbg><input type=text name=money_in value=0 size=5 maxlength=7></td>\n\
<td class=greenlightbg>\n\
<input type=text name=money_out value=0 size=5 maxlength=7>\n\
</td>\n\
<td class=greenlightbg align=left><input type=text name=opdesc value=\'\' style=\'width:70%\'><input type=submit value="&raquo;" class=mainbutton></td>\n\
</tr>\n\
</form>\n\
</table>\n\
<form action=object-hdo.php method=POST style=\'display:inline;\'>\n\
  <input type=hidden name=t value=1>\n\
  <input type=hidden name=in value=1>\n\
  <input type=hidden name=object_id value=111563>\n\
<table border=0 cellspacing=1 cellpadding=5 width=550 style=\'border-bottom:1px solid #003300;\'>\n\
<tr><td colspan=2 align=center class=greenbg><b>Вы можете положить предмет в дом:</b></td></tr><tr><td class=greengreenbg align=right><select name=putitem></select></td><td align=center class=greengreenbg><input type=submit value=\'Положить\' class=mainbutton>\n\
</td></tr></table>\n\
</form>');
  assert.ok(result.indexOf('</form>') > result.indexOf('</table>'), '</form> перед </table>');
});