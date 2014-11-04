(function(panel, $) {
jQuery.extend(panel, {
  map_mmupdate: function(event) {
    if($('table[background*="/i/map"]').length > 0) {
      panel.showFlash('Ошибка! Скорее всего у вас нет GPS-навигатора и ваш транспорт не оборудован им, либо вы в заявке на бой.');
    }
    //Перезаписываем функцию игры для обновления таймера при передвижении по секторам
    window.mmupdate = function() {
      if (window.mmtimer>=0) clearTimeout(window.mmtimer);
      window.mmtimer = setTimeout('mmupdate()',1000);
      if(!window.arriveTime) {
        var d = new Date;
        window.arriveTime = parseInt(d.getTime() / 1000) + timeleft - 1;
      };
      var d = new Date;
      window.timeleft = window.arriveTime - parseInt(d.getTime() / 1000);
      if (window.timeleft<0) window.timeleft=0;
      $('#mmdiv').html(__panel.map_formatTime(timeleft));
    };
    
    __panel.get('moveHref', function(moveHref) {
      if(moveHref && moveHref.length) {
        if($('#gw-content').length) {
          var $target = $('#gw-content');
        } else {
          var $target = $(document.body);
        }
        __panel.get('moveDest', function(moveDest) {
          if(moveDest) {
            $target.append('<center>Пункт назначения: ' + moveDest + '</center>');
          }
        });
        if(moveHref) {
          $target.append('<center>Ссылка возврата: ' + moveHref + '</center>');
        }
        window.BattleRefreshChat = function() {
          $.ajax(location.pathname.substr(1), {
            success: function() {
              __panel.set('moveHref', 0);
              location.href = moveHref;
            }
          });
        };
      }
    });
    __panel.loadScript('map/map_sectors.js', function() {
      if($(document.body).html().match(/в <nobr><b>([^<]+)<\/b>/)) {
        var sector = RegExp.$1;
        for(var key in __panel.map_names) {
          if(__panel.map_names[key] == sector) {
            __panel.set('map_sector', key);
            break;
          }
        }
      }
    });
    
  },
  
  map_sector: function() {
    $(function() {
      if($(document.body).html().match(/Район: <a href=['"]*\/map\.php\?sx=([0-9]+)[^=]+sy=([0-9]+)/)) {
        //alert(RegExp.$1 + 'x' + RegExp.$2);
        __panel.set('map_sector', RegExp.$1 + 'x' + RegExp.$2);
      }
    });
  },
  
  map_formatTime: function(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s - h * 3600) / 60);
    var s = s - h * 3600 - m * 60;
    return (h > 0? (h < 9? '0' + h: h) + ':': '') + (m < 10? '0' + m: m) + ':' + (s < 10? '0' + s: s);
  },
  
  map_links: function() {
    $('a[href*="map.php?sx="]:not(.fast-move):visible').filter(function() {
      if($(this).parents('.pane').length > 0) return false;
      return true;
    }).addClass('fast-move').addClass('ajax').each(function() {
      var matches = $(this).attr('href').match(/sx=([0-9]+)&sy=([0-9]+)$/);
      if(!matches) return;
      var $a = $('<a>[&raquo;]</a>', {
        title: 'Перейти в этот сектор'
      }).attr('href', 'http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + matches[1] + 'x' + matches[2])
      .css({
        'margin-left': '5px',

      }).click(function() {
        var href = this.href;
        //Запоминаем текущую страницу, чтобы по окончании пути на неё вернуться
        __panel.set('moveHref', location.href, function() {
          __panel.gotoHref(href);
        });
        return false;
      });

      if(location.pathname == '/statlist.php')
        a.appendTo(this.parentNode);
      else 
        $(this).after($a);
    });
  },

  map_current_sector_parser: function() {

  },

  map_current_sector_name: function() {
    
  }
  
});
})(window.__panel, jQuery);