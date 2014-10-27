// author   гном убийца
// id       433067

(function(panel, $) {
  $.extend(panel, {
    common_players_tooltip: function(options){
      // Интервал, через который имя для передачи (денег, предметов) будет удалено (ms).
      var clearDataTimeout = 300000;

      var $player, $toolWindow, $playerLink, $playerLinkOnInfo;
      var showWaitId, hideWaitId, paramButtons, toolHTML, i, length;

      paramButtons = [
        "Написать письмо",          "send_mail.png",
        "Передать деньги",          "send_money.png",
        "Добавить в друзья",        "friend_list.png",
        "Список аренды",            "list_rents.png",
        /* вторая строка */
        "Письма от персонажа ",     "mails_from.png",
        "Передать предмет",         "send_item.png",
        "Добавить в черный список", "black_list.png",
        "Иски игрока",              "claims.png"
      ];

      toolHTML = "&nbsp;";
      for(i = 0, length = paramButtons.length; i < length; i = i + 2){
        if(i == 8) toolHTML += "<br>";
        toolHTML += '<a title="'+ paramButtons[i] +'"><img src="'+ panel.iconURL(paramButtons[i+1]) +'"></a>&nbsp;';
      }

      $('body').append(
        $('<div id="playerToolWindow"></div>').html(toolHTML).addClass('pane left').hide()
      );

      if(location.pathname == "/info.php"){
        $playerLinkOnInfo = $('img[src*="male.gif"]').closest('td').find('b');
        $playerLinkOnInfo.replaceWith(
          $('<a>')
            .prop('href', location.href)
            .html($playerLinkOnInfo.text())
            .css({"text-decoration": "none", "font-weight": "bold"})
        );
      }

      $toolWindow = $('#playerToolWindow');
      $player = $('a[href*="info.php?id="]');

      $player.mouseenter(
        function(){
          $playerLink = $(this);
          showWaitId = setTimeout(function(){showToolWindow($playerLink)}, 750);
          if($playerLink.text().search('info.php?') != -1) clearTimeout(showWaitId);
        }
      );

      $player.mouseleave(
        function(){
          clearTimeout(showWaitId);
          hideWaitId = setTimeout(function(){
            $toolWindow.fadeOut();
          }, 500);
        }
      );

      $toolWindow.mouseenter(
        function(){
          clearTimeout(hideWaitId);
        }
      );

      $toolWindow.mouseleave(
        function(){
          hideWaitId = setTimeout(function(){
            $toolWindow.fadeOut();
          }, 500);
        }
      );

      $player.click(
        function(){
          clearTimeout(showWaitId);
        }
      );

      if(location.pathname == '/send.php' || location.pathname == "/home.senditem.php" || location.pathname == "/items.php"){
        pasteNameToSend(clearDataTimeout);
      }
    }
  });

function showToolWindow($playerLink){
  var $toolWindow, $urlTool;
  var dimensions, left, top, id, name, login, bodyWidth, info;

  id   = $playerLink.prop("href").match(/(\d+)/)[0];
  name = $playerLink.text();
  login = name.replace(/ /g, '+');
  dimensions = $playerLink.position();
  bodyWidth = $('body').width() - 275;

  left = dimensions.left - 80;
  if(left < 10 || left > bodyWidth){
    if(left < 10){
      left = 10;
    }else{
      left = bodyWidth;
    }
  }
  top = dimensions.top + 22;

  $toolWindow = $('#playerToolWindow')
    .css({
        position: 'absolute',
        left: left,
        top:  top
    })
    .fadeIn();

  $urlTool = $toolWindow.find('a');

  // Первая строка:
  // Написать письмо
  $urlTool.eq(0).prop("href", "http://www.ganjawars.ru/sms-create.php?mailto=" + login);

  // Передать деньги
  $urlTool.eq(1).unbind().click(
    function(){
      info = {name: name, time: new Date().getTime()};
      panel.set("nameToSendMoneyItem", info);
    }
  ).prop("href", "http://www.ganjawars.ru/send.php");

  // Добавить в друзья
  $urlTool.eq(2).unbind().click(
    function(){
      addToFriendOrEnemy(0, name);
    }
  ).css({"cursor": "pointer"});

  // Список аренды
  $urlTool.eq(3).prop("href", "http://www.ganjawars.ru/info.rent.php?id=" + id);

  // Вторя строка:
  // Письма от персонажа
  $urlTool.eq(4).prop("href", "http://www.ganjawars.ru/sms.php?page=0&search=" + login)
    .prop("title", "Письма от персонажа " + name);

  //Передать предмет
  $urlTool.eq(5).unbind().click(
    function(){
      info = {name: name, time: new Date().getTime()};
      panel.set("nameToSendMoneyItem", info);
    }
  ).prop("href", "http://www.ganjawars.ru/items.php");

  // Добавить в черный список
  $urlTool.eq(6).unbind().click(
    function(){
      addToFriendOrEnemy(1, name);
    }
  ).css({"cursor": "pointer"});

  //Иски игрока
  $urlTool.eq(7).prop("href", "http://www.ganjawars.ru/isks.php?sid=" + id + "&st=1&period=4");
}

function addToFriendOrEnemy(type, name){
  var text;

  $.ajax({
    type: "POST",
    url: "http://www.ganjawars.ru/home.friends.php",
    data: "blop=" + type + "&addfriend=" + panel.encodeURIComponent(name),
    success: function(data){
      text = !type ? "Ваши друзья" : "Черный список";
      if($(data).find('b:contains("' + text + '")').closest('table').find('b:contains("' + name + '")').length){
        text = "<b>" + name + "</b> добавлен в ";
        text += !type ? "друзья." : "черный список.";
        panel.showFlash(text, 'message', 2500);
      }
    }
  });
}

function pasteNameToSend(timeout){
  var $input;
  var time = new Date().getTime();
  panel.get("nameToSendMoneyItem", function(info){
    if(info != null){
      time = time - info.time;
      if(timeout > time){
        $input = $('tr:contains("Имя получателя:")').find('input');
        if($input.length){
          $input.eq(0).prop("value", info.name);
          panel.set("nameToSendMoneyItem", null);
        } else {
          panel.showFlash("Выберите предмет для передачи игроку <b>"+ info.name +"</b>, и нажмите «Передать».", 'message', 5000);
        }
      } else {
        panel.set("nameToSendMoneyItem", null);
      }
    }
  });
}

})(window.__panel, jQuery);