// author   гном убийца
// id       433067

(function(panel, $) {

var gMoney = {
  "in": 0,
  "out": 0,
  "difference": 0
};

$.extend(panel, {
  player_casino: function(options) {
    var seekParams = {
      roulette: ["Потрачено в казино", "Выигрыш в казино", "Разница в казино"],
      total:    ["Потрачено в тотализаторе", "Выигрыш в тотализаторе", "Разница в тотализаторе"],
      poker:    ["Потрачено на покер", "Получено с покера", "Разница в покере"]
    };

    if(options.roulette || options.total || options.poker){                              // какая-то инфа будет показана
      $('td:contains("Статистика")').closest('tr').next().find('td:last').find('b').each(
        function(){
          if(this.previousSibling){
            for(var param in seekParams) {
              if(parseAndInsert(options[param], this, this.previousSibling, 
                seekParams[param][0], seekParams[param][1], seekParams[param][2])) {
                delete seekParams[param];
                break;
              }
            }
          }
        }
      );
    }
  }
});

function parseAndInsert(key, object, labelTextOfMoney, stringIn, stringOut, stringDifference){
  if(key){
    if($(labelTextOfMoney).text().search(stringIn) != -1){
      gMoney.in = panel.convertingMoneyToInt($(object).text());
    }
    if($(labelTextOfMoney).text().search(stringOut) != -1){
      gMoney.out = panel.convertingMoneyToInt($(object).text());
      gMoney.difference = gMoney.out - gMoney.in;
      $(object).next().after("&nbsp;&nbsp;" + stringDifference + ": <b>" + panel.convertingIntToMoney(gMoney.difference) + "</b><br>");
      return true;
    }
  }
}
})(window.__panel, jQuery);

