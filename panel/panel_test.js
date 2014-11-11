QUnit.module('panel');

(function($) {
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
  __panel.onload(function() {
    assert.ok(String(__panel.getOptionsID()).indexOf("testing") != -1, 
      'optionsID содержат "testing": ' + __panel.getOptionsID());
  });
});

QUnit.test("Тест объекта __panel.crossWindow", function(assert) {
  assert.equal('object', String(typeof(__panel.crossWindow)).toLowerCase(), 
    'объект crossWindow был создан');
  $(['bind', 'get', 'set', 'triggerEvent', 'unbind']).each(function() {
    assert.function_exists('__panel.' + this, __panel[this]);
  });
}); 

QUnit.asyncTest("Тест кеширования настроек и переменных", function(assert) {
  var rand1 = Math.random();
  var rand2 = Math.random();
  /// Создаём два фрейма, меняем настройки в одном и проверяем их в другом
  var $frame1 = $('<iframe id="cache-test-iframe-0" src="http://www.ganjawars.ru/me/' + 
    '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(that.contentWindow, function() {
      if(that.contentWindow.location.href.indexOf('step1') > -1) {
        that.contentWindow.__panel.crossWindow.get('param', function(data) {
          assert.equal(data, rand2);
          QUnit.start();
        });
      } else {
        that.contentWindow.__panel.set('param', rand1, function() {
          $frame2.appendTo('#qunit-fixture');
        });
      }
    });
  }).appendTo('#qunit-fixture');

  var $frame2 = $('<iframe id="cache-test-iframe-1" src="http://www.ganjawars.ru/me/' + 
    '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(that.contentWindow, function() {
      if(that.contentWindow.location.href.indexOf('step1') > -1) {
        that.contentWindow.__panel.crossWindow.get('param', function(data) {
          assert.equal(data, rand);
          QUnit.start();
        })
      } else {
        that.contentWindow.__panel.get('param', function(value) {
          assert.equal(value, rand1);
          that.contentWindow.__panel.set('param', rand2, function() {
            $frame1.get(0).contentWindow.__panel.get('param', function(foreign_value) {
              assert.equal(foreign_value, rand2, 'Значение в первом окне поменялось');
              $frame1.get(0).contentWindow.location.href = 'http://www.ganjawars.ru/me/?gwpanel_testing&continue&step1';
            });
          });
        });
      }
    });
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

QUnit.asyncTest("Тест функции panel.crossWindow.set/get", function(assert) {
  var eventdata = {'foreign test': 'успех'};
  var rand = Math.random();

  $('<iframe id="sync-test-iframe" src="http://www.ganjawars.ru/me/' + 
    '?gwpanel_testing&continue"></iframe>').load(function() {
    var that = this;
    waitPanelInitialization(that.contentWindow, function() {
      if(that.contentWindow.location.href.indexOf('step1') > -1) {
        that.contentWindow.__panel.crossWindow.get('param', function(data) {
          assert.equal(data, rand);
          QUnit.start();
        })
      } else {
        that.contentWindow.__panel.set('param', rand, function() {
          that.contentWindow.location.href = 'http://www.ganjawars.ru/me/' + 
                                             '?gwpanel_testing&continue&step1';
        });
      }
    });
  }).appendTo('#qunit-fixture');
});

QUnit.asyncTest("Тест событий из текущего окна", function(assert) {
  expect(3);
  var eventdata = {'test': 'успех'};
  var count = 0;
  __panel.onload(function() {
    var l1 = __panel.bind("self-event-test", function(data) {
      assert.deepEqual(eventdata, data, "значение первого слушателя должно совпадать");
      count++;
      if(count >= 2) {
        QUnit.start();
      }
    });
    var l2 = __panel.bind("self-event-test", function(data) {
      assert.deepEqual(eventdata, data, "значение первого слушателя должно совпадать");
      count++;
      if(count >= 2) {
        QUnit.start();
      }
    });
    assert.notEqual(l1, l2, 'идентификаторы слушателей отличаются');

    __panel.triggerEvent('self-event-test', eventdata);
  });
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
        var local_options = JSON.parse(sessionStorage['gwp2_' + __panel.getOptionsID()]);
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
      setTimeout(function() {
        assert.ok($('.pane').length > 0, 'Открылось окошко');
      }, 20);
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
        setTimeout(function() {
          assert.ok(pane.length > 0, 'Открылось окошко');
        }, 20);
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
      },
      id: 'npc_npc_z_0'
    }]
  };
  options.panes[1] = {
    width: 6,
    height: 4,
    buttons: [{
      type: 'panel_settings',
      top: 0,
      left: 0,
      arguments: {}
    }],
    widgets: []
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
      },
      id: 'npc_npc_z_0'
    }]
  };
  options.panes[1] = {
    width: 6,
    height: 4,
    buttons: [{
      type: 'panel_settings',
      top: 0,
      left: 0,
      arguments: {}
    }],
    widgets: []
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
          waitFor(function() {
            return $('.pane-bubble:visible').length > 0;
          }, function() {
            $('.pane-bubble:visible:first').click();
          });

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

  var runFunc = function(callback) {
    generator++;
    callback(val1);
  }

  __panel.clearCached(runFunc, function() {
    __panel.getCached(runFunc, function(data) {
      assert.equal(data, val1);

      __panel.getCached(runFunc, function(data) {
        assert.equal(data, val1);

        setTimeout(function() {
          __panel.getCached(runFunc, function(data) {
            assert.equal(data, val1);
          }, 2)
        }, 1000);

        setTimeout(function() {
          __panel.getCached(runFunc, function(data) {
            assert.equal(data, val1);
            assert.equal(generator, 2, 'Генератор должен быть вызван два раза');
            QUnit.start();
          }, 2)
        }, 3000);
      }, 2);
    }, 2);
  });
});

