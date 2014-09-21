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
              __panel.triggerEvent('npc_timer', {type: data.timer, id: data.id, timeout: data.timeout});
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
              __panel.triggerEvent('npc_timer', {type: data.timer, id: data.id, timeout: data.timeout});
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
    __panel.loadCSS('npc/npc_widget.css');
    this.addClass('npc-widget');
    var $table = jQuery('<table></table>').appendTo(this);
    var $that = this;
    __panel.loadScript('npc/npc_list.js', function() {
      jQuery(__panel.npc_list_island[type]).map(function() {
        var id = this.id;
        var name = this.name;
        
        var npcMoveFunc = function(e) {
          var href = this.href;
          var npclochref = $that.find('.npc' + id + 'loc a:last').attr('href');
          var ar = npclochref.split('=');
          var npcloc = ar[ar.length - 1];
          __panel.get('map_sector', function(sector) {
            if(sector == npcloc) { // Мы уже в нужном районе, переходим по ссылке
              __panel.gotoHref(href);
            } else { // переходим в нужный район
              __panel.set('moveHref', href);
              __panel.gotoHref(npclochref);
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

        $table.append(
          jQuery('<tr class="npc' + id + ' npc' + 
            (options.friends.indexOf(String(id)) == -1? '': ' friend') + 
            (options.enemies.indexOf(String(id)) == -1? '': ' enemy') + '"></tr>')
          .append(jQuery('<td></td>')
            .append('<img style="margin-right: 4px;" src="http://images.ganjawars.ru/img/synds/'
              + this.synd + '.gif" />')
            .append(jQuery('<a href="http://www.ganjawars.ru/npc.php?id=' + id + '">' + name + '</a>')
              .click(function() {
                __panel.gotoHref(this.href);
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
            .append('<span class="loc npc' + id + 'loc"></span>')
            .css({'text-align': 'right'})
          )
        );
        /// Прорисовываем таймер и всё остальное
        __panel.get('npc' + id, function(data) {
          drawTimer(data, $that);
        });
      });
    
    });
    __panel.bind('npc_update', function(data) {
      drawTimer(data, $that);
    });
    this.append(jQuery('<div class="npcupdatetime"></div>').css({'text-align': 'right'}));
    __panel.npc_requestLocations($that);
    setInterval(function() { __panel.npc_requestLocations($that)}, 1000 * 300);
  },

  npc_requestLocations: function() {
    var d = new Date;
    
    if(!npcLocationsUpdate || !__panel.npcLocations || (npcLocationsUpdate < (d.getTime() - 1000 * 300))) {
      if(__panel.npcLocations) {
        for(id in __panel.npcLocations) {
          var span = jQuery('.npc' + id + 'loc');
          if(span) {
            span.innerHTML = ''; //<img src="' + this.options.baseURL + '/modules/gwjs/themes/' + this.options.theme + '/sets/progress.gif" />';
          }
        }
      }
      __panel.npcLocations = false;
      //if(npcLocationsUpdateScript) document.body.removeElement(npcLocationsUpdateScript);
      npcLocationsUpdateScript = document.createElement('script');
      npcLocationsUpdateScript.src = 'http://gwpanel.org' + '/modules/gwjs/npc/locations.js?' + d.getTime();
      document.body.appendChild(npcLocationsUpdateScript);
    }
  },
  
  npcUpdateLocations: function() {
    npcLocationsUpdate = __panel.npcUpdateTime * 1000;
    
    var updateTime = new Date;
    updateTime.setTime(__panel.npcUpdateTime * 1000);
    var timeString = 'обновлено ' + updateTime.toLocaleString();
    
    jQuery.each(__panel.npcLocations, function(id, item) {
      var span = jQuery('.npc' + id + 'loc').html('');
      if(span.length) {
        var coords = __panel.npcLocations[id].coords.split('x');
        span.append(
          jQuery('<a href="http://www.ganjawars.ru/map.php?sx=' + coords[0] + '&sy=' + coords[1] + '">' + __panel.npcLocations[id].name + '</a>').click(function(){
            __panel.gotoHref(this.href);
            return false;
          })
          .attr('title', timeString)
        )
        .append(jQuery('<a style="margin: 0 0 0 5px;" href="http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + __panel.npcLocations[id].coords + '" title="Перейти в этот сектор">[&raquo;]</a>')
          .click(function() {
            __panel.set('moveHref', 'http://www.ganjawars.ru/npc.php?id=' + id);
            __panel.gotoHref(this.href);
            return false;
          })
        );
      }
    });
    jQuery(npcLocationsUpdateScript).remove();
    npcLocationsUpdateScript = false;
  }

});
})(window.__panel);