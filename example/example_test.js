(function(panel, $) {

QUnit.module('example');
// пара функций-хелперов для проведения асинхронных тестов

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

/**
* Тестирование - очень важный момент при разработке модулей.
* Поскольку в игре постоянно что-то меняется: разметка, переименовываются страницы,
* добавляются новые данные на страницах. В том случае, если ваш модуль добавляет
* какие-то данные на страницы, или получает их, то при изменении в игре ваш модуль
* может отвалиться. Чтобы узнать, что ваш модуль отвалился, и нужны эти тесты.
*
* Основной метод тестирования - открытие нового фрейма с соответствующей страницей,
* ожидание пока панель вызовет вашу функцию, и проверка видимого результата.
*
* Если ваш модуль предоставляет какую-то функцию, которая может использоваться другими 
* модулями, то также нужно написать тест для этих функций
*/ 

QUnit.asyncTest('Проверка подсветки ссылок', function(assert) {
  /// открываем домашнюю страничку
  /// параметр в конце gwpanel_test=true&continue говорит гвпанели открывать страницу
  /// в соответствующем тестовом окружении
  $('<iframe src="http://www.ganjawars.ru/me/?gwpanel_test=true&continue"></iframe>').load(function() {
    /// запоминаем окно iframe-а в переменную, чтобы иметь к ней доступ
    var __window = this.contentWindow;
    waitPanelInitialization(this.contentWindow, function() {
      // эта функция вызывается когда панель подгрузилась и прорисовалась

      // обращаемся к jQuery открытого iframe-а
      // и запрашиваем есть ли ссылки с классом "player-info"
      assert.ok(__window.jQuery('a.player-info').length > 0, 'Ссылки подсветились');

      // эту функцию нужно вызвать по завершении теста
      QUnit.start();
    });
  }).appendTo('#qunit-fixture');
});

QUnit.asyncTest('Проверка при наведении на ссылки', function(assert) {
  $('<iframe src="http://www.ganjawars.ru/me/?gwpanel_test=true&continue"></iframe>').load(function() {
    /// запоминаем окно iframe-а в переменную, чтобы иметь к ней доступ
    var __window = this.contentWindow;
    waitPanelInitialization(this.contentWindow, function() {
      // получаем первую попавшуюся ссылку
      var $link = __window.jQuery('a.player-info:visible:first');
      assert.equal($link.length, 1, 'Найдена ссылка на персонажа');

      // эмулируем наведение на ссылку
      $link.mouseenter();

      // Поскольку мы не можем точно сказать когда данные будут подгружены
      // и окошко с данными игрока прорисуются, то используем метод waitFor.
      // Этот метод вызывает функцию в первом агрументе до тех пор, пока она
      // не вернёт true,  либо не пройдёт таймаут (по-умолчанию 10 секунд), 
      // и после того как первая функция вернёт true, вызывается вторая функция
      waitFor(function() {
        return __window.jQuery('.player-info-div:visible').length > 0;
      }, function() {
        var $player_info_div = __window.jQuery('.player-info-div:visible');

        assert.ok($player_info_div.text().search(/Боевой: [0-9]+/), 
                    'Выведен боевой уровень');
        assert.ok($player_info_div.text().search(/Экономический: [0-9]+/), 
                    'Выведен экономический уровень');
        assert.ok($player_info_div.text().search(/Производственный: [0-9]+/), 
                    'Выведен производственный уровень');
        QUnit.start();
      });
    });
  }).css({width: 1000, height: 600}).appendTo('#qunit-fixture');

  // Если нужно посмотреть, что происходит во фрейме, можно использовать такой код
  //$('#qunit-fixture').css({height: 1000, width: 1000, position: 'static'}).show();
});

})(__panel, jQuery);