QUnit.asyncTest('Тестирование функции getCached с истечением по событию', function(assert) {
  var val2 = Math.random() * 10000000;
  var event_name = 'test_cached_event' + String(Math.random() * 10000000).split('.')[0];
  var generator = 0;
  var customCallback = function() {
    //generator = 0;
  }

  var runFunc = function(callback) {
    generator++;
    callback(val2);
    customCallback();
  }

  /// вторая функция, нужна для проверки очистки cacheListeners
  var secondFunc = function(callback) {
    callback('123');
  }

  var cid = 'cached_' + runFunc.toString().replace(/[\n\s\t]/g, '').hashCode();
  assert.ok(true, cid);

  __panel.getCached(secondFunc, function(data) {
    assert.equal(data, '123');
    __panel.clearCached(runFunc, function() {
      /// Теперь данные гарантированно должны быть удалены
      /// удаляем слушателя событий чтобы тест не запустился повторно
      __panel.getCached(runFunc, function(data) {
        assert.equal(data, val2);
        __panel.getCached(runFunc, function(data) {
          assert.equal(data, val2);
        }, event_name);
        __panel.getCached(runFunc, function(data) {
          assert.equal(data, val2);
          assert.equal(generator, 1, 'Генератор должен быть вызван один раз');
        }, event_name);

        __panel.bind(event_name, function() {
          __panel.getCached(runFunc, function(data) {
            assert.equal(data, val2);
            assert.equal(generator, 2, 'Генератор должен быть вызван два раза');
            /// ещё раз вызываем вторую функцию чтобы объект listeners[event_name]
            /// содержал хоть что-нибудь т.к. после вызова события он будет пустой
            __panel.getCached(secondFunc, function(data) {
              assert.equal(data, '123');
              __panel.get('cacheListeners', function(listeners) {
                //console.log('cacheListeners after secondFunc', JSON.stringify(listeners));
                __panel.clearCached(runFunc, function() {
                  __panel.get('cacheListeners', function(listeners) {
                    //console.log('cacheListeners after clean runFunc', JSON.stringify(listeners));
                    assert.equal(jQuery.type(listeners[event_name]), 'array', 
                      'Нужное осталось');
                    assert.equal(jQuery.type(listeners[event_name][cid]), 'undefined', 
                      'Мусор подчищен');
                    //console.log('cleaned listeners: ', JSON.stringify(listeners));
                    __panel.clearCached(secondFunc);
                    QUnit.start();
                  });
                });
              });
            }, event_name);
          }, event_name);
        });
        __panel.triggerEvent(event_name);
      }, event_name)
    });
  }, event_name);

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
    assert.equal(encodeURIComponent('sx=150&sy=150'), 'sx%3D150%26sy%3D150', 'sx=150&sy=150');
    assert.equal(encodeURIComponent("test\r\nпривет\r\n"), "test\r\n%EF%F0%E8%E2%E5%F2\r\n", "переносы строк");
  }
});

