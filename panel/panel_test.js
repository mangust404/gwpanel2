QUnit.assert.function_exists = function(needle, haystack, message) {
  var exists = String(typeof(haystack)).toLowerCase() == 'function';
  QUnit.push(exists, exists, needle, 'функция ' + needle + ' существует');
}

QUnit.test("Тест объекта __panel", function(assert) {
  assert.equal(String(typeof(window.__panel)).toLowerCase(), 'object', 
    'объект панели был создан');

  $(['set', 'get', 'loadScript', 'loadScriptComplete', 'loadCSS', 
     'checkFocused', 'dispatchException', 'toQueryParams', 'triggerEvent', 
     'bind', 'unbind', 'getOptions', 'setOptions', 'setWidgetOptions', 
     'gotoHref', 'onInit', 'path_to_theme']).each(function() {
    assert.function_exists('__panel.' + this, __panel[this]);
  })

});

QUnit.test("Тест объекта __panel.crossWindow", function(assert) {
  assert.equal(String(typeof(__panel.crossWindow)).toLowerCase(), 'object', 
    'объект crossWindow был создан');
  $(['bind', 'get', 'set', 'triggerEvent', 'unbind']).each(function() {
    assert.function_exists('__panel.' + this, __panel[this]);
  });
});

QUnit.test("Тест onInit()", function(assert) {
  expect(1);
  __panel.onInit(function() {
    assert.ok(true, "Функция отработала после инициализации");
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
     + '?123"></iframe>').load(function() {
    var that = this;
    setTimeout(function() {
      that.contentWindow.__panel.onInit(function() {
        that.contentWindow.__panel.triggerEvent('foreign-event-test', eventdata);
      });
    }, 1000); /// 1 секунды должно хватить на инициализацию панели во фрейме
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
          if(counter == 200) {
            assert.ok(true, "400 событий из текущего окна и из чужого было запущено");
            assert.deepEqual(thread_counter, [50, 50, 50, 50], 
              'Все потоки выполнены успешно');
            QUnit.start();
          } else {
            assert.equal(0, counter, 'Были запущены лишние события');
          }
        }, 100);
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
     + '?123"></iframe>').load(function() {
    var that = this;
    setTimeout(function() {
      that.contentWindow.__panel.onInit(function() {
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
    }, 1000); /// 1 секунды должно хватить на инициализацию панели во фрейме
  }).appendTo('#qunit-fixture');
});