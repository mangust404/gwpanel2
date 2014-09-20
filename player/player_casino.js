(function(panel) {
jQuery.extend(panel, {
  player_casino: function(options) {
    var labelTextOfMoney;

    if(jQuery('body:contains("Internal error")').length) return;                              // не перс стерт - выходим

    if(options.roulette || options.total || options.poker){                              // какая-то инфа будет показана
      jQuery('b:contains("Статистика")').closest('tr').next().find('td:last').find('b').each(
        function(){
          labelTextOfMoney = this.previousSibling;
          if(labelTextOfMoney != null){
            parseAndInsert(options.roulette, this, labelTextOfMoney, "Потрачено в казино", "Выигрыш в казино", "Разница в казино");
            parseAndInsert(options.total, this, labelTextOfMoney, "Потрачено в тотализаторе", "Выигрыш в тотализаторе", "Разница в тотализаторе");
            parseAndInsert(options.poker, this, labelTextOfMoney, "Потрачено на покер", "Получено с покера", "Разница в покере");
          }
        }
      );
    }
  }
});

function parseAndInsert(key, object, labelTextOfMoney, stringIn, stringOut, stringDifference){
  var money = {
      "in": 0,
      "out": 0,
      "difference": 0
  };

  if(key){
    if(jQuery(labelTextOfMoney).text().search(stringIn) != -1){
      money.in = panel.convertingMoneyToInt(jQuery(object).text());
    }
    if(jQuery(labelTextOfMoney).text().search(stringOut) != -1){
      money.out = panel.convertingMoneyToInt(jQuery(object).text());
      money.difference = money.out - money.in;
      jQuery(object).next().after("&nbsp;&nbsp;" + stringDifference + ": <b>" + panel.convertingIntToMoney(money.difference) + "</b><br>");
    }
  }
}
})(window.__panel);

