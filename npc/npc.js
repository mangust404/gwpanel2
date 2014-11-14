(function(panel, $) {
jQuery.extend(panel, {
  npc_getStatus: function(dtext) {
    //Парсинг статуса с НПЦ по HTML страницы
    var result = {
      status: 0,
      rejects: 0,
      succeded: 0,
      failed: 0
    };
    dtext = $(dtext).text();
    if(dtext.search(/Ваш статус:[^0-9\-]?([0-9\.\-]+)/)) result.status = parseFloat(RegExp.$1);
    if(dtext.search(/Отказов:[^0-9]?([0-9]+)/)) result.rejects = parseInt(RegExp.$1);
    if(dtext.search(/Выполнено:[^0-9]?([0-9]+) заданий/)) result.succeded = parseInt(RegExp.$1);
    if(dtext.search(/Провалено:[^0-9]?([0-9]+) заданий/)) result.failed = parseInt(RegExp.$1);
    return result;
  },
  
  npc_upd_status: function() {
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
      var href = $('a:contains(Напасть!)').attr('href');
      if(href) {
        $('a:contains(Напасть!)').html('Нападаем...').attr('href', '');
        location.href = href;
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
            __panel.set('npc' + data.id, $.extend(npcData, data));
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
        __panel.set('npc' + data.id, $.extend(npcData, data));
        __panel.triggerEvent('npc_update', npcData);
      };
    } else {
      // Данные не сохранялись, сравнивать не с чем, поэтому просто записываем их в сторадж
      __panel.set('npc' + data.id, data);
    }
  },
  
  ncp_warlog_check: function() {
    __panel.loadScript('npc/npc_list.js', function() {
      var list = [];
      var ids = [];
      $(__panel.npc_list).each(function() {
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
  
  npc_battle_end: function(id) {
    panel.currentPlayerName(function(player_name) {
      /// ищем в документе имя 
      var ex = new RegExp('Нападение ' + player_name + ' на ([^\\)]+)\\)');
      if($(document.body).text().search(ex)) {
        var npcName = RegExp.$1;
        panel.loadScript('npc/npc_list.js', function(npcList) {
          var npcId;
          for(var i = 0; i < panel.npc_list.length; i++) {
            if(panel.npc_list[i].name == npcName) {
              npcId = panel.npc_list[i].id;
              break;
            }
          }
          if(npcId > 0) {
            $.ajax('http://www.ganjawars.ru/npc.php?id=' + npcId, {
              success: function(data) {
                var __data = __panel.npc_getStatus(data);
                __data.id = npcId;
                __panel.get('npc' + npcId, function(npcData) {
                  __panel.npc_questCheck(__data, npcData);
                });
              }
            });
          }
        });
      }
    });
  },

  npc_links: function() {
    panel.get('map_sector', function(sector) {
      panel.loadScript('npc/npc_list.js', function() {
        var id = location.search.split('id=')[1].split('&')[0];
        __panel.get('npc' + id, function(data) {
          if($.type(data) == 'object' && data.status > -2) {
            var $link = $('td:contains(Район) > a[href*="map.php?sx="]:first');
            var matches = $link.attr('href').match(/sx=([0-9]+)&sy=([0-9]+)$/);
            if(!matches) return;
            $('<a>Перейти в этот сектор и начать разговор</a>')
            .attr('href', 'http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + matches[1] + 'x' + matches[2])
            .css({
              'margin-left': '5px',
              'line-height': '40px'
            }).click(function() {
              var that = this;
              //Запоминаем текущую страницу, чтобы по окончании пути на неё вернуться
              __panel.set('moveHref', location.href + '&talk=1', function() {
                __panel.gotoHref(that.href);
              });
              return false;
            }).appendTo('center:contains("Вы находитесь в другом секторе"):first');

          }
        });
      });
    });
  }
  
});
})(window.__panel, jQuery);