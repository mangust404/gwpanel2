(function(panel, $) {
jQuery.extend(panel, {
  panel_detect_greasemonkey: function(callback) {
    /// Определяем, установлен ли гризманки
    var s = document.createElement('script');
    s.src = 'resource://greasemonkey/constants.js';
    setTimeout(function() {
      if ($.type(window.GM_constants) !== 'undefined') {
        callback('Greasemonkey');
      }
    }, 500);
    document.body.appendChild(s);
  },

  panel_detect_tampermonkey: function(callback) {
    var stateChange = 0;
    try {
      var xmlhttp = new window.XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        stateChange++;
        if(stateChange > 1) {
          /// Произошло 2 редиректа
          callback('Tampermonkey');
        }
      }
      xmlhttp.open("GET", 'chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/registry.js', true);
      xmlhttp.send(null);
    } catch(e) {
      console.log('ex');
      console.log(e);
    }
    var s = document.createElement('script');
    s.src = 'chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo/registry.js';
    document.body.appendChild(s);

    setTimeout(function() {
      if ($.type(window.Registry) !== 'undefined') {
        callback('Tampermonkey');
      }
    }, 500);
  },

  panel_extension_notify: function(type) {
    if(confirm('ВНИМАНИЕ! Мы обнаружили что у вас установлен ' + type + '.\n\n\
AJAX - технология, при которой страница не перегружается полностью, а обновляется только её часть.\n\n\
Благодаря этому переходы между страницами осуществляются заметно быстрее, но скрипты, установленные через Greasemonkey не смогут работать при таких переходах.\n\
Чтобы увидеть результат работы скрипта вы можете нажать F5 на нужной странице, либо вы можете полностью отключить AJAX и всё будет работать как прежде.\n\n\
Продолжить использование AJAX? Если вы нажмёте "нет", то AJAX будет отключен.\n\
(Вы сможете включить AJAX позже в настройках, в разделе "Модули")')) {
    } else {
      var current_options = panel.getOptions();
      current_options.blacklist.push('panel_ajaxify');
      panel.setOptions(options);
    }
    /// ставим куку чтобы больше не спрашивать
    var myDate = new Date();
    myDate.setMonth(myDate.getMonth() + 120);
    document.cookie = "gwp2_n=1;expires=" + myDate + ";domain=.ganjawars.ru;path=/";
  }
});
})(__panel, jQuery);