(function(panel) {
  var npcLocationsUpdate, npcLocationsUpdateScript;
  var npcIntervals = {};
  
  function npc_timerFormat(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s - h * 3600) / 60);
    var s = s - h * 3600 - m * 60;
    return (h > 0? (h < 9? '0' + h: h) + ':': '') + (m < 10? '0' + m: m) + ':' + (s < 10? '0' + s: s);
  }
  
  function drawTimer(data, widget) {
    if(!data || !data.id) return;
    if(npcIntervals[data.id]) {
      clearInterval(npcIntervals[data.id]);
    }
    if(data.timer && (data.starttime + data.timeout * 1000) > (new Date).getTime()) {
      switch(data.timer) {
        case 'next_quest':
          var endTime = data.starttime + data.timeout * 1000;
          npcIntervals[data.id] = setInterval(function() {
            var now = (new Date()).getTime();
            if(endTime <= now) {
              panel.triggerEvent('npc_timer', {type: data.timer, id: data.id, timeout: data.timeout});
              clearInterval(npcIntervals[data.id]);
              widget.find('.npc' + data.id + 'timer').html('');
              return;
            }
            widget.find('.npc' + data.id + 'timer').html(npc_timerFormat(parseInt((endTime - now) / 1000))).attr('title', 'Время до следующего квеста');
          }, 1000);
          
        break;
        case 'attack':
          var endTime = data.starttime + data.timeout * 1000;
          npcIntervals[data.id] = setInterval(function() {
            var now = (new Date()).getTime();
            if(endTime <= now) {
              panel.triggerEvent('npc_timer', {type: data.timer, id: data.id, timeout: data.timeout});
              clearInterval(npcIntervals[data.id]);
              widget.find('.npc' + data.id + 'timer').html('');
              return;
            }
            widget.find('.npc' + data.id + 'timer').html(npc_timerFormat(parseInt((endTime - now) / 1000))).attr('title', 'Время до следующего нападения');
          }, 1000);
          
        break;
      }
    }
  }
  
jQuery.extend(panel, {
  // отрисовка NPC
  npc_widget: function(type, options) {
    panel.loadCSS('npc/npc_widget.css');
    this.addClass('npc-widget');
    var $table = jQuery('<table></table>').appendTo(this);
    var $that = this;
    panel.loadScript('npc/npc_list.js', function() {
      panel.getCached(function(callback) {
        // судя по всему jQuery не цепляет .load событие на скрипты с чужого домена
        var s = document.createElement('script');
        s.src = 'http://gwpanel.org/modules/gwjs/npc/locations.js?' + (new Date).getTime();
        s.addEventListener('load', function() {
          callback({npcLocations: panel.npcLocations, npcUpdateTime: panel.npcUpdateTime});
        }, false);
        document.getElementsByTagName("head")[0].appendChild(s);
      }, function(data) {
        var d = (new Date);
        d.setTime(data.npcUpdateTime * 1000);
        var timeString = 'обновлено ' + d.toLocaleString();
        jQuery(panel.npc_list_island[type]).map(function() {
          var id = this.id;
          var name = this.name;
          
          var npcMoveFunc = function(e) {
            var href = this.href;
            var npclochref = $that.find('.npc' + id + 'loc a:last').attr('href');
            var ar = npclochref.split('=');
            var npcloc = ar[ar.length - 1];
            panel.get('map_sector', function(sector) {
              if(sector == npcloc) { // Мы уже в нужном районе, переходим по ссылке
                panel.gotoHref(href);
              } else { // переходим в нужный район
                panel.set('moveHref', href);
                panel.gotoHref(npclochref);
              }
            });
            return false;
          }
          var links = jQuery('<span class="links npc' + id + 'links"></span>');
          if(options.friends.indexOf(String(id)) != -1) {
            links.append(jQuery('<a href="http://www.ganjawars.ru/npc.php?id=' + id + '&'
               + (options.undress? 'gwp': '') + 'talk=1" title="Начать разговор">\
               <img src="http://images.ganjawars.ru/i/home/friends.gif"></a>')
              .click(npcMoveFunc));
          } else if(options.enemies.indexOf(String(id)) != -1) {
            links.append(jQuery('<a href="http://www.ganjawars.ru/npc.php?id=' + id + 
              '&gwpattack=1" title="Напасть">\
              <img src="http://images.ganjawars.ru/i/home/weapon.gif"></a>')
              .click(npcMoveFunc));
            
          }

          var coords = data.npcLocations[id].coords.split('x');

          $table.append(
            jQuery('<tr class="npc' + id + ' npc' + 
              (options.friends.indexOf(String(id)) == -1? '': ' friend') + 
              (options.enemies.indexOf(String(id)) == -1? '': ' enemy') + '"></tr>')
            .append(jQuery('<td></td>')
              .append('<img style="margin-right: 4px;" src="http://images.ganjawars.ru/img/synds/'
                + this.synd + '.gif" />')
              .append(jQuery('<a href="http://www.ganjawars.ru/npc.php?id=' + id + '">' + name + '</a>')
                .click(function() {
                  panel.gotoHref(this.href);
                  return false;
                })
              )
            )
            .append(jQuery('<td></td>')
              .append(links)
            )
            .append(jQuery('<td width="60"></td>')
              .append('<span class="timer npc' + id + 'timer"></span>')
            )
            .append(jQuery('<td></td>')
              .append(jQuery('<span class="loc npc' + id + 'loc"></span>')
                .append(
                  jQuery('<a href="http://www.ganjawars.ru/map.php?sx=' + coords[0] + '&sy=' + coords[1] + '">' + data.npcLocations[id].name + '</a>').click(function(){
                    panel.gotoHref(this.href);
                    return false;
                  })
                  .attr('title', timeString)
                )                
                .append(jQuery('<a style="margin: 0 0 0 5px;" href="http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + data.npcLocations[id].coords + '" title="Перейти в этот сектор">[&raquo;]</a>')
                  .click(function() {
                    panel.set('moveHref', 'http://www.ganjawars.ru/npc.php?id=' + id);
                    panel.gotoHref(this.href);
                    return false;
                  })
                )
              )
              .css({'text-align': 'right'})
            )
          );
          /// Прорисовываем таймер и всё остальное
          panel.get('npc' + id, function(data) {
            drawTimer(data, $that);
          });
        });
      }, 300);
    });
    panel.bind('npc_update', function(data) {
      drawTimer(data, $that);
    });
    this.append(jQuery('<div class="npcupdatetime"></div>').css({'text-align': 'right'}));
  },

  /// Пустая функция для обратной совместимости со скриптом npc_list.js
  npcUpdateLocations: function() {

  }
  
});
})(window.__panel);