(function(panel, $) {
  function distance(sector1, sector2) {
    var ar1 = sector1.split('x');
    var ar2 = sector2.split('x');
    return Math.sqrt(Math.pow(ar1[0] - ar2[0], 2) + Math.pow(ar1[1] - ar2[1], 2));
  }

  function closestPort(current_sector) {
    var min_sector;
    var min_distance = 20;
    $.each(panel.map_ports, function(port_sector, port_data) {
      var d = distance(current_sector, port_sector);
      if(d < min_distance) {
        min_distance = d;
        min_sector = port_sector;
      }
    });
    return panel.map_ports[min_sector].sector;
  }

jQuery.extend(panel, {
  // функция для базовой кнопки - переход по ссылке
  map_gohome: function(options) {
    if(options.sector) {
      panel.get('map_sector', function(sector) {
        if(sector == options.sector) {
          panel.gotoHref('http://www.ganjawars.ru/me/');
        } else {
          panel.set('moveHref', 'http://www.ganjawars.ru/me/', function() {
            panel.set('moveDest', 'Домашняя страничка', function() {
              panel.gotoHref('http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + options.sector);
            });
          });
        }
      });
    } else {
      alert('Не указан домашний сектор');
    }
  },

  map_goport: function(options) {
    panel.loadScript('map/map_sectors.js', function() {
      panel.get('map_sector', function(current_sector) {
        var port = options.sector;
        if(!port) {
          port_id = closestPort(current_sector);
          for(var sector in panel.map_ports) {
            if(panel.map_ports[sector].sector == port_id) {
              port = sector;
              break;
            }
          }
          if(!port) {
            alert('Не удалось найти ближайший порт');
            return;
          }
        }
        var port_href = 'http://www.ganjawars.ru/object.php?id=' + panel.map_ports[port].id;
        if(current_sector == port) {
          panel.gotoHref(port_href);
        } else {
          panel.set('moveHref', port_href, function() {
            panel.set('moveDest', 'Порт в ' + panel.map_ports[port].name, function() {
              panel.gotoHref('http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + port);
            });
          });
        }
      });
    });
  },

  map_goout: function(options) {
    panel.loadScript('map/map_sectors.js', function() {
      panel.get('map_sector', function(sector) {
        var port = options.port;
        if(isNaN(port)) {
          port = closestPort(sector);
          if(isNaN(port)) {
            alert('Не удалось найти ближайший порт');
            return;
          }
        }
        /// если мы уже в портовом секторе
        if($.type(panel.map_ports[sector]) != 'undefined' && 
            panel.map_ports[sector].sector > 0) {
          panel.gotoHref('http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=12&sectorout=' + panel.map_ports[sector].sector + '&confirm=1');
          return;
        }
        var port_href;
        for(var key in panel.map_ports) {
          if(panel.map_ports[key].sector == port) {
            port_href = 'http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + key;
            break;
          }
        }
        if(panel.map_ports[sector] && panel.map_ports[sector].sector == port) {
          panel.gotoHref('http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=12&sectorout=' + port + '&confirm=1');
        } else {
          panel.set('moveHref', 'http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=12&sectorout=' + port + '&confirm=1', function() {
            panel.set('moveDest', 'Ejection Point', function() {
              panel.gotoHref(port_href);
            });
          });
        }
      });
    });
  },
  
  map_gooverlord: function(options) {
    panel.loadScript('map/map_sectors.js', function() {
      panel.get('map_sector', function(sector) {
        var port = options.port;
        if(isNaN(port)) {
          port = closestPort(sector);
          if(isNaN(port)) {
            alert('Не удалось найти ближайший порт');
            return;
          }
        }
        /// если мы уже в портовом секторе
        if($.type(panel.map_ports[sector]) != 'undefined' && 
            panel.map_ports[sector].sector > 0) {
          panel.gotoHref('http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=13&sectorout=' + panel.map_ports[sector].sector + '&confirm=1');
          return;
        }
        var port_href;
        for(var key in panel.map_ports) {
          if(panel.map_ports[key].sector == port) {
            port_href = 'http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + key;
            break;
          }
        }
        if(panel.map_ports[sector] && panel.map_ports[sector].sector == port) {
          panel.gotoHref('http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=13&sectorout=' + port + '&confirm=1');
        } else {
          panel.set('moveHref', 'http://www.ganjawars.ru/map.move.php?seaway=1&sectorin=13&sectorout=' + port + '&confirm=1', function() {
            panel.set('moveDest', 'Overlord', function() {
              panel.gotoHref(port_href);
            });
          });
        }
      });
    });
  },

  map_seaside: function(options) {
    panel.get('map_sector', function(sector) {
      var seasideSector;
      /// определяем остров с прибрежкой
      var ar = sector.split('x');
      var x = parseInt(ar);
      if(x < 154 && x > 145) {
        /// Z-lands, surfear
        seasideSector = '149x151';
      } else if(x > 40 && x < 60) {
        /// Ganja island, green parks
        seasideSector = '52x50';
      }

      if(seasideSector) {
        if(sector == seasideSector) {
          panel.gotoHref('http://quest.ganjawars.ru/walk.php');
        } else {
          panel.set('moveHref', 'http://quest.ganjawars.ru/walk.p.php', function() {
            panel.set('moveDest', 'Прибрежная зона', function() {
              panel.gotoHref('http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + seasideSector);
            });
          });
        }
      } else {
        alert('На этом острове нет прибрежной зоны :-(');
      }
    });
  },

  map_custom: function(options) {
    panel.get('map_sector', function(sector) {
      if(options.sector) {
        if(sector == options.sector) {
          panel.gotoHref(options.link);
        } else {
          panel.set('moveHref', options.link, function() {
            panel.set('moveDest', '', function() {
              panel.gotoHref('http://www.ganjawars.ru/map.move.php?gps=1&sxy=' + options.sector);
            });
          });
        }
      } else {
        alert('Не указан сектор для перехода');
      }
    });
  }
});
})(window.__panel, jQuery);