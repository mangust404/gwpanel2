(function(panel, $) {

  var $header;

  /// новое оформление
  var isNewHeader = true;

  var $syndwar;
  var $mail;
  var $box;
  var $fight;

  var $clock;
  /// кол-во игроков онлайн
  var $online, $online_count;

  $.extend(panel, {
    /**
    * Оживление шапки в аякс-режиме
    */
    panel_header: function(options) {

      $header = $('.topill');
      if(!$header.length) {
        isNewHeader = false;
        $header = $('body > table:first').add('body > table:eq(1)');
      }

      if(!$header.length || !$header.find('a:contains(Персонаж)').length) return;

      if($header.hasClass('gwp2-header')) return;
      $header.addClass('gwp2-header');

      var $clock_container = $header.find('td.txt:contains(игроков онлайн), nobr:contains(игроков онлайн)');

      var ar = $clock_container.text().split(', ');

      $clock = $('<span class="clock">' + ar[0] + '</span>');
      
      var _online_ar = ar[1].split(' ');
      $online = $('<span class="online"><span class="count">' + _online_ar[0] + 
        '</span> <span>' + _online_ar[1] + ' ' + _online_ar[2] + '</span></span>');
      $online_count = $online.find('.count');

      $clock_container.html('').append($clock)
        .append('<span>, </span>')
        .append($online);

      function format_time(time) {
        if(time < 10) {
          return '0' + time;
        } else {
          return time;
        }
      }
      var prevTime = false;

      function drawFunc() {
        panel.getTime(function(time) {
          if(options.seconds) {
            $clock.html(format_time(time.getHours()) + ':' + 
              format_time(time.getMinutes()) + ':' + 
              format_time(time.getSeconds()));
          } else {
            if(prevTime !== false && 
              prevTime.getMinutes() == time.getMinutes()) return;
            $clock.html(format_time(time.getHours()) + ':' + 
              format_time(time.getMinutes()));
            prevTime = time;
          }
        });
      }

      panel.setInterval(drawFunc, 1000);

      $clock.click(function() {
        if(options.seconds) {
          options.seconds = false;
        } else {
          options.seconds = true;
        }
        prevTime = false;
        drawFunc();
        options.save();
      });

      if(panel.getEnv() != 'testing') {
        panel.persistInterval(function() {
          panel.lockAcquire('update_header', panel.panel_header_update, 
            function() {}, (options.timeout || 20));
        }, (options.timeout || 20) * 1000);
      }

      $syndwar = $header.find('a[href*="/war/"]')
        .wrapAll('<span></span>').parent().addClass('syndwar');
      $(document.createTextNode(' ')).insertAfter($syndwar.find('a:first'));

      $mail = $header.find('a[href="/sms.php"]');
      if($mail.length) {
        $mail = $mail.wrapAll('<span></span>').parent();
        $mail.find('a').unbind('click').click(function() {
          $(this).hide();
          panel.gotoHref($(this).attr('href'));
          return false;
        }).addClass('ajax');
      } else {
        $mail = $('<span></span>');
        $mail.insertAfter($header.find('a:contains(Персонаж)'));
        $(document.createTextNode(' ')).insertBefore($mail);
      }
      $mail.addClass('gwp2-mail');

      if(isNewHeader) {
        $box = $header.find('img[src$="/woodbox.gif"]');
        if($box.length) {
          $box = $box.wrapAll('<a href="/items.php"></a>').parent()
            .wrapAll('<span></span>').parent();
          $box.remove().insertAfter($header.find('img[src$="/hi.gif"]').parent());
        } else {
          $box = $('<span><a href="/items.php"></a></span>').hide()
            .insertAfter($header.find('img[src$="/hi.gif"]').parent());
        }
      } else {
        $box = $header.find('img[src$="/woodbox.gif"]').parent();
        if($box.length) {
          $box = $box.wrapAll('<span></span>').parent();
        } else {
          $box = $('<span> </span>').hide()
            .insertAfter($header.find('img[src$="/hi.gif"]').parent());
        }
      }
      $box.find('a').unbind('click').click(function() {
        $box.hide();
        panel.gotoHref($(this).attr('href'), function() {
          $('html,body').animate({
            scrollTop: $('tr:contains(Получено)').closest('table').offset().top - 100
          }, 1000);
        });
        return false;
      }).addClass('ajax');

      $box.addClass('gwp2-box');

      $fight = $header.find('a:contains(Ваш бой)');
      if($fight.length) {
        $fight = $fight.wrapAll('<span></span>').parent();
      } else {
        $fight = $('<span> | </span>').hide().insertAfter($header.find('a:contains(Форум)'));
      }

      $fight.addClass('gwp2-fight');

      /// если это было не аяксовое открытие, то код дойдёт до этого места и 
      /// спарсит текущую шапку, и направит данные в другие окна
      panel.panel_header_parse($header);
    },

    panel_update_listener: function(options, data) {
      if(!$header || !$syndwar) return;

      if(data.syndwar) {
        data.syndwar = data.syndwar.replace('</a><a', '</a> <a');
        $syndwar.html(data.syndwar);
      } else {
        $syndwar.html('<a href="/war/" style="text-decoration: none;">Бой</a>');
      }
      /// Пришла почта
      if(data.mail && $mail.is(':hidden')) {
        $mail.html(data.mail).show();
        $mail.find('a').click(function() {
          $(this).hide();
          panel.gotoHref($(this).attr('href'));
          return false;
        });
        panel.checkFocused(function() {
          panel.loadCSS('shake.css', function() {
            $mail.addClass('shake shake-constant');
            panel.setTimeout(function() {
              $mail.removeClass('shake shake-constant');
            }, 1000);
          });
        });
      } else if(!data.mail && $mail.is(':visible')) {
        $mail.hide();
      }

      /// пришла посылка
      if(data.box && !$box.find('img[src$="woodbox.gif"]').length) {
        $box.css({display: 'inline-block'});
        $box.html(data.box);
        $box.find('a').click(function() {
          $box.hide();
          panel.gotoHref($(this).attr('href'), function() {
            $('html,body').animate({
              scrollTop: $('tr:contains(Получено)').closest('table').offset().top - 100
            }, 1000);
          });
          return false;
        });
        panel.checkFocused(function() {
          panel.loadCSS('shake.css', function() {
            $box.addClass('shake shake-constant');
            panel.setTimeout(function() {
              $box.removeClass('shake shake-constant');
            }, 1000);
          });
        });
      } else if(!data.box && $box.find('img[src$="woodbox.gif"]').length > 0) {
        $box.find('a').remove();
      }

      /// кол-во игроков онлайн, только от неаяксовых обработчиков
      if(data.online) {
        var ar = data.online.split(' ');
        if(ar[1] != $online_count.html()) {
          panel.checkFocused(function() {
            $({value: parseInt($online_count.html())}).animate({value: parseInt(ar[1])}, {
              easing: 'easeOutCubic',
              step: function(val) {
                $online_count.html(parseInt(val));
              }
            });
          }, function() {
            $online_count.html(ar[1]);
          });
        }
      }

      /// Персонаж в бою
      if(data.fight && !$fight.find('a').length && 
         location.pathname != '/warlog.php' /// это исключение нужно для того чтобы 
         // "Ваш бой" не появлялся на странице лога боя когда персонаж на самом деле его уже закончил
         ) {
        $fight.css({
          display: 'inline-block', 
          'margin-left': 4
        }).html(' | ' + data.fight);
        panel.checkFocused(function() {
          panel.loadCSS('shake.css', function() {
            $fight.addClass('shake shake-constant');
            panel.setTimeout(function() {
              $fight.removeClass('shake shake-constant');
            }, 1000);
          });
        });
      } else if(!data.fight) {
        $fight.html('');
      }

      /// Обновление очков здоровья
      if(data.hp) {
        var $hpmax = $('#hpheader').parent().contents().filter(function(i, item) {
          return jQuery(this).text().charAt(0) == '/';
        });
        var text = $hpmax.text();
        var pos = text.indexOf(']');
        $hpmax.replaceWith('/' + data.hp.hp_max + text.substr(pos));
      }
    },

    panel_header_parse: function($header) {
      var hp = {};
      hp.hp_start = window.hp_start;
      hp.hp_current = window.hp_start;
      hp.hp_max = window.hp_max;
      hp.hp_speed = window.hp_speed;

      var data = {
        syndwar: $header.find('a[href*="/war/"]').clone().wrapAll('<div></div>').parent().html(),
        mail: $header.find('a[href="/sms.php"]').clone().wrapAll('<div></div>').parent().html(),
        box: $header.find('img[src*="woodbox.gif"]').parent().clone().wrapAll('<div></div>').parent().html(),
        fight: $header.find('a:contains(Ваш бой)').clone().wrapAll('<div></div>').parent().html(),
        online: $header.find('td.txt:contains(игроков онлайн), nobr:contains(игроков онлайн)').text(),
        hp: hp
      };
      setTimeout(function() {
        panel.triggerEvent('header_update', data);
      }, 1200);
    },

    panel_header_update: function() {
      if(document.domain != 'ganjawars.ru' && document.domain != 'www.ganjawars.ru') return;
      $.ajax('http://www.ganjawars.ru/getstate.php?state_uid=' + 
        panel.currentPlayerID() + '&bpvalue=' + panel.getCookies().bp + 
        '&extras=1&bonuses=1', {
        headers: {
          'X-Requested-With': 'GWPanel 2'
        },
        success: function(rawData) {
          var lines = rawData.split("\n");
          if(!lines.length) return;

          var data = {};

          if(lines[1].indexOf('no_mail') == -1) {
            data['mail'] = '<a href="http://www.ganjawars.ru/sms.php" title="' + 
              lines[1].split("\t")[0] + '"><img src="http://images.ganjawars.ru/i/sms.gif"></a>';
          }

          if(lines[8].indexOf('yes') > -1) {
            data['box'] = '<a href="http://www.ganjawars.ru/items.php" ' + 
              'title="Пришла посылка!"><img src="http://images.ganjawars.ru/i/woodbox.gif"></a>';
          }

          if(lines[3] != 'no_attacks') {
            var ar = lines[3].split("\t");
            var time = ar[0].split('[')[1].split(']')[0];
            var levels = ar[0].match(/([0-9]+)\-([0-9]+) lvl/);
            var color = 'red';
            if(levels[2] != '50') {
              color = '#009';
            }
            data['syndwar'] = '<a class="ajax" href="/war/" title="' + ar[0] + 
              '" style="color:' + color + ';font-weight:bold;text-decoration:none">' + 
              'Бой [' + time + ']</a>';
          }
          
          if(lines[2].indexOf('in_battle') != -1) {
            data['fight'] = '[ <a href=/battle.php><font color=#CC0000><b>Ваш бой</b></font></a> ]';
          }

          var hp_values = lines[6].split("\t");
          var hp = {
            hp_current: parseInt(hp_values[1]),
            hp_max: parseInt(hp_values[2]),
            hp_speed: parseFloat(hp_values[3])
          };

          if(hp.hp_max > 0) {
            data.hp = hp;
          }

          panel.syncTime(rawData);

          panel.triggerEvent('header_update', data);
/*          var open = data.indexOf('<table');
          var close = data.indexOf('</table>');
          if(data.indexOf('class="topill"') == -1) {
            // для старого вида захватываем вторую таблицу
            close = data.indexOf('</table>', close + 1);
            // и там ещё один закрывающий тег
            close = data.indexOf('</table>', close + 1);
            data = data.replace(/(href=\/[^\/]+\/)>/g, '$1 >');
          }
          var header_html = data.substr(open, close - open + 8);
          var $header = $(header_html);
*/
        }
      });
    }

  });

})(__panel, jQuery);

