(function(panel, $) {

  var statsIndex = {};
  var savedBets = {};

  function getDateStr(date) {
    return date.getDate().toString() + '_' + (date.getMonth() + 1).toString() + '_' + date.getFullYear().toString();
  }

  function dataSum(data) {
    var sum = 0;
    for(var key in data) {
      sum += data[key];
    }
    return sum;
  }

  function fetchStatsTo(date, callback) {
    date.setHours(0); date.setMinutes(0); date.setSeconds(0); date.setMilliseconds(0);

    var result = {};
    panel.getTime(function(serverDate) {
      serverDate.setHours(0); serverDate.setMinutes(0); serverDate.setSeconds(0); serverDate.setMilliseconds(0);

      function parse(date_str) {
        if(localStorage['rouinfo_' + date_str]) {
          /// если данные есть в локалсторадже, то берём из него
          var __data = JSON.parse(localStorage['rouinfo_' + date_str] || JSON.stringify({})) || {};
          /// Если данные не за сегодня, и их количество не 144
          if(getDateStr(new Date) != date_str && dataSum(__data) < 144 && !localStorage['rouinfo_' + date_str + '_parsed']) {
            /// удаляем текущие данные из стораджа, в результате они спарсятся с сервера
            delete localStorage['rouinfo_' + date_str];
            parse(date_str);
            return;
          }
          for(var key in __data) {
            if(result[key] != undefined) {
              result[key] += __data[key];
            } else {
              result[key] = __data[key];
            }
          }
          serverDate.setDate(serverDate.getDate() - 1);
          if(serverDate.getTime() > date.getTime()) {
            parse(getDateStr(serverDate));
          }
        } else if(serverDate.getTime() >= 1427565600000) {
          // если данных нет, то берём с gwpanel.org/roulette/Y/m/
          var s = document.createElement('script');
          s.type = 'text/javascript';
          var date_ar = date_str.split('_');
          s.src = 'http://gwpanel.org/roulette/' + date_ar[2] + '/' + date_ar[1] + '/' + date_str + '.js';

          s.addEventListener('load', function() {
            for(var key in window.rouinfo) {
              if(result[key] != undefined) {
                result[key] += window.rouinfo[key];
              } else {
                result[key] = window.rouinfo[key];
              }
            }
            localStorage['rouinfo_' + date_str] = JSON.stringify(window.rouinfo);
            localStorage['rouinfo_' + date_str + '_parsed'] = Object.keys(window.rouinfo).length;
            window.rouinfo = null;
            serverDate.setDate(serverDate.getDate() - 1);
            if(serverDate.getTime() > date.getTime()) {
              parse(getDateStr(serverDate));
            }
          }, false);
          s.addEventListener('error', function() {
            callback(result);
          }, false);

          document.body.appendChild(s);
        } else {
          callback(result);
        }
      }

      parse(getDateStr(serverDate));

    });
    //roulette/2015/3/29_3_2015.js
  }

  function drawStats(currentStats) {

    var statsData = [];

    var numbersMax = 0;
    var twelveNumbersMax = 0;
    var gamesCount = 0;

    var $numbers = $('img[onclick]').map(function() {
      if(this.onclick.toString().search(/putbet\(([0-9]+)\)/) != -1) {
        var num = parseInt(RegExp.$1);
        $(this).attr('data-num', num);
        if(num > 0 && num < 37) {
          if(currentStats[num] > numbersMax) numbersMax = currentStats[num];
          if(currentStats[num] > 0) gamesCount += currentStats[num];
          var item = { img: this, count: currentStats[num]? currentStats[num]: 0, num: num};
          statsIndex[num] = item;
          statsData.push(item);
          return this;
        }
      }
    });

    /// Подсчитываем варианты
    var extraStats = {};

    var redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

    for(var key in currentStats) {
      key = parseInt(key);
      if(key > 0 && key < 37) {
        var num = 0;

        // Дюжины
        if(key < 13) {
          num = 37;
        } else if(key < 27) {
          num = 38;
        } else {
          num = 39;
        }

        if(num > 0 && parseInt(currentStats[key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats[key];
          } else {
            extraStats[num] = parseInt(currentStats[key]);
          }
        }

        var num = 0;
        // Двенадцать номеров #3, 2, 1
        switch(key % 3) {
          case 0:
            num = 40;
          break;
          case 2:
            num = 41;
          break;
          case 1:
            num = 42;
          break;
        }

        if(num > 0 && parseInt(currentStats[key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats[key];
          } else {
            extraStats[num] = parseInt(currentStats[key]);
          }
        }

        // 1-18, 19-36
        var num = 0;
        if(key < 20) {
          num = 43;
        } else {
          num = 44;
        }

        if(num > 0 && parseInt(currentStats[key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats[key];
          } else {
            extraStats[num] = parseInt(currentStats[key]);
          }
        }

        // чётное-нечётное
        var num = 0;
        if(key % 2 == 1) {
          num = 46;
        } else {
          num = 45;
        }

        if(num > 0 && parseInt(currentStats[key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats[key];
          } else {
            extraStats[num] = parseInt(currentStats[key]);
          }
        }

        // чёрное-красное
        var num = 0;
        if(redNumbers.indexOf(key) != -1) {
          num = 47;
        } else {
          num = 48;
        }

        if(num > 0 && parseInt(currentStats[key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats[key];
          } else {
            extraStats[num] = parseInt(currentStats[key]);
          }
        }
        
      }
    }

    for(var num in extraStats) {
      num = parseInt(num);
      var $img = $('img[data-num="' + num + '"]');
      if($img.length > 0) {
        statsData.push( { img: $img[0], count: extraStats[num], num: num})
      }
    }
    
    var stats = d3.select('.roulette-stat').selectAll('span').data(statsData, function(d, i) {
      return d.num + '_' + d.count;
    });

    stats.exit()
      .transition()
      .duration(500)
        .style('height', function(d) {
          return 0;
        })
      .each('end', function() {
        d3.select(this).remove();
      });

    stats
      .enter()
      .append('span')
      .style({
        display: 'block',
        position: 'absolute',
        background: '#fff',
        opacity: '0.5'
      })
      .style('width', function(d) {
        return d.img.clientWidth + 'px';
      })
      .style('height', 0)
      .style('left', function(d) {
        return d.img.offsetLeft + 'px';
      })
      .style('top', function(d) {
        return d.img.parentNode.offsetTop + 'px';
      })
      .each(function(d) {
        if(!d.img.origTitle) d.img.origTitle = d.img.title;

        d.img.title = this.title = d.img.origTitle + (d.count > 0? '. Выпало: ' + d.count + panel.pluralize(d.count, ' раз', ' раза', ' раз'): '. Пока ещё не выпадало');

        this.onclick = d.img.onclick;
        $(this).on('dblclick', function() {
          $('.mainbutton').click();
        });
        $(d.img).on('dblclick', function() {
          $('.mainbutton').click();
        })
      })
      .transition()
      .duration(500)
        .style('height', function(d) {
          if(d.num > 0 && d.num < 37) {
            return 41 * d.count / numbersMax;
          } else {
            return 41 * d.count / gamesCount;
          }
        });
    drawBets();
  }

  function drawBets() {
    var betsData = [];

    $('center:contains("Ваши ставки"):last').parent().find('.greenlightbg').each(function() {
      var betn;
      if($(this).text().search(/Число ([0-9]+)/) != -1) {
        betn = parseInt(RegExp.$1);
      } else if($(this).text().search(/(Двенадцать номеров|Дюжина|Числа|Чётное|Нечётное|Красное|Чёрное)/) != -1) {
        var $img = $('img[onclick][title*="' + $(this).text() + '"]');
        if($img.length > 0 && $img[0].onclick.toString().search(/putbet\(([0-9]+)\)/) != -1) {
          betn = parseInt(RegExp.$1);
        }
      }
      if(betn > 0) {
        betsData.push(betn);
        savedBets[betn] = panel.convertingMoneyToInt($(this).prev('td').text());
      }
    });

    //panel.set('roulette_bets', betsData);

    if(betsData.length > 0) {
      var bets = d3.select('.roulette-bets').selectAll('img').data(betsData, function(bet) {
        return bet;
      });

      bets
        .enter()
        .append('img')
        .attr('title', 'Сделана ставка')
        .attr('src', panel.path_to_theme() + '/images/ok.png')
        .style({
          display: 'block',
          position: 'absolute',
          width: '17px',
          height: '17px',
          background: 'rgba(255, 255, 255, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          'border-radius': '9px'
        })
        .style('left', function(bet) {
          return $('img[data-num="' + bet + '"]')[0].offsetLeft + 2 + 'px';
        })
        .style('top', function(bet) {
          return $('img[data-num="' + bet + '"]')[0].parentNode.offsetTop + 22 + 'px';
        })
        .each(function(bet) {
          this.onclick = $('img[data-num="' + bet + '"]')[0].onclick;
        });
    }

    panel.get('roulette_bets', function(bets) {
      if(bets && Object.keys(bets).length > 0) {
        $('<br>').insertAfter($('a.mainbutton'));
        $('<span class="mainbutton repeat-bet">Повторить ' + Object.keys(bets).length + panel.pluralize(Object.keys(bets).length, ' ставка', ' ставки', ' ставок') + ' на сумму ' + panel.convertingIntToMoney(dataSum(bets)) + '</span>').click(function() {
          bets_ar = [];
          for(var betn in bets) {
            bets_ar.push({betn: betn, bet: bets[betn]});
          }
          function makeBet() {
            var bet_data = bets_ar.pop();
            $('input[name="betn"]').val(bet_data.betn);
            $('input[name="bet"]').val(bet_data.bet);
            $('form[name="rform"]').sendForm({
              success: function(data, transport) {
                if(bets_ar.length > 0) { /// ещё есть ставки
                  var $data = $(data);
                  var $newForm = $data.find('form[name="rform"]');

                  $('form[name="rform"]').replaceWith($newForm);
                  setTimeout(makeBet, 100);
                } else {
                  panel.ajaxUpdateContent(data, location.href);
                }
              }
            });
          }
          makeBet();

        }).css({display: 'block'}).insertAfter($('a.mainbutton'));

        $('<span class="mainbutton forget-bet">Забыть запомненные ставки</span>').click(function() {
          panel.del('roulette_bets', function() {
            $('.repeat-bet, .forget-bet').remove();
            if(Object.keys(savedBets).length > 0) {
              $('<span class="mainbutton save-bet">Запомнить текущие ставки</span>').click(function() {
                panel.set('roulette_bets', savedBets, function() {
                  $('.save-bet').hide();
                });
              }).insertAfter($('a.mainbutton'));
            }
          });
        }).css({display: 'block'}).insertAfter($('.repeat-bet'));

      } else if(Object.keys(savedBets).length > 0) {
        $('<span class="mainbutton save-bet">Запомнить текущие ставки</span>').click(function() {
          panel.set('roulette_bets', savedBets, function() {
            $('.save-bet').hide();
          });
        }).css({display: 'block'}).insertAfter($('a.mainbutton'));
      }
    });

  }

jQuery.extend(__panel, {

  /**
  * Вывод статистики по рулетке
  */
  roulette_stats: function() {
    if(panel.panel_ajaxify) {
      function initRouletteForm() {
        $('a.mainbutton').click(function() {
          document.forms.rform.submit = function() {
            var prevBet = $('input[name="bet"]').val();
            $('form[name="rform"]').sendForm({
              success: function(data, transport) {
                var $data = $(data);
                var $newForm = $data.find('form[name="rform"]');

                if($newForm.length > 0 && $newForm.find('input[name="betsign"]').length > 0) {
                  $('center:contains("Ваши ставки"):last').parents('table:first').replaceWith(
                    $data.find('center:contains("Ваши ставки"):last').parents('table:first')
                  );
                  //panel.ajaxUpdateContent(data, 'http://www.ganjawars.ru/roulette.php');
                  $('form[name="rform"]').replaceWith($newForm);
                  initRouletteForm();
                  $('input[name="bet"]').val(prevBet);
                  drawBets();
                } else {
                  panel.ajaxUpdateContent(data, location.href);
                }
              }
            });
          }
          checkbet();
          return false;
        });
      }
      initRouletteForm();
    }
    panel.loadScript(['roulette/roulette_parser.js', 'lib/d3.min.js'], function() {
      panel.roulette_stat_parser(function(todayStats) {
        document.title = 'Рулетка :: ' + document.title.replace('Рулетка :: ', '');
        var $roulette = $('img[onclick]:first').parents('table').first().attr('id', 'roulette');
        if(!$('.roulette-stat').length) {
          $roulette.after('<div class="roulette-stat"></div>');
        }
        if(!$('.roulette-bets').length) {
          $roulette.after('<div class="roulette-bets"></div>');
        }
        $roulette.parent().css({
          position: 'relative'
        })
        $('.roulette-stat').css({
          position: 'absolute',
          top: 0,
          left: 0
        });

        gamesCount = 0;
        for(var key in todayStats) {
          if(todayStats[key] > 0) gamesCount += todayStats[key];
        }

        $('center:contains("Ваш счёт"):last').append('<b>За сегодня игр: ' + gamesCount + '</b>');


        var $control = $('<p class="roulette-control">').insertAfter($roulette.parents('table').first());

        var yesterdayStats, aggregatedWeekStats, aggregatedMonthStats;

        $control.append('<span>Показывать данные: </span>');
        $control.append($('<a class="ajax-href roulette-today">за сегодня</a>').click(function() {
          drawStats(todayStats);
          panel.set('roulette_mode', 'today');
        })).append($('<a class="ajax-href roulette-yesterday">за вчера</a>').click(function() {
          panel.getTime(function(serverDate) { /// Получаем время на сервере
            if(!yesterdayStats) {
              serverDate.setDate(serverDate.getDate() - 1);
              var date_str = getDateStr(serverDate);
              yesterdayStats = JSON.parse(localStorage['rouinfo_' + date_str] || JSON.stringify({})) || {};
            }
            drawStats(yesterdayStats);
          });
          panel.set('roulette_mode', 'yesterday');
        })).append($('<a class="ajax-href roulette-week">за неделю</a>').click(function() {
          panel.getTime(function(serverDate) { /// Получаем время на сервере
            if(!aggregatedWeekStats) {
              serverDate.setDate(serverDate.getDate() - 7);
              fetchStatsTo(serverDate, function(stats) {
                aggregatedWeekStats = stats;
                drawStats(aggregatedWeekStats);
              });
            } else {
              drawStats(aggregatedWeekStats);
            }
          });
          panel.set('roulette_mode', 'week');
        })).append($('<a class="ajax-href roulette-month">за 30 дней</a>').click(function() {
          panel.getTime(function(serverDate) { /// Получаем время на сервере
            if(!aggregatedMonthStats) {
              serverDate.setDate(serverDate.getDate() - 30);
              fetchStatsTo(serverDate, function(stats) {
                aggregatedMonthStats = stats;
                drawStats(aggregatedMonthStats);
              });
            } else {
              drawStats(aggregatedMonthStats);
            }
          });
          panel.set('roulette_mode', 'month');
        }));

        $control.find('a').click(function() {
          $('.roulette-control a.active').removeClass('active');
          $(this).addClass('active');
        });

        panel.get('roulette_mode', function(mode) {
          if(!mode) mode = 'today';
          $control.find('.roulette-' + mode).click();
        });

      });
    });
  },
  
})
})(__panel, jQuery);