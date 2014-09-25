(function(panel) {
jQuery.extend(panel, {
  npc_getStatus: function(dtext) {
    //Парсинг статуса с НПЦ по HTML страницы
    var result = {
      status: 0,
      rejects: 0,
      succeded: 0,
      failed: 0
    };
    dtext = jQuery(dtext).text();
    if(dtext.search(/Ваш статус:[^0-9\-]?([0-9\.\-]+)/)) result.status = parseFloat(RegExp.$1);
    if(dtext.search(/Отказов:[^0-9]?([0-9]+)/)) result.rejects = parseInt(RegExp.$1);
    if(dtext.search(/Выполнено:[^0-9]?([0-9]+) заданий/)) result.succeded = parseInt(RegExp.$1);
    if(dtext.search(/Провалено:[^0-9]?([0-9]+) заданий/)) result.failed = parseInt(RegExp.$1);
    return result;
  },
  
  npc_updStatus: function() {
    var params = __panel.toQueryParams(window.location.search);
    
    // Считываем текущие показатели квестов на странице
    var status = __panel.npc_getStatus(document.body.innerHTML);
    status.id = params['id'];
    
    this.get('npc' + params['id'], function(npcState) {
      if(params['action_submit'] == 'yes') {
        // Соглашение на квест
        __panel.npc_questSubmit(status);
      } else if(document.body.innerHTML.indexOf('action_submit=yes') != -1) {
        // Инициализация квеста, собираем данные
        // ищем по тексту квеста время, которое отводится на выполнение
        var quest = {};
        if(document.body.innerHTML.search(/([0-9]+) минут/)) {
          quest['timelimit'] = parseInt(RegExp.$1) * 60;
        } else if(document.body.innerHTML.search(/([0-9]+) часов/)) {
          quest['timelimit'] = parseInt(RegExp.$1) * 3600;
        } else if(document.body.innerHTML.indexOf('шести часов') != -1) {
          quest['timelimit'] = 21600;
        };
        __panel.npc_questInit(status, quest);
      } else {
        __panel.npc_questCheck(status, npcState);
        if(document.body.innerHTML.match(/подождите ([0-9]+) мин/)) {
          var time = parseInt(RegExp.$1) * 60;
          if(time > 0) {
            npcState.starttime = (new Date()).getTime();
            npcState.timeout = time;
            npcState.timer = 'next_quest';
            __panel.set('npc' + npcState.id, npcState, function() {
              __panel.triggerEvent('npc_update', npcState);
            });
          }
        }
      };
    });
    
    if(params['gwpattack'] == 1) {
      var href = jQuery('a:contains(Напасть!)').attr('href');
      if(href) {
        jQuery('a:contains(Напасть!)').html('Нападаем...').attr('href', '');
        location.href = href;
      }
    }
    if(params['gwptalk'] == 1) {
      var href = jQuery('a:contains(Начать разговор)').attr('href');
      if(href && href.length) {
        jQuery('a:contains(Начать разговор)').html('Раздеваемся...:)').attr('href', '');
        jQuery.ajax('http://www.ganjawars.ru/items.php', {
          success: function(data) {
            if(data.match(/(\/home\.do\.php\?dress_off=[0-9a-z]+)/)) {
              jQuery.ajax('http://www.ganjawars.ru' + RegExp.$1, {
                success: function(data) {
                  location.href = href;
                }
              });
            }
          }
        });
      }
    }
  }, 
  
  npc_questInit: function(data, quest) {
    //__panel.setCookie('npc' + id, $H({'st': status, 'rj': rejects, 'sc': succeded, 'fa': failed}).toQueryString());
    //__panel.npc_questSetTimer(id, 300, 'quest_ansto');
    //__panel.quest_doto = to;
  },
  
  npc_questSubmit: function(data) {
    //if(isNaN(__panel.quest_doto)) return;
    //__panel.npc_questSetTimer(id, __panel.quest_doto, 'quest_doto');
    //__panel.setCookie('npc' + id, $H({'st': status, 'rj': rejects, 'sc': succeded, 'fa': failed}).toQueryString());
    //var d = new Date();
    //d.setSeconds(d.getSeconds() + __panel.quest_doto);
    //__panel.setCookie('npc' + id + 'to', d.getTime(), d);
    //__panel.setCookie('npc' + id + 't', 'quest_doto', d);
  },
  
  npc_questCheck: function(data, npcData) {
    if(npcData && typeof(npcData) == 'object') {
      if(data.rejects > npcData.rejects || data.succeded > npcData.succeded || data.failed > npcData.failed || data.status != npcData.status) {
        if(Math.round(Math.abs(data.status - npcData.status) * 100) % 6 == 0 && data.status < npcData.status) { // статус уменьшился на 0.06 в результате нападения
          var timeout = 1200;
          if(npcData.timer == 'attack' && (npcData.starttime + timeout * 1000) > (new Date).getTime()) { // если таймер уже запущен, просто сохраняем данные
            __panel.set('npc' + data.id, jQuery.extend(npcData, data));
            return;
          };
          data.timer = 'attack';
        } else {
          data.timer = 'next_quest';
          // Определяем таймаут следующего квеста по формуле
          var timeout = 14400 - data.status * 100 * 144;
          if(timeout < 7200) timeout = 7200;
        }
        data.starttime = (new Date()).getTime();
        data.timeout = timeout;
        // Запускаем таймер
        // сохраняем данные
        __panel.set('npc' + data.id, jQuery.extend(npcData, data));
        __panel.triggerEvent('npc_update', npcData);
      };
    } else {
      // Данные не сохранялись, сравнивать не с чем, поэтому просто записываем их в сторадж
      __panel.set('npc' + data.id, data);
    }
  },
  
  ncp_warlogCheck: function() {
    __panel.loadScript('npc/npc_list.js', function() {
      var list = [];
      var ids = [];
      jQuery(__panel.npc_list).each(function() {
        list.push(this.name);
        ids.push(this.id);
      });
      var matches = document.body.innerHTML.match(new RegExp(list.join('|')));
      if(matches) {
        var id = ids[list.indexOf(matches[0])];
        if(id) {
          __panel.triggerEvent('npc_battleend', id);
        }
      }
    });
    
  },
  
  npc_battleEnd: function(id) {
    jQuery.ajax('http://www.ganjawars.ru/npc.php?id=' + id, {
      success: function(data) {
        var __data = __panel.npc_getStatus(data);
        __data.id = id;
        __panel.get('npc' + id, function(npcData) {
          __panel.npc_questCheck(__data, npcData);
        });
      }
    });
  }
  
});
})(window.__panel);