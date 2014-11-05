// author   гном убийца
// id       433067

(function(panel, $) {
  $.extend(panel, {
    outland_pokemon_title: function(options){
      var $container;
      var users, bots, i, length, prop, bot, botInfo;

      if(!options.quantity && !options.power && !options.prize) return false;

      users = window.users;
      bots = {};

      for(i = 0, length = users.length; i < length; i++){
        bot = users[i];
        if(bot.type == "bot"){
          prop = {};
          botInfo = bot.info.match(/(\d+)/g);

          if(bot.info.search('Мощность') != -1){
            prop.power = Number(botInfo[0]);
            prop.quantity = Number(botInfo[1]);
            prop.prize = Number(botInfo[2]);
          }else{
            prop.power = null;
            prop.quantity = Number(botInfo[0]);
            prop.prize = Number(botInfo[1]);
          }

          if(!bots[bot.x]){
            bots[bot.x] = {};
          }
          bots[bot.x][bot.y] = prop;
        }
      }

      panel.loadCSS('outland/pokemon_title.css');
      $container = $('<div class="pt_tooltips"></div>').hide().appendTo(document.body);

      $('img[src*="bot100.gif"]').each(
        function(){
          var $bot, $tooltip;
          var position, coordinates, content, height, currentBot;

          $bot = $(this);
          content = "";
          height = 20;

          coordinates = $bot.prop('onmouseout').toString().match(/(\d+)/g);
          coordinates = {"x": coordinates[0], "y": coordinates[1]};
          currentBot = bots[coordinates.x][coordinates.y];

          if(options.quantity){
            content += "<div>Количество: "+ currentBot.quantity +"</div>";
            height += 11;
          }
          if(options.power && currentBot.power){
            content += "<div>Мощность: "+ currentBot.power +"</div>";
            height += 11;
          }
          if(options.prize){
            content += "<div>Премия: "+ currentBot.prize +"%</div>";
            height += 11;
          }

          position = $bot.position();
          position.left = position.left + 5;
          position.top = position.top - height;

          if(position.top < 0){
            position.left = position.left + 20;
            position.top = 24;
          }

          $tooltip = $('<div>')
            .html(content)
            .css({
              "left": position.left,
              "top": position.top
              }
            )
            .addClass('pt_tooltip left')
            .mouseenter(
              function(){
                $(this).fadeOut();

                setTimeout(
                  function(x){
                    return function(){x.fadeIn()}
                  }($(this)),
                  3000
                )
              }
            );

          $container.append($tooltip);
        }
      );

      $container.show();
      
      panel.onunload(function() {
        $('.pt_tooltips').remove();
      });
    }
  });
})(window.__panel, jQuery);