QUnit.asyncTest('Тест jQuery.fn.sendForm', function(assert) {
  var salt = (new Date).getTime();
  __panel.currentPlayerName(function(name) {
    jQuery.ajax('/sms-create.php', {
      success: function(data) {
        jQuery('<div>').hide().appendTo(document.body)
        .html(data)
        .find('form').sendForm({
          data: {
            mailto: name,
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

QUnit.test('Исправление форм, продвинутый вариант', function(assert) {
  __panel.loadScript('panel/panel_ajax.js', function() {
    var html = '<table>\
<tr><td class=greengreenbg>Трава</td>\
<td>0</td>\
<form action=object-hdo.php method=POST name=testform>\
<input type=hidden name=t value=3>\
<input type=checkbox checked name="chk1">\
<input type=hidden checked name="testvalue1">\
<input type=radio checked value="val1" name="radio1">\
<input type=radio value="val2" name="radio1">\
<input type=hidden  name=object_id value=41498>\
<input type=hidden name=resource value=\'metal\'>\
<select name=sxy style=\'width:100%\'>\
<option value=\'150x149\'>[Z] Crystal Sector</option><option selected="selected" value=\'150x150\'>[Z] Cyborg Capital</option>\
</select>\
<td><input type=text name=am_in size=4 value=0></td>\
<td><input type=text name=am_out size=4 value=0></td>\
<td><input type=submit name=submit value=\'&raquo;\' class=mainbutton> <input type=submit name=submit value=\'ещё сабмит\' class=mainbutton></td>\
<td><button>тест</button>\
<td><textarea name="textarea">тест \
textarea</textarea></td>\
</form>\
</tr><tr><td class=greenbg>Всего:</td><td class=greenbg>500</td><td class=greenbg>66</td><td class=greenbg colspan=3>&nbsp;</td></tr></table></td></tr>\
<tr>\
<td>\
<form action=object-hdo.php method=POST id=testformid><input type=hidden name=hidden1 value=1>\
</td>\
</tr>\
<tr>\
<td>\
<input type=hidden checked name="testvalue2">\
<input type=checkbox id="killin0" name="killinn[0]">\
<input type=checkbox id="killin1">\
<select name=select_value>\
<option value=\'test1\'>Тест 1</option><option selected="selected" value=\'test2\'>Тест 2</option>\
</select>\
<textarea name="textarea_value">foo \
value</textarea></td>\
</tr></table>\
</form>\
<script type="text/javascript">\
document.forms.testform.testvalue1.value="test";\
document.forms.testformid.testvalue2.value="test2";\
document.forms.testformid.select_value.value="test2";\
document.forms.testformid.textarea_value.value="test2";\
document.forms.testformid.killin0.checked = true;\
document.forms.testformid.killin1.checked = true;\
jQuery(document.forms.testformid.testvalue2.textarea_value).focus();\
</script>';

    var $fixture = $('#qunit-fixture').html(html);
    //console.log($fixture.find('*').map(function() { return this.outerHTML}));

    assert.equal($fixture.find('form').length, 2, 'Две формы');

    var className = $fixture.find('form').eq(0).attr('class');
    assert.ok(className.indexOf('gwp-form-') > -1, 'Для формы прописался класс');
    var index = $fixture.find('form').eq(0).attr('index');
    className = 'gwp-form-' + index + '-item';

    var index2 = $fixture.find('form').eq(1).attr('index');
    var className2 = 'gwp-form-' + index2 + '-item';

    assert.equal($fixture.find('.' + className + '[name="chk1"]').attr('checked'), 'checked', 'Проверка чекбокса');
    assert.equal($fixture.find('.' + className + '[name="radio1"][value="val1"]').attr('checked'), 'checked', 'Проверка radio 1, должен быть нажат');
    assert.equal($fixture.find('.' + className + '[name="radio1"][value="val2"]').attr('checked'), undefined, 'Проверка radio 2, должен быть отжат');
    assert.equal($fixture.find('.' + className + '[name="testvalue1"]').val(), 'test', 'проверка скрытого значения изменённого скриптом в первой форме');
  /*  assert.equal(document.forms.testformid.chk1.checked, true);
    assert.equal(document.forms.testform.elements.chk1.checked, true);
    assert.equal(document.forms.testformid.elements.chk1.checked, true);*/
    assert.equal($fixture.find('select' + '.' + className + '[name=sxy]').val(), '150x150', 'проверка значения селектбокса');
    assert.equal($fixture.find('textarea' + '.' + className + '[name=textarea]').val(), 'тест \
textarea', 'проверка значения textarea');

    assert.equal($fixture.find('.' + className2 + '[name="testvalue2"]').val(), 'test2', 'проверка скрытого значения изменённого скриптом во второй форме');
    assert.equal($fixture.find('select' + '.' + className2 + '[name=select_value]').val(), 'test2', 'проверка значения селектбокса');
    assert.equal($fixture.find('textarea' + '.' + className2 + '[name=textarea_value]').val(), 'test2', 'проверка значения textarea');
    assert.equal($fixture.find('#killin0').attr('checked'), 'checked', 'Чекбокс проставился по айдишнику');
    assert.equal($fixture.find('#killin1').attr('checked'), 'checked', 'Чекбокс проставился по айдишнику без имени');

    var $hidden = $fixture.find('input[name=hidden1]');
    assert.equal($hidden.val(), '1', 'скрыто поле присутствует');
    assert.ok($hidden.hasClass(className2), 'класс проставлен');

    //assert.ok(document.forms.testform.elements.length > 0, 'У формы testform есть элементы');
    //assert.ok(document.forms.testformid.elements.length > 0, 'У формы testformid есть элементы');
    $.each(document.forms.testform.elements, function(i, element) {
      if(typeof(element) == 'array') {
        $.each(element, function(i, _element) {
          if(_element.name) {
            assert.ok($(_element).hasClass(className), 'У элемента ' + element.name + ' есть класс');
          } else if(element.id) {
            assert.ok($(_element).hasClass(className), 'У элемента ' + element.id + ' есть класс');
          }
        });
      } else if(element.name) {
        assert.ok($(element).hasClass(className), 'У элемента ' + element.name + ' есть класс');
      } else if(element.id) {
        assert.ok($(element).hasClass(className), 'У элемента ' + element.id + ' есть класс');
      }

    });
    $.each(document.forms.testformid.elements, function(i, element) {
      if(typeof(element) == 'array') {
        $.each(element, function(i, _element) {
          if(_element.name) {
            assert.ok($(_element).hasClass(className2), 'У элемента ' + element.name + ' есть класс');
          } else if(element.id) {
            assert.ok($(_element).hasClass(className2), 'У элемента ' + element.id + ' есть класс');
          }
        });
      } else if(element.name) {
        assert.ok($(element).hasClass(className2), 'У элемента ' + element.name + ' есть класс');
      } else if(element.id) {
        assert.ok($(element).hasClass(className2), 'У элемента ' + element.id + ' есть класс');
      }
    });
  });
});

QUnit.test('Исправление ссылок', function(assert) {
  var $div = $('<div>').html('\
<a href=/page.html>page.html</a>\
<a href=\'/page.html\'>page.html</a>\
<a href="/page.html">page.html</a>\
<a href=http://www.test.com/page.html>page.html</a>\
<a href="http://www.test.com/page.html">page.html</a>\
<a href=\'http://www.test.com/page.html\'>page.html</a>\
<a href=http://www.test.com/page.html/>page.html</a>\
<a href="http://www.test.com/page.html/">page.html</a>\
<a href=\'http://www.test.com/page.html/\'>page.html</a>\
<div id="test_link1">test_link1</div>\
<div id="test_link2">test_link2</div>\
<div id="test_link3">test_link3</div>\
<div id="test_link4">test_link4</div>\
<div id="test_link5">test_link1</div>\
<div id="test_link6">test_link2</div>\
<div id="test_link7">test_link3</div>\
<div id="test_link8">test_link4</div>')
    .appendTo('#qunit-fixture');

  var $second = $('<div>').html('\
<script type"text/javascript">\
jQuery("#test_link1").get(0).innerHTML = "<a href=/page.html>page.html</a>";\
jQuery("#test_link2").get(0).innerHTML = \'<a href=/page.html>page.html</a>\';\
jQuery("#test_link3").get(0).innerHTML = "<a href=\'/page.html\'>page.html</a>";\
jQuery("#test_link4").get(0).innerHTML = \'<a href="/page.html">page.html</a>\';\
jQuery("#test_link5").get(0).innerHTML = "<a href=http://test.com/page.html/>page.html</a>";\
jQuery("#test_link6").get(0).innerHTML = \'<a href=http://test.com/page.html/>page.html</a>\';\
jQuery("#test_link7").get(0).innerHTML = "<a href=\'http://test.com/page.html/\'>page.html</a>";\
jQuery("#test_link8").get(0).innerHTML = \'<a href="http://test.com/page.html/">page.html</a>\';\
</script>\
')
    .appendTo('#qunit-fixture');

  assert.ok($div.find('a').length, 16, 'Все ссылки проставились');
  $div.find('a').each(function() {
    var href = $(this).attr('href');
    assert.ok(href.indexOf('/page.html') > -1, 'Ссылка содержит /page.html: ' + href);
    var ar = href.match(/page\.html/g);
    assert.equal(ar.length, 1, 'Ссылка содержит page.html только 1 раз: ' + ar.join('; '));
    assert.equal($(this).text(), 'page.html', 'Текст ссылки должен быть page.html: ' + $(this).text());

  });
});

})(jQuery);