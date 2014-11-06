(function(panel, $) {
jQuery.extend(panel, {
  // функция для базовой кнопки - переход по ссылке
  map_gohome: function(options) {
    if(options.sector) {
      __panel.get('map_sector', function(sector) {
        if(sector == options.sector) {
          __panel.gotoHref('http://www.ganjawars.ru/me/');
        } else {
          __panel.set('moveHref', 'http://www.ganjawars.ru/me/', function() {
            __panel.set('moveDest', 'Домашняя страничка', function() {
              __panel.gotoHref('http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + options.sector);
            });
          });
        }
      });
    } else {
      alert('Не указан домашний сектор');
    }
  },

  map_goport: function(options) {
    if(options.sector) {
      __panel.loadScript('map/map_sectors.js', function() {
        var port_href = 'http://www.ganjawars.ru/object.php?id=' + __panel.map_ports[options.sector].id;
        __panel.get('map_sector', function(sector) {
          if(sector == options.sector) {
            __panel.gotoHref(port_href);
          } else {
            __panel.set('moveHref', port_href, function() {
              __panel.set('moveDest', 'Порт в ' + __panel.map_ports[options.sector].name, function() {
                __panel.gotoHref('http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + options.sector);
              });
            });
          }
        });
      });
    } else {
      alert('не указан порт');
    }
  },

  map_goout: function(options) {
    if(options.port) {
      __panel.loadScript('map/map_sectors.js', function() {
        __panel.get('map_sector', function(sector) {
          var port_href;
          for(var key in __panel.map_ports) {
            if(__panel.map_ports[key].sector == options.port) {
              port_href = 'http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + key;
              break;
            }
          }
          if(__panel.map_ports[sector] && __panel.map_ports[sector].sector == options.port) {
            __panel.gotoHref('http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=12&sectorout=' + options.port + '&confirm=1');
          } else {
            __panel.set('moveHref', 'http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=12&sectorout=' + options.port + '&confirm=1', function() {
              __panel.set('moveDest', 'Ejection Point', function() {
                __panel.gotoHref(port_href);
              });
            });
          }
        });
      });
    } else {
      alert('не указан порт');
    }
  },
  
  map_gooverlord: function(options) {
    if(options.port) {
      __panel.loadScript('map/map_sectors.js', function() {
        __panel.get('map_sector', function(sector) {
          var port_href;
          for(var key in __panel.map_ports) {
            if(__panel.map_ports[key].sector == options.port) {
              port_href = 'http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + key;
              break;
            }
          }
          if(__panel.map_ports[sector] && __panel.map_ports[sector].sector == options.port) {
            __panel.gotoHref('http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=13&sectorout=' + options.port + '&confirm=1');
          } else {
            __panel.set('moveHref', 'http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=13&sectorout=' + options.port + '&confirm=1', function() {
              __panel.set('moveDest', 'Overlord', function() {
                __panel.gotoHref(port_href);
              });
            });
          }
        });
      });
    } else {
      alert('не указан порт');
    }
  }
});
})(window.__panel, jQuery);