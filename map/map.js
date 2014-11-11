(function(panel, $) {

  function formatTime(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s - h * 3600) / 60);
    var s = s - h * 3600 - m * 60;
    return (h > 0? (h < 9? '0' + h: h) + ':': '') + (m < 10? '0' + m: m) + ':' + (s < 10? '0' + s: s);
  }
  
jQuery.extend(panel, {
  map_mmupdate: function(event) {
    if($('table[background*="/i/map"]').length > 0) {
      panel.showFlash('Ошибка! Скорее всего у вас нет GPS-навигатора и ваш транспорт не оборудован им, либо вы в заявке на бой.');
    }
    setTimeout(function() {
      //Перезаписываем функцию игры для обновления таймера при передвижении по секторам
      window.mmupdate = function() {
        if (window.mmtimer >= 0) {
          clearTimeout(window.mmtimer);
          window.mmtimer = 0;
        }
        window.mmtimer = setTimeout('mmupdate()', 1000);
        if (!window.arriveTime) {
          var d = new Date;
          window.arriveTime = parseInt(d.getTime() / 1000) + window.timeleft - 1;
        };
        var d = new Date;
        window.timeleft = window.arriveTime - parseInt(d.getTime() / 1000);
        if (window.timeleft < 0) {
          window.timeleft = 0;
          window.arriveTime = 0;
        }
        $('#mmdiv').html(formatTime(timeleft));
      };
    }, 500);

    panel.get('moveHref', function(moveHref) {

      if(moveHref && moveHref.length) {
        if($('#gw-content').length) {
          var $target = $('#gw-content');
        } else {
          var $target = $(document.body);
        }
        panel.get('moveDest', function(moveDest) {
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
              panel.set('moveHref', 0);
              panel.gotoHref(moveHref);
            }
          });
        };
      }

    });

    panel.loadScript('map/map_sectors.js', function() {

      if($(document.body).html().match(/в <nobr><b>([^<]+)<\/b>/)) {
        var sector = RegExp.$1;
        for(var key in panel.map_names) {
          if(panel.map_names[key] == sector) {
            panel.set('map_sector', key);
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
        panel.set('map_sector', RegExp.$1 + 'x' + RegExp.$2);
      }

    });
  },
  
  map_links: function() {
    $('a[href*="map.php?sx="]:not(.fast-move):visible').filter(function() {

      if($(this).parents('.pane').length > 0) return false;
      return true;

    }).addClass('fast-move').addClass('ajax').each(function() {
      var targetHref = location.href;
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
        panel.set('moveHref', targetHref, function() {
          panel.set('moveDest', null, function() {
            panel.gotoHref(href);
          });
        });
        return false;
      });

      if(location.pathname == '/statlist.php') {
        targetHref = $(this).parent().find('a[href*="/object.php"]').attr('href');
        if(targetHref.indexOf('http:') == -1) 
          targetHref = 'http://' + document.domain + targetHref;
        $a.appendTo(this.parentNode);
      } else {
        $(this).after($a);
      }

    });
  },

  map_current_sector_parser: function() {

  },

  map_current_sector_name: function() {
    
  },

  map_resources: function() {
    $('form[action*="object-transfers.php"]').each(function() {
      var formId = $(this).attr('id');
      if(formId && formId.indexOf('sellform') > -1 && this.action.value == 'sell') {
        /// форма закупки ресурсов с объекта
        var mayBuy = parseInt($(this).closest('td').prev().prev().text());
        var maySell = parseInt($(this).closest('td').next().text());
        var min = Math.min(mayBuy, maySell);
          console.log(min);

        if(min > 0) {
          var that = this.amount;
          $({value: 0}).animate({value: min}, {
            easing: 'easeOutCubic',
            step: function(val) {
              that.value = parseInt(val);
            //$('#el').text(Math.ceil(this.someValue) + "%");
            }
          });
        }
      } else if(this.amount && this.action.value == 'buy') {
        /// форма продажи ресурсов на объект
        var text = $(this).closest('tr').prev().text();
        if(text.search(/Максимум ([0-9]+) шт/)) {
          var that = this.amount;
          $({value: 0}).animate({value: RegExp.$1}, {
            easing: 'easeOutCubic',
            step: function(val) {
              that.value = parseInt(val);
            //$('#el').text(Math.ceil(this.someValue) + "%");
            }
          });
        }
      } else if(location.pathname == '/object.php' && this.action && this.action.value == 'sell') {
        /// форма продажи в магазинах
        var count = $(this).closest('td').prev().prev().text();
        if(count.search(/([0-9]+)\/([0-9]+)/g) > -1) {
          var mayBuy = Math.abs(parseInt(RegExp.$2) - parseInt(RegExp.$1));
          var maySell = parseInt($(this).closest('td').next().text());
          var min = Math.min(mayBuy, maySell);
          if(min > 0) {
            var that = this.amount;
            $({value: 0}).animate({value: min}, {
              easing: 'easeOutCubic',
              step: function(val) {
                that.value = parseInt(val);
              //$('#el').text(Math.ceil(this.someValue) + "%");
              }
            });
          }
        }
      } else if(location.pathname == '/objects-bar.php') {
        var count = $(this).closest('td').prev().prev().text();
        if(count.search(/([0-9]+)\/([0-9]+)/g) > -1) {
          var mayBuy = parseInt(RegExp.$2) - parseInt(RegExp.$1);
          var maySell = parseInt($(this).closest('td').next().text());
          var min = Math.min(mayBuy, maySell);
          if(min > 0) {
            var that = this.amount;
            $({value: 0}).animate({value: min}, {
              easing: 'easeOutCubic',
              step: function(val) {
                that.value = parseInt(val);
              //$('#el').text(Math.ceil(this.someValue) + "%");
              }
            });
          }
        }
      }
    });
  }
  
});
})(window.__panel, jQuery);