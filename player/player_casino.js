(function(panel) {
jQuery.extend(panel, {
  player_casino: function(options) {
    var $statBlock, $statMoney;
    var statStrings, i , length;
    var money = {
      "roulette":{
        "in": 0,
        "out": 0,
        "difference": 0
      },
      "total":{
        "in": 0,
        "out": 0,
        "difference": 0
      },
      "poker":{
        "in": 0,
        "out": 0,
        "difference": 0
      }
    };

    if(!jQuery('body:contains("Internal error")').length){                                            // не стертый прес
      if(options.roulette || options.total || options.poker){                            // какая-то инфа будет показана
        $statBlock = jQuery('b:contains("Статистика")').closest('tr').next().find('td:last');
        $statMoney = $statBlock.find('b');
        statStrings = $statBlock.html().split(/<br>/i);

        if(options.roulette){
          for(i = 0, length = statStrings.length; i < length; i++){
            if(statStrings[i].search('Потрачено в казино') != -1){
              money.roulette.in = panel.convertingMoneyToInt($statMoney.eq(i).text());
            } else if (statStrings[i].search('Выигрыш в казино') != -1){
              money.roulette.out = panel.convertingMoneyToInt($statMoney.eq(i).text());
              money.roulette.difference = money.roulette.out - money.roulette.in;
              statStrings.splice(i + 1, 0, "&nbsp;&nbsp;Разница в казино: <b>" + panel.convertingIntToMoney(money.roulette.difference) + "</b>");
              $statMoney.splice(i + 1, 0, null);
              break;
            }
          }
        }

        if(options.total){
          for(i = 0, length = statStrings.length; i < length; i++){
            if(statStrings[i].search('Потрачено в тотализаторе') != -1){
              money.total.in = panel.convertingMoneyToInt($statMoney.eq(i).text());
            } else if (statStrings[i].search('Выигрыш в тотализаторе') != -1){
              money.total.out = panel.convertingMoneyToInt($statMoney.eq(i).text());
              money.total.difference = money.total.out - money.total.in;
              statStrings.splice(i + 1, 0, "&nbsp;&nbsp;Разница в тотализаторе: <b>" + panel.convertingIntToMoney(money.total.difference) + "</b>");
              $statMoney.splice(i + 1, 0, 'null');
              break;
            }
          }
        }

        if(options.poker){
          for(i = 0, length = statStrings.length; i < length; i++){
            if(statStrings[i].search('Потрачено на покер') != -1){
              money.poker.in = panel.convertingMoneyToInt($statMoney.eq(i).text());
            } else if (statStrings[i].search('Получено с покера') != -1){
              money.poker.out = panel.convertingMoneyToInt($statMoney.eq(i).text());
              money.poker.difference = money.poker.out - money.poker.in;
              statStrings.splice(i + 1, 0, "&nbsp;&nbsp;Разница в покере: <b>" + panel.convertingIntToMoney(money.poker.difference) + "</b>");
              $statMoney.splice(i + 1, 0, 'null');
              break;
            }
          }
        }

        statStrings = statStrings.join('<br>');
        $statBlock.html(statStrings);
      }
    }
  }
});
})(window.__panel);