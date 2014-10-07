(function(panel) {
  jQuery.extend(panel, {
    common_players_tooltip: function(options){
      var $player, $toolWindow, $playerLink;
      var showWaitId, hideWaitId;

      jQuery('body').append(
        jQuery('<div style="position: absolute; left: 0; top: 0; width: auto; height: 16px; border: solid 1px black; z-index: 1; background: #e0ffe0;" id="gwp2_playerToolWindow">&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/mail.gif" title="Написать письмо"></a>&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/bank.gif" title="Передать деньги"></a>&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/friends.gif" title="Передать предмет"></a>&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/ganjafoto.gif" title="Добавить в друзья"></a>&nbsp;&nbsp;'+
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/syndicate.gif" title="Добавить в ЧС"></a>&nbsp;&nbsp;'+
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/cashsend.gif" title="Иски игрока"></a>&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/market.gif" title="Список аренды"></a>&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/iski.gif" title="Письма от персонажа ..."></a>&nbsp;&nbsp;'+
               '</div>').hide()
      );

      $toolWindow = jQuery('#gwp2_playerToolWindow');
      $player = jQuery('a[href*="info.php?id="]');

      $player.mouseenter(
        function(){
          $playerLink = jQuery(this);
          showWaitId = setTimeout(function(){showToolWindow($playerLink)}, 1000);
        }
      );

      $player.mouseleave(
        function(){
          clearTimeout(showWaitId);
          hideWaitId = setTimeout(function(){
            $toolWindow.hide();
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
            $toolWindow.hide();
          }, 500);
        }
      );
    }
  });

function showToolWindow($playerLink){
  var $toolWindow, $urlTool;
  var dimensions, left, top, id, name, login;

  id   = $playerLink.prop("href").match(/(\d+)/)[0];
  name = $playerLink.text();
  login = name.replace(/ /g, '+');
  dimensions = $playerLink.position();

  left = dimensions.left;
  top = dimensions.top - 18;

  $toolWindow = jQuery('#gwp2_playerToolWindow')
    .css({
        left: left,
        top:  top
    })
    .show();

  $urlTool = $toolWindow.find('a');

  $urlTool.eq(0).prop("href", "http://www.ganjawars.ru/sms-create.php?mailto=" + login);
  $urlTool.eq(1).prop("href", "#");
  $urlTool.eq(2).prop("href", "#");
  $urlTool.eq(3).unbind().click(
    function(){
      addToFriendOrEnemy(0, name);
    }
  );
  $urlTool.eq(4).unbind().click(
    function(){
      addToFriendOrEnemy(1, name);
    }
  );
  $urlTool.eq(5).prop("href", "http://www.ganjawars.ru/isks.php?sid=" + id + "&st=1&period=4");
  $urlTool.eq(6).prop("href", "http://www.ganjawars.ru/info.rent.php?id=" + id);
  $urlTool.eq(7).prop("href", "http://www.ganjawars.ru/sms.php?page=0&search=" + login);
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