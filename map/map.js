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
      panel.get('prevTransport', function(args) {
        var prev_transport_dress_link, prev_transport_id;
        if (args && args.length > 0) {
          prev_transport_dress_link = args[0];
          prev_transport_id = args[1];
        }

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
        if(moveHref && moveHref.indexOf('/map.php') === -1) {
          $target.append('<center>Ссылка возврата: ' + moveHref + '</center>');
        }
        window.BattleRefreshChat = function() {
          $.ajax(location.pathname.substr(1), {
            success: function() {
              panel.set('moveHref', 0, function() {

                if (prev_transport_id && prev_transport_dress_link) {
                  var prev_transport_img = '<a href="http://www.ganjawars.ru/item.php?item_id=' + 
                      prev_transport_id + '"><img src="http://images.ganjawars.ru/img/items/' + 
                      prev_transport_id + '_s.jpg" /></a>';

                  panel.loadScript('items/items_transport.js', function() {
                    // Сбрасываем возвращаемый транспорт, чтобы он больше не возвращался.
                    panel.del('prevTransport', function() {
                      panel.returnOriginalTransport([prev_transport_dress_link, prev_transport_id])
                        .then(function() {
                          panel.showFlash('Транспорт возвращён на: <br />' + prev_transport_img, 'success', 2000);
                        })
                        .then(function() {
                          // Переходим по ссылке.
                          if(moveHref && moveHref.length) {
                            panel.gotoHref(moveHref);
                          }
                          else {
                            panel.gotoHref('/map.php');
                          }
                        })
                        .catch(function(err) {
                          panel.showFlash('Не удалось сменить транспорт на<br />' + prev_transport_img + '<br />' + err, 'error', 10000);
                        });
                    });
                  });
                }
                else {
                  if(moveHref && moveHref.length) {
                    panel.gotoHref(moveHref);
                  }
                  else {
                    panel.gotoHref('/map.php');
                  }
                }
              });
            }
          });
        };
      });
    });

    panel.loadScript('map/map_sectors.js', function() {
      var m = $('center:contains(Вы находитесь в пути из)')
                .html().match(/в <nobr><b>([^<]+)<\/b>/);
      if(m) {
        var sector = m[1];
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
      var m = $('a[href*="map.php?sx="]:not(.fast-move):visible').filter(function() {
        if($(this).parent().text().indexOf('Район') > -1) return true;
        return false;
      }).attr('href').match(/sx=([0-9]+)&sy=([0-9]+)$/);

      if(m) {
        panel.set('map_sector', m[1] + 'x' + m[2]);
      }
    });
  },

  /// Подготовка к перемещению: проверка нужно ли сменить транспорт
  map_prepare_goto: function() {
    return new Promise(function(resolve, reject) {
      if (panel.getOptions().settings.map.map_links.move_item) {
        // В настройках указан транспорт для передвижения, нужно надеть его.
        var item_id = panel.getOptions().settings.map.map_links.move_item;
        var item_link = '<a href="http://www.ganjawars.ru/item.php?item_id=' +
                      item_id + '"><img src="http://images.ganjawars.ru/img/items/' +
                      item_id + '_s.jpg" /></a>';

        // Подгружаем библиотеку транспорта.
        panel.loadScript('items/items_transport.js', function() {
          // Переключаем транспорт
          panel.getSwitchTransportLink(item_id)
            .then(panel.switchTransport)
            .then(function(return_transport_args) {
              return new Promise(function(_resolve, _reject) {
                if (return_transport_args && return_transport_args[0]) {
                  panel.showFlash('Транспорт изменён на: <br />' + item_link, 'success', 2000);
                }
                else {
                  panel.showFlash('Транспорт уже надет: <br />' + item_link, 'success', 2000);
                }
                _resolve(return_transport_args);
              });
            })
            .then(function(return_transport_args) {
              return new Promise(function(_resolve, _reject) {
                if (return_transport_args && return_transport_args.length > 0) {
                  // Запоминаем транспорт, который нужно вернуть.
                  panel.set('prevTransport', return_transport_args, function() {
                    _resolve();
                  });
                }
                else {
                  _resolve();
                }
              });
            })
            .then(resolve)
            .catch(function(err) {
              panel.showFlash('Не удалось сменить транспорт: <br />' + err, 'error', 10000);
              reject();
            });
        });

      }
      else {
        // Ничего снимать-надевать не нужно, просто переходим в сектор.
        resolve();
      }

    });
  },

  map_goto_gps: function(sx, sy, targetHref) {
    if (!targetHref) {
      targetHref = location.href;
    }
    var gpsHref = 'http://www.ganjawars.ru/map.move.php?gps=1&sxy=' +sx + 'x' + sy;

    panel.map_prepare_goto().then(function() {
      return new Promise(function(resolve, reject) {
        //Запоминаем текущую страницу, чтобы по окончании пути на неё вернуться
        panel.set('moveHref', targetHref, function() {
          panel.set('moveDest', '', function() {
            panel.gotoHref(gpsHref);
            resolve();
          });
        });
      });
    })
    .catch(function(err) {
      console.log(err);
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
      .addClass('gwp-gps')
      .css({
        'margin-left': '5px',

      }).click(function() {
        this.href.match(/sxy=([0-9]+)x([0-9]+)/);
        panel.map_goto_gps(RegExp.$1, RegExp.$2, targetHref);
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

    // Также "Обрабатываем" ссылки, которые предлагает Илья для навигации
    $('a[href*="map.move.php?"]:not(.gwp-gps):visible').click(function() {
      // Кликаем по нашей ссылке.
      $(this).prev('.gwp-gps').click();
      return false;
    });
  },

  map_alter: function() {
    var gps_target, $current_sector_link, current_map_sx, current_map_sy, goto_sx, goto_sy;

    // Прикрепляемся к форме GPS-навигации на карте.
    if ($('#fgpswalk').length > 0) {
      $('#fgpswalk').parents('table').eq(0).find('input[type="submit"], button').off('click').on('click', function(e) {
        gps_target = $('#fgpswalk select[name="sxy"]').val();
        // Определяем сектор, в котором находится персонаж.
        $current_sector_link = $('a[title^="Вы находитесь в секторе"]');
        if ($current_sector_link.attr('href').match(/sx=([0-9]+)&sy=([0-9]+)/)) {
          current_map_sx = RegExp.$1;
          current_map_sy = RegExp.$2;
        }

        if (current_map_sx + 'x' + current_map_sy !== gps_target) {
          // Нужно переместиться, сектора отличаются.
          panel.map_goto_gps.apply(this, gps_target.split('x'));
        }
        else {
          panel.showFlash('Вы уже находитесь в секторе ' + $current_sector_link.text(), 'success', 2000);
        }

        return false;
      });

      // Прикрепляемся к форме перемещения стрелками.
      $('input[src$="m-nw.png"], input[src$="m-n.png"], input[src$="m-ne.png"], ' + 
          'input[src$="w.png"],  input[src$="m-e.png"], ' + 
          'input[src$="m-sw.png"], input[src$="m-s.png"], input[src$="m-se.png"]').click(function() {
        var that = this;
        // Сперва проверяем, нужно ли поменять транспорт.
        panel.map_prepare_goto().then(function() {
          if (that.form) {
            // Аяксовая отправка формы.
            that.form.submit();
          }
          else {
            // Форма была отрисована при помощи jQuery и скорее всего поломана.
            // Находим элемент формы по классу инпута
            if ($(that).attr('class').match('gwp-form-([0-9]+)-item')) {
              $('form.gwp-form-' + RegExp.$1)[0].submit();
            }
          }
        });

        return false;
      });
    }
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