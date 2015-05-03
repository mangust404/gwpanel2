(function(panel, $) {
  var mmoves = {};
  var mlinks = {};
  var keys = {};

  function keydown(e) {
    switch(e.keyCode) {
      case 37: case 65: keys['left'] = true; return false;
      case 38: case 87: keys['up'] = true; return false;
      case 39: case 68: keys['right'] = true; return false;
      case 40: case 83: keys['down'] = true; return false;
      default: break;
    };
  }
  function keyup(e) {
    if(!$(document.body).hasClass('ferma-php')) return;
    switch(e.keyCode) {
      case 37: case 65: keys['left'] = true; break;
      case 38: case 87: keys['up'] = true; break;
      case 39: case 68: keys['right'] = true; break;
      case 40: case 83: keys['down'] = true; break;
      case 13: keys['center'] = true; break;
      case 32:           keys['space'] = true; break;
      default: break;
    };
    var __goto;
    if(keys['left'] && keys['up'] && mlinks['topleft']) {
      __goto = mlinks['topleft'];
    } else if(keys['right'] && keys['up'] && mlinks['topright']) {
      __goto = mlinks['topright'];
    } else if(keys['left'] && keys['down'] && mlinks['bottomleft']) {
      __goto = mlinks['bottomleft'];
    } else if(keys['right'] && keys['down'] && mlinks['bottomright']) {
      __goto = mlinks['bottomright'];
    } else if(keys['left'] && mlinks['left']) {
      __goto = mlinks['left'];
    } else if(keys['right'] && mlinks['right']) {
      __goto = mlinks['right'];
    } else if(keys['up'] && mlinks['top']) {
      __goto = mlinks['top'];
    } else if(keys['down'] && mlinks['bottom']) {
      __goto = mlinks['bottom'];
    } else if(keys['center']) {
      if($('input[value="Посадить везде"]').length) {
        $('input[value="Посадить везде"]').click();
        mlinks = {};
        return false;
      } else if($('input[value="Посадить"]').length) {
        $('input[value="Посадить"]').click();
        mlinks = {};
        return false;
      } else {
        __goto = $('a:contains("Собрать весь урожай"), \
                    a:contains("Вскопать"), a:contains("Собрать урожай"), \
                    a:contains("Полить"), \
                    a:contains("Покормить")').last();
      }
    } else if(keys['space']) {
      __goto = $('td:contains("Ближайшее действие")').find('a');
    }

    if(__goto && __goto.length) {
      mlinks = {};
      $(window).off('keyup').off('keydown');
      panel.gotoHref(__goto.attr('href'));
      return false;
    }

    keys = {};
  }

jQuery.extend(__panel, {

  ferma_hotkeys: function() {
    mmoves = {};
    mlinks = {};
    var matches = $('img[src$="point2.gif"]').closest('a').attr('href').match(/x=([0-9]+)&y=([0-9]+)/);
    var x = parseInt(matches[1]);
    var y = parseInt(matches[2]);
    if(x > 0) {
      mlinks['left'] = $('a[href*="x=' + (x - 1) + '&y=' + y + '"]');
      if(y > 0) {
        mlinks['topleft'] = $('a[href*="x=' + (x - 1) + '&y=' + (y - 1) + '"]');
      }
      if(y < 6) {
        mlinks['bottomleft'] = $('a[href*="x=' + (x - 1) + '&y=' + (y + 1) + '"]');
      }
    }
    if(x < 6) {
      mlinks['right'] = $('a[href*="x=' + (x + 1) + '&y=' + y + '"]');
      if(y > 0) {
        mlinks['topright'] = $('a[href*="x=' + (x + 1) + '&y=' + (y - 1) + '"]');
      }
      if(y < 6) {
        mlinks['bottomright'] = $('a[href*="x=' + (x + 1) + '&y=' + (y + 1) + '"]');
      }
    }
    if(y > 0) {
      mlinks['top'] = $('a[href*="x=' + x + '&y=' + (y - 1) + '"]');
    }
    if(y < 6) {
      mlinks['bottom'] = $('a[href*="x=' + x + '&y=' + (y + 1) + '"]');
    }

    $(window).focus();

    keys = {};
    $(window).off('keydown').on('keydown', keydown)
    .off('keyup').on('keyup', keyup);

    panel.onunload(function() {
      $(window).off('keydown', keydown)
        .off('keyup', keyup);
    });
    panel.get('ferma_hide_hint', function(hide) {
      var $right_td = $($('table[background$="ferma_bg.jpg"]').parents('table').eq(1).get(0).rows[0].cells[1]);
      $right_td.css({position: 'relative', 'padding-bottom': 40});
      var $hint = $('<div class="hint"></div>')
        .css({
          position: 'absolute',
          padding: '5px 10px',
          border: '1px dotted #040',
          opacity: '0.5',
          bottom: 0,
          left: 6,
          right: 0
        })
      .html('<h4 style="margin: 5px 0;">Горячие клавиши</h4>\
<p><b>Стрелки</b> &larr;&uarr;&rarr;&darr; &ndash; переход между грядками</p>\
<p><b>Пробел</b> &ndash; переход к &laquo;Ближайшему действию&raquo;</p>\
<p><b>Enter</b> &ndash; выполнение действия (собрать/полить/посадить)</p>')
      .appendTo($right_td);
      function hide() {
        $hint.find('*').hide().end().css({
          left: 'auto'
        });
        $hide_link.html('?').show().css({position: 'static'});
      }
      function show() {
        $hide_link.html('скрыть').show().css({position: 'absolute'});
        $hint.find('*').show();
      }
      var $hide_link = $('<a>скрыть</a>').css({
        position: 'absolute',
        right: 8,
        top: 10,
        cursor: 'pointer',
        padding: '4px 7px',
        margin: '-4px -7px',
        'font-size': 10
      }).click(function() {
        if($hide_link.html() == 'скрыть') {
          hide();
          panel.set('ferma_hide_hint', true, function() {}, true);
        } else {
          show();
          panel.set('ferma_hide_hint', false, function() {}, true);
        }
      }).appendTo($hint);
      if(hide) {
        hide();
      }
    }, true);
    
    if(document.forms[1] && document.forms[1].fermacode) {
      document.forms[1].fermacode.focus();
    }
  },

  /**
  * Сбор статистики с фермы - сколько денег собрано и сколько опыта 
  * получено за каждый день, на основании этой информации будет делаться
  * прогноз, сколько времени уйдёт на следующую клетку или следующий тип посадок
  */
  ferma_statistics: function(options) {
    if(location.search.search(/id=([0-9]+)/) > -1 && 
       RegExp.$1 != panel.currentPlayerID()) {
      /// это чужая ферма
      return;
    }
    panel.loadScript('ferma/ferma_data.js', function() {
      var $moneyDiv = $('div:contains(Счет):last');
      var $right_td = $($('table[background$="ferma_bg.jpg"]')
                          .parents('table').eq(1).get(0).rows[0].cells[1]
                       );

      var moneyAr = $moneyDiv.text().match(/Счет: \$([0-9\,]+)/);
      if(moneyAr) {
        var balanceMoney = parseInt(moneyAr[1].replace(',', ''));
      }
      var overallMoney = balanceMoney;

      panel.get('plants_index', function(plants_index) {
        plants_index = plants_index || {};

        /// Собираем информацию по посадкам по их картинкам
        var $plants = $('img[src*="/ferma/"]');
        if($plants.length > 0) {
          /// Подсчитываем сумму вместе с посадками
          $plants.each(function() {
            var img = this.src.split('ferma/')[1].split('/')[0];
            var ar = img.match(/([a-z]+)[0-9]+\.png/);
            if(ar) {
              var plantId = ar[1];
              if(panel.ferma_plants[plantId]) {
                var ar2 = $(this).parents('a').attr('href')
                            .match(/x=([0-9]+)&y=([0-9]+)/);
                if(ar2) {
                  plants_index[ar2[1]] = plants_index[ar2[1]] || {};
                  plants_index[ar2[1]][ar2[2]] = plantId;
                }
              }
            } else if(img.indexOf('ground.png') > -1) {
              /// вскопанная земля
              var ar2 = $(this).parents('a').attr('href')
                          .match(/x=([0-9]+)&y=([0-9]+)/);
              if(ar2) {
                plants_index[ar2[1]] = plants_index[ar2[1]] || {};
                plants_index[ar2[1]][ar2[2]] = '';
              }
            }
          });
        }

        /// Находим все остальные пустые клетки, и если они засажены в индексе, то убираем посадку
        $('a[href*="/ferma.php?x="] img[src*="/t.gif"]').each(function() {
          var ar = $(this).closest('a').attr('href')
                          .match(/x=([0-9]+)&y=([0-9]+)/);
          if(ar && plants_index[ar[1]] && plants_index[ar[1]][ar[2]]) {
            plants_index[ar[1]][ar[2]] = '';
          }
        });

        /// Дополнительно мы должны запомнить на какой грядке что растёт, т.к.
        /// когда происходит посадка, то там картинка seed.png, из неё не получится 
        /// вытащить название растения
        var planted = $right_td.text()
                        .match(/На этой грядке растет ([^,]+),/);
        if(planted) {
          for(plantId in panel.ferma_plants) {
            if(panel.ferma_plants[plantId].name == planted[1]) {
              var ar = $('img[src$="point2.gif"]').parents('a').attr('href')
                         .match(/x=([0-9]+)&y=([0-9]+)/);
              if(ar) {
                plants_index[ar[1]] = plants_index[ar[1]] || {};
                plants_index[ar[1]][ar[2]] = plantId;
              }
              break;
            }
          }
        }

        panel.set('plants_index', plants_index, function() {}, true);

        // И, наконец подсчитываем сумму по индексу
        for(var x in plants_index) {
          for(var y in plants_index[x]) {
            var plantId = plants_index[x][y];
            if(plantId && panel.ferma_plants[plantId].profit) {
              overallMoney += panel.ferma_plants[plantId].profit;
            }
          }
        }
        $moneyDiv.before(
          $('<div class="ferma-overall">С посадками: <b>' + panel.convertingIntToMoney(overallMoney) + 
            '</b></div>')
            .css({
              position: 'absolute',
              opacity: 0.4
            })
            .attr({
              title: 'Сколько денег у вас будет после сбора всего урожая'
            })
        );
        if($('div:contains(в схроне)').length > 0) {
          $('.ferma-overall').css({margin: '30px 0 0 5px'});
        }

        function initProfit(profit) {
          var result = profit || {
                  money: 0,
                  exp: 0,
                  startExp: 0,
                  startMoney: overallMoney,
                  totalMoney: 0,
                  totalExp: 0,
                  cashout: 0
                };
          result.cashout = result.cashout || 0;
          result.startMoney = result.startMoney || overallMoney;
          return result;
        }

        if(location.search.indexOf('action=extract') > -1) {
          /// Сбор урожая
          $gathered = $('center:contains("Вы собрали"):last').parent();
          if($gathered.length > 0) {
            var text = $gathered.text();
            var name = text.split('Вы собрали ')[1].split('+')[0];
            var ar = text.match(/\+\$([0-9]+), \+([0-9\.]+) производственного/);
            var __money = parseInt(ar[1]);
            var __exp = parseFloat(ar[2]);

            var plant;
            $.each(panel.ferma_plants, function(id, __plant) {
              if(__plant.name == name || 
                  // название может склоняться, пытаемся сравнить по деньгам
                  (__money == __plant.profit)
                ) {
                plant = __plant;
              }
            });
            if(!plant) {
              console.log('Тип растений не найден, считаем опыт и деньги');
              //return;
              var money = 0;
            } else {
              var money = parseInt(plant.profit - plant.price);
            }
            var exp = __exp; //parseFloat(plant.exp);
            var now = new Date;
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);

            panel.get('ferma_profit_' + now.getTime(), function(profit) {
              profit = initProfit(profit);
              profit.money += money;
              profit.exp += exp;
              if(profit.totalMoney > 0) {
                profit.totalMoney = overallMoney;
              }
              panel.set('ferma_profit_' + now.getTime(), profit, function() {}, true);
              if(!profit.totalMoney) {
                // Начинается новый день, и машины туда-сюда, высчитываем разницу
                // за предыдущий день если есть записи за позапрошлый
                now.setDate(now.getDate() - 2);
                panel.get('ferma_profit_' + now.getTime(), function(profit_before_y) {
                  profit_before_y = initProfit(profit_before_y);
                  now.setDate(now.getDate() + 1);
                  panel.get('ferma_profit_' + now.getTime(), function(profit_yesterday) {
                    profit_yesterday = initProfit(profit_yesterday);
                    if(profit_before_y.totalMoney < profit_yesterday.totalMoney && 
                       profit_yesterday.money > profit_yesterday.totalMoney - profit_before_y.totalMoney
                       ) {
                      /// деньги не снимались, мы можем вычислить разницу
                      profit_yesterday.money = profit_yesterday.totalMoney - profit_before_y.totalMoney;
                    }
                    if(profit_before_y.totalExp && profit_yesterday.totalExp) {
                      profit_yesterday.exp = profit_yesterday.totalExp - profit_before_y.totalExp;
                    }
                    panel.set('ferma_profit_' + now.getTime(), profit_yesterday, function() {}, true);
                  }, true);
                }, true);
              }
            }, true);
          }
        } else {
          var __now = new Date;
          __now.setHours(0);
          __now.setMinutes(0);
          __now.setSeconds(0);
          __now.setMilliseconds(0);
          // Поскольку сбор с грядок может производиться из двух разных мест, то
          // следим ещё за строкой "На счете фермы" 
          if($('form[action="/ferma.php"]').length) {
            $balance = $('td:contains("На счете фермы"):last');

            var ar = $balance.text().match(/На счете фермы \$([0-9]+), получен опыт ([0-9\.]+) ед/);
            if(ar) {
              panel.get('ferma_profit_' + __now.getTime(), function(profit) {
                profit = initProfit(profit);
                profit.totalMoney = overallMoney;
                profit.totalExp = parseFloat(ar[2]);
                if(!profit.startExp) {
                  profit.startExp = profit.totalExp;
                }
                panel.set('ferma_profit_' + __now.getTime(), profit, function() {}, true);
              }, true);
            }
          } else if(moneyAr) {
            // парсим деньги 
            var totalMoney = parseInt(moneyAr[1].replace(',', ''));
            panel.get('ferma_profit_' + __now.getTime(), function(profit) {
              profit = initProfit(profit);
              if(profit && profit.totalMoney > overallMoney) {
                /// со счёта были сняты деньги, не учитываем их в рассчётах
                profit.cashout = profit.cashout - (profit.totalMoney - overallMoney);
                profit.totalMoney = overallMoney;
                panel.set('ferma_profit_' + __now.getTime(), profit, function() {}, true);
              } else if(profit.totalMoney != overallMoney) {
                /// просто обновляем счёт
                profit.totalMoney = overallMoney;
                panel.set('ferma_profit_' + __now.getTime(), profit, function() {}, true);
              }
            }, true);
          }
        }

        // Выводим статистику справа
        var now = new Date;
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        var i = 0;
        var days = ['сегодня', 'вчера', 'позавчера'];

        var $element = $right_td;
        var prev_profit;

        function drawDay(date) {
          panel.get('ferma_profit_' + date.getTime(), function(profit) {
            if(profit) {
              var date_name = days[i];
              if(!date_name) date_name = date.getDate() + '.' + (date.getMonth() + 1);
              var money = 0;
              var exp = 0;
              if(prev_profit) {
                money = parseInt(prev_profit.startMoney) - parseInt(profit.startMoney) + parseInt(prev_profit.cashout);
                exp = parseFloat(prev_profit.totalExp) - parseFloat(profit.totalExp);
              }
              if(!money || money < 0 || money > 20000) {
                money = profit.money;
              }
              if(!exp || exp < 0 || exp > 1000) {
                exp = parseFloat(profit.exp);
              }
              exp = Math.round(exp * 100) / 100;
              var $item = $('<p>Прибыль за ' + date_name + ': $' + 
               money + ', ' + exp + ' ед.</p>').appendTo($element);
              if(i == 0) {
                $('<span>+</span>').css({
                  display: 'inline-block',
                  padding: '2px 4px 4px',
                  border: '1px dotted #040',
                  cursor: 'pointer',
                  'margin-left': 10
                }).click(function() {
                  if($('#profit-history').is(':visible')) {
                    $(this).html('+');
                  } else {
                    $(this).html('&ndash;');
                  }
                  $('#profit-history').slideToggle();
                }).appendTo($item);
                /// Первой выводим данные за сегодняшний день, остальные подкатом
                $element = $('<div id="profit-history">').css({
                    background: '#fff',
                    padding: '5px 10px',
                    border: '1px dotted #000'
                  })
                  .hide().insertAfter($item);
              }
              i++;
              if(i > 7) {
                $('<p>Важно! Значения могут не совпадать с действительными, ' + 
                      'особенно если вы играете с нескольких компьютеров, ' + 
                      'или производите сложные манипуляции со счётом фермы.<br />' + 
                      'Прибыль "за сегодня" отображает только урожай, собранный ' + 
                      'на этом браузере, полная сумма будет высчитана только на ' + 
                      'следующий день</p>')
                  .css({
                    'font-size': '9px',
                    opacity: 0.8,
                    'margin-top': 30
                  })
                  .appendTo($element);
                return;
              }
              date.setDate(now.getDate() - 1);

              prev_profit = profit;
              drawDay(date);
            }
          }, true);
        }
        drawDay(now);
      }, true);
    });
  },

  ferma_widget_update: function() {
    panel.loadScript('ferma/ferma_parser.js', function() {
      panel.ferma_action_parser(function(data) {
        panel.setCached(panel.ferma_action_parser, data, function() {
          /*$('.ferma_ferma_timer').each(function() {
            panel.ferma_timer_widget.apply($(this), [data]);
          });*/
          panel.triggerEvent('ferma_data', data);
        });
      }, $(document.body));
    });
  }
  
})
})(__panel, jQuery);