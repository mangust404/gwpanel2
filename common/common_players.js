(function(panel) {
  jQuery.extend(panel, {
    common_players_tooltip: function(options){
      var $player, $toolWindow, $playerLink;
      var showWaitId, hideWaitId, iconPatch;

      iconPatch = panel.path_to_theme() + 'icons/';

      jQuery('body').append(
        jQuery('<div id="playerToolWindow">&nbsp;' +
                  '<a href="#"><img border=0 src="' + iconPatch + 'send_mail.png" title="Написать письмо"></a>&nbsp;' +
                  '<a href="#"><img border=0 src="' + iconPatch + 'send_money.png" title="Передать деньги"></a>&nbsp;' +
                  '<a href="#"><img border=0 src="' + iconPatch + 'friend_list.png" title="Добавить в друзья"></a>&nbsp;'+
                  '<a href="#"><img border=0 src="' + iconPatch + 'list_arenda.png" title="Список аренды"></a>&nbsp;<br>' +
                  '<a href="#"><img border=0 src="' + iconPatch + 'mail_ot.png" title="Письма от персонажа ..."></a>&nbsp;'+
                  '<a href="#"><img border=0 src="' + iconPatch + 'send_item.png" title="Передать предмет"></a>&nbsp;'+
                  '<a href="#"><img border=0 src="' + iconPatch + 'black_list.png" title="Добавить в ЧС"></a>&nbsp;'+
                  '<a href="#"><img border=0 src="' + iconPatch + 'isks.png" title="Иски игрока"></a>&nbsp;'+
               '</div>').addClass('pane left').hide()
      );

      $toolWindow = jQuery('#playerToolWindow');
      $player = jQuery('a[href*="info.php?id="]');

      $player.mouseenter(
        function(){
          $playerLink = jQuery(this);
          showWaitId = setTimeout(function(){showToolWindow($playerLink)}, 750);
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
    }
  });

function showToolWindow($playerLink){
  var $toolWindow, $urlTool;
  var dimensions, left, top, id, name, login, bodyWidth;

  id   = $playerLink.prop("href").match(/(\d+)/)[0];
  name = $playerLink.text();
  login = name.replace(/ /g, '+');
  dimensions = $playerLink.position();
  bodyWidth = jQuery('body').width() - 275;

  left = dimensions.left - 80;
  if(left < 10 || left > bodyWidth){
    if(left < 10){
      left = 10;
    }else{
      left = bodyWidth;
    }
  }
  top = dimensions.top + 22;

  $toolWindow = jQuery('#playerToolWindow')
    .css({
        position: 'absolute',
        left: left,
        top:  top
    })
    .fadeIn();

  $urlTool = $toolWindow.find('a');

  $urlTool.eq(0).prop("href", "http://www.ganjawars.ru/sms-create.php?mailto=" + login);
  $urlTool.eq(1).prop("href", "#");
  $urlTool.eq(2).unbind().click(
    function(){
      addToFriendOrEnemy(0, name);
    }
  );
  $urlTool.eq(3).prop("href", "http://www.ganjawars.ru/info.rent.php?id=" + id);
  $urlTool.eq(4).prop("href", "http://www.ganjawars.ru/sms.php?page=0&search=" + login);
  $urlTool.eq(5).prop("href", "#");
  $urlTool.eq(6).unbind().click(
    function(){
      addToFriendOrEnemy(1, name);
    }
  );
  $urlTool.eq(7).prop("href", "http://www.ganjawars.ru/isks.php?sid=" + id + "&st=1&period=4");
}

function addToFriendOrEnemy(type, name){
  var text;

  jQuery.ajax({
    type: "POST",
    url: "http://www.ganjawars.ru/home.friends.php",
    data: "blop=" + type + "&addfriend=" + panel.encodeURIComponent(name),
    success: function(data){
      text = !type ? "Ваши друзья" : "Черный список";
      if(jQuery(data).find('b:contains("' + text + '")').closest('table').find('b:contains("' + name + '")').length){
        //do some;
        //alert("Добавлен в " + text);
      }
    }
  });
}

})(window.__panel);