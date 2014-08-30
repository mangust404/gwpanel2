(function(panel) {
jQuery.extend(panel, {
  map_mmupdate: function(event) {
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
      jQuery('#mmdiv').html(__panel.map_formatTime(timeleft));
    };
    
    __panel.get('moveHref', function(moveHref) {
      if(moveHref && moveHref.length) {
        __panel.get('moveDest', function(moveDest) {
          jQuery(document.body).append('<center>Пункт назначения: ' + moveDest + '</center>');
        });
        jQuery(document.body).append('<center>Ссылка возврата: ' + moveHref + '</center>');
        window.BattleRefreshChat = function() {
          jQuery.ajax(location.pathname.substr(1), {
            success: function() {
              __panel.set('moveHref', 0);
              location.href = moveHref;
            }
          });
        };
      }
    });
    __panel.loadScript('map/map_sectors.js', function() {
      if(document.body.innerHTML.match(/в <nobr><b>([^<]+)<\/b>/)) {
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
    if(document.body.innerHTML.match(/Район: <a href=['"]*\/map\.php\?sx=([0-9]+)[^=]+sy=([0-9]+)/)) {
      //alert(RegExp.$1 + 'x' + RegExp.$2);
      __panel.set('map_sector', RegExp.$1 + 'x' + RegExp.$2);
    }
  },
  
  map_formatTime: function(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s - h * 3600) / 60);
    var s = s - h * 3600 - m * 60;
    return (h > 0? (h < 9? '0' + h: h) + ':': '') + (m < 10? '0' + m: m) + ':' + (s < 10? '0' + s: s);
  },
  
  map_links: function() {
    for(var i = 0; i < document.links.length; i++) {
      var link = document.links[i];
      if(link.href.indexOf('http://www.ganjawars.ru/map.php?sx=') != -1) {
        var matches = link.href.match(/sx=([0-9]+)&sy=([0-9]+)$/);
        if(!matches) continue;
        var a = jQuery('<a title="Перейти в этот сектор">[&raquo;]</a>')
          .css({'margin-left': '5px'})
          .attr('href', 'http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + matches[1] + 'x' + matches[2])
          .click(function() {
            //Запоминаем текущую страницу, чтобы по окончании пути на неё вернуться
            __panel.set('moveHref', location.href);
            __panel.gotoHref(this.href);
            return false;
          });
        if(location.pathname == '/statlist.php')
          a.appendTo(link.parentNode);
        else 
          jQuery(link).after(a);
//         var a = document.createElement('a');
//         
//         a.innerHTML = '[&raquo;]';
//         a.title = 'Перейти в этот сектор';
//         a.style.margin = '0 0 0 5px';
//         a.href = 'http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + matches[1] + 'x' + matches[2];
//         Event.observe(a, 'click', function() {
//           this.sendMessage('a', 'moveHref', document.location.href);
//         }.bind(this));
//         if(document.location.pathname == '/statlist.php')
//           link.parentNode.appendChild(a);
//         else
//           link.parentNode.insertBefore(a, link.nextSibling);
      };
    };
  }
  
});
})(window.__panel);