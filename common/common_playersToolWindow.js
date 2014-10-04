(function(panel) {
  jQuery.extend(panel, {
    common_playersToolWindow: function(options){
      var $player, $toolWindow, $playerLink;
      var showWaitId, hideWaitId;

      jQuery('body').append(
        jQuery('<div style="position: absolute; left: 0; top: 0; width: auto; height: 16px; border: solid 1px black; z-index: 1; background: #e0ffe0;" id="gwp2_playerToolWindow">&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/mail.gif" title="Написать письмо"></a>&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/bank.gif" title="Передать деньги"></a>&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/friends.gif" title="Передать предмет"></a>&nbsp;&nbsp;' +
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/ganjafoto.gif" title="Добавить в друзья"></a>&nbsp;&nbsp;'+
                  '<a href="#"><img border=0 src="http://images.ganjawars.ru/i/home/syndicate.gif" title="Добавить в друзья"></a>&nbsp;&nbsp;'+
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
      )
    }
  });

function showToolWindow($playerLink){
  var $toolWindow, $urlTool;
  var dimensions, left, top;

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

  $urlTool.get(0).href = "http://www.ganjawars.ru/sms-create.php?mailto=" + $playerLink.text().replace(/ /g, '+');
  $urlTool.get(1).href = "#";
  $urlTool.get(2).href = "#";
  $urlTool.get(3).href = "#";
  $urlTool.get(5).href = "#";
  $urlTool.get(6).href = "#";
  $urlTool.get(7).href = "#";
}

})(window.__panel);