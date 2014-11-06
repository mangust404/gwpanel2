(function(panel, $) {
  var $skillsTable, syndnode, expTable;
$.extend(panel, {
  stat_update_personal: function() {
    //Обновляем счётчики на главной странице
    $skillsTable = $('img[src*="skill_combat_pistols.gif"]').closest('table');
    $skillsTable.css({position: 'relative'});
    var matches = $skillsTable.text().match(/[0-9\/]+ \([0-9\.]+\)\+[0-9\.\-]+/g);
      //alert(matches);
    if(!matches) return false;
    var actualSkills = [];
    for(var i = 0; i < matches.length; i++) {
      actualSkills[i] = parseFloat(matches[i].split('(')[1].split(')')[0]);
    }
    var dayStart = new Date; dayStart.setHours(0); dayStart.setMinutes(0); dayStart.setSeconds(0); dayStart.setMilliseconds(0);
    var monthStart = new Date; monthStart.setDate(1); monthStart.setHours(0); monthStart.setMinutes(0); monthStart.setSeconds(0);  monthStart.setMilliseconds(0);
    panel.get('stat_skills', function(stat) {
      var changes = {};
      var changed;
      
      if(!stat) {
        // initializing stats
        stat = {
          start: actualSkills,
          prev: actualSkills,
          curr: actualSkills,
          daily: {},
          monthly: {}
        };
        stat.daily[dayStart.getTime()] = [0, 0, 0, 0, 0, 0];
        stat.monthly[monthStart.getTime()] = [0, 0, 0, 0, 0, 0];
        changed = true;
      } else {
        for(var i = 0; i < actualSkills.length; i++) {
          var delta = 0;
          if(stat.curr[i] < actualSkills[i]) {
            stat.prev[i] = stat.curr[i];
            stat.curr[i] = actualSkills[i];
            changed = true;
            delta = stat.curr[i] - stat.prev[i];
            changes[i] = delta;
            if(typeof(stat.daily[dayStart.getTime()]) != 'object') stat.daily[dayStart.getTime()] = [0, 0, 0, 0, 0, 0];
            stat.daily[dayStart.getTime()][i] += delta;
            if(typeof(stat.monthly[monthStart.getTime()]) != 'object') stat.monthly[monthStart.getTime()] = [0, 0, 0, 0, 0, 0];
            stat.monthly[monthStart.getTime()][i] += delta;
          } else {
            delta = stat.curr[i] - stat.prev[i];
          }
          var overall = actualSkills[i] - stat.start[i];
          if(overall > 0) {
            overall = Math.round(overall * 100) / 100;
            delta = Math.round(delta * 100) / 100;
            var font = document.createElement('font');
            var nobr = $skillsTable.get(0).rows[i].cells[1].childNodes[0];
            var child = nobr.childNodes[5];
            if(!child.offsetWidth) child = nobr.childNodes[4];
            var top = child.offsetTop + $skillsTable.get(0).rows[i].cells[1].offsetHeight * i;
            nobr.innerHTML += ' <font title="Получено умений за последний бой: ' + delta + '" style="color: red; font-size: 8px; position: absolute; margin-left: 4px; top: ' + top + 'px;">+' + overall + '</font>';
          }
        }
      }
      if(changed) {
        panel.set('stat_skills', stat, function() {
          //panel.triggerEvent('stat_skills', {stat_skills: stat, changes: changes});
        }, true);
      }


    }, true);

    $('span > nobr > a').each(function() {
      if(this.href.indexOf('syndicate.php?id=') != -1) {
        syndnode = this.parentNode.nextSibling;
      }
    });
    
    if(syndnode) {
      
      panel.get('stat_syndexp', function(stat) {
        var changes = {};
        var changed;
        
        var text = String(syndnode.textContent || syndnode.innerText);
        var r = text.split(' ');
        var expCount = parseInt(r[2].slice(1, r[2].length - 1));
        
        if(!stat) {
          // initializing stats
          stat = {
            start: expCount,
            prev: expCount,
            curr: expCount,
            daily: {},
            monthly: {}
          };
          stat.daily[dayStart.getTime()] = 0;
          stat.monthly[monthStart.getTime()] = 0;
          changed = true;
          panel.set('stat_syndexp', stat, function() {}, true);
        } else {
          panel.loadScript('data/exp_table.js', function() {
            for(var i = 0; i < panel.expTable.length; i++) {
              if(expCount < panel.expTable[i]) {
                var font = document.createElement('font');
                font.style.color = '#809980';
                font.style.fontSize = '10px';
                var syndExp = (panel.expTable[i] - expCount);
                font.innerHTML = '&nbsp;+' + syndExp;
                if(stat.curr < expCount) {
                  stat.prev = stat.curr;
                  stat.curr = expCount;
                  var g = stat.curr - stat.prev;
                  changed = true;
                  if(isNaN(stat.daily[dayStart.getTime()])) stat.daily[dayStart.getTime()] = g;
                  else stat.daily[dayStart.getTime()] += g;
                  if(isNaN(stat.monthly[monthStart.getTime()])) stat.monthly[monthStart.getTime()] = g;
                  else stat.monthly[monthStart.getTime()] += g;
                } else {
                  syndnode.appendChild(font);
                }
                var overall = stat.curr - stat.start;
                var g = stat.curr - stat.prev;
                if(overall > 0) {
                  font.innerHTML += '&nbsp;<font title="Получено синдикатного опыта за последний бой: ' + g + '" style="color: red;">(+' + overall + ')</font>';
                }
                syndnode.appendChild(font);
                changed = true;
                break;
              }
            }
            if(changed) {
              panel.set('stat_syndexp', stat, function() {
                panel.triggerEvent('stat_syndexp', {stat_syndexp: stat, exp: expCount});
              }, true);
            }
          });
        }
      }, true);
    }
    
    expTable = $skillsTable.get(0).parentNode.previousSibling.getElementsByTagName('table')[0];
    var actualExp = {};
    try {
      var text = $(expTable).text();
      actualExp.battle = parseFloat(text.match(/Боевой уровень:[0-9]+[ ]\(([0-9\.]+)\)/)[1]);
      actualExp.economic = parseFloat(text.match(/Экономический:[0-9]+[ ]\(([0-9\.]+)\)/)[1]);
      actualExp.product = parseFloat(text.match(/Производственный:[0-9]+[ ]\(([0-9\.]+)\)/)[1]);
    } catch(e) {};
    
    panel.get('stat_exp', function(stat) {
      if(!stat) {
        stat = {
          battle: {curr: actualExp.battle, prev: actualExp.battle, start: actualExp.battle, daily: {}, monthly: {}},
          economic: {curr: actualExp.economic, prev: actualExp.economic, start: actualExp.economic, daily: {}, monthly: {}},
          product: {curr: actualExp.product, prev: actualExp.product, start: actualExp.product, daily: {}, monthly: {}}
        }
        panel.set('stat_exp', stat, function() {}, true);
      } else {
        var changed = false;
        var i = 0;
        for(key in actualExp) {
          if(stat[key].curr < actualExp[key]) {
            stat[key].prev = stat[key].curr;
            stat[key].curr = actualExp[key];
            var overall = stat[key].curr - stat[key].prev;
            if(!stat[key].daily[dayStart]) stat[key].daily[dayStart] = overall;
            else stat[key].daily[dayStart] += overall;
            if(!stat[key].monthly[monthStart]) stat[key].monthly[monthStart] = overall;
            else stat[key].monthly[monthStart] += overall;
            changed = true;
          };
          var overall = actualExp[key] - stat[key].start;
          var g = stat[key].curr - stat[key].prev;
          if(overall > 0) {
            overall = Math.round(overall * 100) / 100;
            g = Math.round(g * 100) / 100;
            var cell = expTable.rows[i].cells[3];
            cell.innerHTML += ' <font title="Получено опыта за ' + (key == 'battle'? 'последний бой': (key == 'economic'? 'последнюю операцию': 'отработанные часы')) + ': ' + g + '" style="color: red; font-size: 8px; position: absolute; margin: 2px 0 0 0;">+' + overall + '</font>';
          };
          i++;
        }
        if(changed) {
          panel.set('stat_exp', stat, function() {
            panel.triggerEvent('stat_exp', {stat_exp: stat, exp: overall});
          }, true);
        };   
      }
    }, true);
    $('<a class="stat-reset">сбросить счётчики</a>').css({
      position: 'absolute',
      'font-size': '8px',
      'margin-left': '44px',
      'margin-top': '3px',
      'text-decoration': 'underline'
    }).click(function() {
      if(confirm('Вы уверены что хотите обнулить все счётчики?')) {
        panel.del('stat_exp', function(){}, true);
        panel.del('stat_skills', function(){}, true);
        panel.del('stat_syndexp', function(){}, true);
        alert('Счетчики обнулены, обновите страницу');
      }
    }).appendTo($skillsTable);
  },
  
  stat_update_info_personal: function() {
    //Обновляем счётчики на странице персонажа
    
  },
  
  stat_draw_main_counters: function() {
    //Выводим счётчики на главной странице
    
  },
  
  stat_draw_info_counters: function() {
    //Выводим счётчики на странице персонажа
    
  }
})

})(window.__panel, jQuery);
