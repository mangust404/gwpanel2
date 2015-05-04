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

  function fetchStatsFor(exact_date, callback, is_today) {
    exact_date.setHours(0); exact_date.setMinutes(0); exact_date.setSeconds(0); exact_date.setMilliseconds(0);
    var date_str = getDateStr(exact_date)

    var result = {
      history: {},
      summ: {},
      overall: 0
    };
    var __data;

    if(localStorage['rouinfo_' + date_str]) {
      /// если данные есть в локалсторадже, то берём из него
      var __data = JSON.parse(localStorage['rouinfo_' + date_str] || JSON.stringify({})) || {};
      if(!__data.history || (__data.overall < 144 && !localStorage['rouinfo_' + date_str + '_parsed'])) {
        __data = false;
      }
    }

    if(__data) {
      callback(__data);
    } else {
      // если данных нет, то берём с gwpanel.org/roulette/Y/m/
      var s = document.createElement('script');
      s.type = 'text/javascript';
      var date_ar = date_str.split('_');
      s.src = 'http://gwpanel.org/roulette/' + date_ar[2] + '/' + date_ar[1] + '/' + date_str + '.js?' + (new Date).getTime();

      s.addEventListener('load', function() {
        localStorage['rouinfo_' + date_str] = JSON.stringify(window.rouinfo);
        if(!is_today) {
          localStorage['rouinfo_' + date_str + '_parsed'] = window.rouinfo.overall;
        }
        $.extend(result['history'], window.rouinfo['history']);
        $.extend(result['summ'], window.rouinfo['summ']);
        result['overall'] = window.rouinfo['overall'];
        callback(result);
        window.rouinfo = null;
      }, false);
      s.addEventListener('error', function() {
        callback(result);
      }, false);

      document.body.appendChild(s);
    }
  }

  function fetchStatsTill(parse_to_date, callback) {
    parse_to_date.setHours(0); parse_to_date.setMinutes(0); parse_to_date.setSeconds(0); parse_to_date.setMilliseconds(0);

    var result = {'summ': {}, 'history': {}, 'overall': 0};
    var now;
    panel.getTime(function(serverDate) {
      serverDate.setHours(0); serverDate.setMinutes(0); serverDate.setSeconds(0); serverDate.setMilliseconds(0);
      if(!now) {
        now = new Date;
        now.setTime(serverDate.getTime());
      }

      function parse() {
        fetchStatsFor(serverDate, function(__data) {
          if(__data['overall'] > 0) {
            for(var key in __data['summ']) {
              if(result['summ'][key] != undefined) {
                result['summ'][key] += __data['summ'][key];
              } else {
                result['summ'][key] = __data['summ'][key];
              }
            }
            for(var id in __data['history']) {
              result['history'][id] = __data['history'];
            }
            result['overall'] += __data['overall'];
            serverDate.setDate(serverDate.getDate() - 1);
            if(serverDate.getTime() > parse_to_date.getTime()) {
              parse();
            } else {
              callback(result);
            }
          } else {
            callback(result);
          }
        }, now.getTime() == serverDate.getTime());
      }

      parse();

    });
  }

  function determineDozen(num) {
    if(num < 13) {
      return 37;
    } else if(num < 27) {
      return 38;
    } else {
      return 39;
    }
  }

  function determineTvelveNumber(num) {
    // Двенадцать номеров #3, 2, 1
    switch(num % 3) {
      case 0:
        return 40;
      break;
      case 2:
        return 41;
      break;
      case 1:
        return 42;
      break;
    }
  }

  // 1-18, 19-36
  function determineHalf(num) {
    if(num < 20) {
      return 43;
    } else {
      return 44;
    }    
  }

  var redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  function determineColor(num) {
    if(redNumbers.indexOf(num) != -1) {
      return 47;
    } else {
      return 48;
    }
  }

  function determineParity(num) {
    if(num % 2 == 1) {
      return 46;
    } else {
      return 45;
    }
  }

  var names = {
    '1': 'Число 1', '2': 'Число 2', '3': 'Число 3', '4': 'Число 4', '5': 'Число 5', '6': 'Число 6',
    '7': 'Число 7', '8': 'Число 8', '9': 'Число 9', '10': 'Число 10', '11': 'Число 11', '12': 'Число 12',
    '13': 'Число 13', '14': 'Число 14', '15': 'Число 15', '16': 'Число 16', '17': 'Число 17', '18': 'Число 18',
    '19': 'Число 19', '20': 'Число 20', '21': 'Число 21', '22': 'Число 22', '23': 'Число 23', '24': 'Число 24',
    '25': 'Число 25', '26': 'Число 26', '27': 'Число 27', '28': 'Число 28', '29': 'Число 29', '30': 'Число 30',
    '31': 'Число 31', '32': 'Число 32', '33': 'Число 33', '34': 'Число 34', '35': 'Число 35', '36': 'Число 36',
    '37': 'Дюжина "1-12"',
    '38': 'Дюжина 13-24',
    '39': 'Дюжина "25-36"',
    '40': 'Двенадцать номеров #3',
    '41': 'Двенадцать номеров #2',
    '42': 'Двенадцать номеров #1',
    '43': 'Числа 1-18',
    '44': 'Числа 19-36',
    '45': 'Чётное',
    '46': 'Нечётное',
    '47': 'Красное',
    '48': 'Чёрное'
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
          if(currentStats['summ'][num] > numbersMax) numbersMax = currentStats['summ'][num];
          if(currentStats['summ'][num] > 0) gamesCount += currentStats['summ'][num];
          var item = { img: this, count: currentStats['summ'][num]? currentStats['summ'][num]: 0, num: num};
          statsIndex[num] = item;
          statsData.push(item);
          return this;
        }
      }
    });

    /// Подсчитываем варианты
    var extraStats = {};

    for(var key in currentStats['summ']) {
      key = parseInt(key);
      if(key > 0 && key < 37) {
        var num = 0;

        // Дюжины
        num = determineDozen(key);

        if(num > 0 && parseInt(currentStats['summ'][key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats['summ'][key];
          } else {
            extraStats[num] = parseInt(currentStats['summ'][key]);
          }
        }

        num = determineTvelveNumber(key);

        if(num > 0 && parseInt(currentStats['summ'][key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats['summ'][key];
          } else {
            extraStats[num] = parseInt(currentStats['summ'][key]);
          }
        }

        num = determineHalf(key);

        if(num > 0 && parseInt(currentStats['summ'][key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats['summ'][key];
          } else {
            extraStats[num] = parseInt(currentStats['summ'][key]);
          }
        }

        // чётное-нечётное
        num = determineParity(key);

        if(num > 0 && parseInt(currentStats['summ'][key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats['summ'][key];
          } else {
            extraStats[num] = parseInt(currentStats['summ'][key]);
          }
        }

        // чёрное-красное
        num = determineColor(key);

        if(num > 0 && parseInt(currentStats['summ'][key]) > 0) {
          if(extraStats[num] != undefined) {
            extraStats[num] += currentStats['summ'][key];
          } else {
            extraStats[num] = parseInt(currentStats['summ'][key]);
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

    function shuffle(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    if($('.repeat-bet, .forget-bet, .save-bet, .random-bet, .labousher-bet').length > 0) return;
    var current_bets = $('center:contains(Ваши ставки)').next('table').find('tr:last').find('td:first').text();
    var bets_done = false;
    if(panel.convertingMoneyToInt(current_bets) > 0) {
      bets_done = true;
      setTimeout(function() {
        $('.repeat-bet, .forget-bet, .save-bet, .random-bet, .labousher-bet').css({
          opacity: 0.5
        });
      }, 1000);
    }

    var ar = $('td[valign=top]:contains("Максимальная сумма ставок")').text().match(/Максимальная сумма ставок: ([\$0-9,]+)/)
    var max_bet = panel.convertingMoneyToInt(ar[1]);

    $('<span class="mainbutton random-bet">Случайная ставка</span>').click(function() {
      if(bets_done) {
        console.log('Ставка уже сделана');
        return false;
      }
      var bets_ar = [];
      var ar = $('td[valign=top]:contains("Максимальная сумма ставок")').text().match(/Максимальная сумма ставок: ([\$0-9,]+)/)
      var max_bet = panel.convertingMoneyToInt(ar[1]);
      if(max_bet == 25000) {
        var ar = [{betn: 40, bet: 16666}, {betn: 41, bet: 16666}, {betn: 42, bet: 16666}];
        shuffle(ar);
        bets_ar.push(ar.pop());
        for(var key in ar) {
          ar[key].bet = 8334
        }
        shuffle(ar);
        bets_ar.push(ar.pop());
        //bets_ar.push(ar.pop());
      } else if(max_bet == 15000) {
        var ar = [{betn: 40, bet: 10334}, {betn: 41, bet: 10334}, {betn: 42, bet: 10334}];
        shuffle(ar);
        bets_ar.push(ar.pop());
        for(var key in ar) {
          ar[key].bet = 4666;
        }
        shuffle(ar);
        bets_ar.push(ar.pop());
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
    
    function labousher_draw(prev_bet) {
      if(!prev_bet) return;

      if(localStorage['roulette_labousher']) {
        labousher = JSON.parse(localStorage['roulette_labousher']);
      } else {
        labousher = [];
      }

      if(prev_bet.bets > 0 && prev_bet.won == 0) {
        /// Мы проиграли в предыдущий раз, добавляем ставку в конец
        if(prev_bet.bets > max_bet / 2) {
          /// предыдущая ставка слишком большая, бьём её
          var small_part = parseInt(prev_bet.bets / 100) * 100;
          var big_part = prev_bet.bets - small_part;
          // меньшее - в конец
          labousher.push(small_part);
          // большее - в середину
          labousher.splice(labousher.length / 2, 0, big_part);
        } else {
          labousher.push(prev_bet.bets);
        }
      } else if(prev_bet.bets > 0 && prev_bet.won > prev_bet.bets) {
        /// Мы выиграли, удаляем первую и последнюю ставку
        labousher.pop();
        labousher.shift();
      }

      if(!labousher.length) {
        labousher = [];
        var step = parseInt(max_bet / 50);
        labousher.push(1 * step);
        labousher.push(2 * step);
        labousher.push(3 * step);
        labousher.push(4 * step);
        labousher = shuffle(labousher);
        localStorage['roulette_labousher'] = JSON.stringify(labousher);
      }

      $('<span class="mainbutton labousher-bet">Ставка Лабушер<br /> (' + labousher.join(', ') + ')</span>').click(function() {
        if(bets_done) {
          console.log('Ставка уже сделана');
          return false;
        }
        var bets_ar = [];

        var labousher_summ = labousher[0] + labousher[labousher.length - 1];
        var bets_50_percent = [43, 45, 48, 47, 46, 44];
        bets_50_percent = shuffle(bets_50_percent);
        bets_ar.push({betn: bets_50_percent.pop(), bet: labousher_summ});

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
    }

    var last_id = 0;
    $('a[href*="rouinfo.php"]:first').each(function() {
      last_id = parseInt(this.href.split('id=')[1]);
    });

    if(last_id > 0) {
      if(sessionStorage['bet_history_' + last_id]) {
        labousher_draw(JSON.parse(sessionStorage['bet_history_' + last_id]));
      } else {
        panel.loadScript('roulette/roulette_parser.js', function() {
          panel.roulette_stat_parser(function() {
            console.log(last_id, sessionStorage['bet_history_' + last_id]);
            if(sessionStorage['bet_history_' + last_id]) {
              labousher_draw(JSON.parse(sessionStorage['bet_history_' + last_id]));
            } 
          }, $(document.body));
        });
      }
    }

    panel.get('roulette_bets', function(bets) {
      if(bets && Object.keys(bets).length > 0) {
        $('<br>').insertAfter($('a.mainbutton'));
        $('<span class="mainbutton repeat-bet">Повторить ' + Object.keys(bets).length + panel.pluralize(Object.keys(bets).length, ' ставка', ' ставки', ' ставок') + ' на сумму ' + panel.convertingIntToMoney(dataSum(bets)) + '</span>').click(function() {
          if(bets_done) {
            console.log('Ставка уже сделана');
            return false;
          }
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

        var $last_game = $('a:contains(Результат прошлой игры):first');
        var last_id = $last_game.attr('href').split('id=')[1];
        if(todayStats.history[last_id]) {
          $last_game.html($last_game.html() + ' [<strong title="Выпало число">' + todayStats.history[last_id] + '</strong>]');
        }

        gamesCount = 0;
        for(var key in todayStats) {
          if(todayStats['summ'][key] > 0) gamesCount += todayStats['summ'][key];
        }

        $('center:contains("Ваш счёт"):last').append('<b id="roulette-overall"></b>');


        var $control = $('<p class="roulette-control">').insertAfter($roulette.parents('table').first());

        var yesterdayStats, aggregatedWeekStats, aggregatedMonthStats;

        $control.append('<span>Показывать данные: </span>');
        $control.append($('<a class="ajax-href roulette-today">за сегодня</a>').click(function() {
          drawStats(todayStats);
          panel.set('roulette_mode', 'today');
          $('#roulette-overall').html('За сегодня игр: ' + todayStats.overall);
        })).append($('<a class="ajax-href roulette-yesterday">за вчера</a>').click(function() {
          panel.getTime(function(serverDate) { /// Получаем время на сервере
            if(!yesterdayStats) {
              serverDate.setDate(serverDate.getDate() - 1);
              fetchStatsFor(serverDate, function(stats) {
                yesterdayStats = stats;
                drawStats(yesterdayStats);
                $('#roulette-overall').html('За вчера игр: ' + yesterdayStats.overall);
              }, true);
            } else {
              $('#roulette-overall').html('За вчера игр: ' + yesterdayStats.overall);
              drawStats(yesterdayStats);
            }
          });
          panel.set('roulette_mode', 'yesterday');
        })).append($('<a class="ajax-href roulette-week">за неделю</a>').click(function() {
          panel.getTime(function(serverDate) { /// Получаем время на сервере
            if(!aggregatedWeekStats) {
              serverDate.setDate(serverDate.getDate() - 7);
              fetchStatsTill(serverDate, function(stats) {
                aggregatedWeekStats = stats;
                drawStats(aggregatedWeekStats);
                $('#roulette-overall').html('За неделю игр: ' + aggregatedWeekStats.overall);
              });
            } else {
              drawStats(aggregatedWeekStats);
              $('#roulette-overall').html('За неделю игр: ' + aggregatedWeekStats.overall);
            }
          });
          panel.set('roulette_mode', 'week');
        })).append($('<a class="ajax-href roulette-month">за 30 дней</a>').click(function() {
          panel.getTime(function(serverDate) { /// Получаем время на сервере
            if(!aggregatedMonthStats) {
              serverDate.setDate(serverDate.getDate() - 30);
              fetchStatsTill(serverDate, function(stats) {
                aggregatedMonthStats = stats;
                drawStats(aggregatedMonthStats);
                $('#roulette-overall').html('За месяц игр: ' + aggregatedMonthStats.overall);
              });
            } else {
              drawStats(aggregatedMonthStats);
              $('#roulette-overall').html('За месяц игр: ' + aggregatedMonthStats.overall);
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

  roulette_results: function() {
    panel.loadScript(['roulette/roulette_parser.js'], function() {
      panel.roulette_stat_parser(function(todayStats) {
        $('td:contains(Время запуска)').parent().append('<td class="greenbg_red">Число</td><td class="greenbg_red">Дюжины</td><td class="greenbg_red">1:2</td><td class="greenbg_red">1-18/19-36</td><td class="greenbg_red">Чёт/нечет</td>');
        $('a[href*="rouinfo.php"]').each(function() {
          var id = parseInt(this.href.split('id=')[1]);
          if(id > 0 && todayStats['history'][id]) {
            var cl = $(this).parents('td:first').attr('class');
            suff = '';
            if(todayStats['history'][id + 1] == todayStats['history'][id] || todayStats['history'][id - 1] == todayStats['history'][id]) {
              suff = '<span class="bullet" title="Повтор" style="position: absolute; margin: 6px 0 0 6px; border: 4px solid #003300; border-radius: 4px; height: 0px; width: 0px; display: inline-block;">&nbsp;</span>';
            }
            $(this).parents('tr:first').append('<td class="' + cl + '" align="center"><img style="margin: -4px" height="26" src="http://images.ganjawars.ru/i/rim/' + todayStats.history[id] + '.gif">' + suff + '</td>');
            var text = '';
            switch(determineDozen(todayStats['history'][id])) {
              case 37: text = '1-12'; break;
              case 38: text = '13-24'; break;
              case 39: text = '25-36'; break;
            }
            $(this).parents('tr:first').append('<td class="' + cl + '" align="center"><strong>' + text + '</strong></td>');
            var text = '';
            switch(determineTvelveNumber(todayStats['history'][id])) {
              case 40: text = '#3'; break;
              case 41: text = '#2'; break;
              case 42: text = '#1'; break;
            }
            $(this).parents('tr:first').append('<td class="' + cl + '" align="center"><strong>' + text + '</strong></td>');
            var text = '';
            switch(determineHalf(todayStats['history'][id])) {
              case 43: text = '1-18'; break;
              case 44: text = '19-36'; break;
            }
            $(this).parents('tr:first').append('<td class="' + cl + '" align="center"><strong>' + text + '</strong></td>');

            var text = '';
            switch(determineParity(todayStats['history'][id])) {
              case 45: text = 'чёт'; break;
              case 46: text = 'нечет'; break;
            }
            $(this).parents('tr:first').append('<td class="' + cl + '" align="center"><strong>' + text + '</strong></td>');
          }
        });
        
        var $history = $('<p></p>');
        $history.append('<h2>Данные в хранилище: </h2>');
        $('a:contains(Рулетка):last').after($history);
        for(var key in localStorage) {
          if(key.indexOf('rouinfo_') == 0 && key.indexOf('_parsed') != -1) {
            key = key.replace('_parsed', '');
            $history.append($('<a href="#" style="margin-right: 10px;">' + key.substr(8).replace(/_/g, '.') + '</a>').click(function() {

              return false;
            }));
          }
        }
      }, $(document.body));
    });
  }
  
})
})(__panel, jQuery);