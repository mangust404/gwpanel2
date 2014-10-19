// author   гном убийца
// id       433067

(function(panel, $) {
  $.extend(panel, {
    player_hide_sinds: function(options){
      var $td, $contentTd, $newContent;
      var index, i, length, html, url;

      $td = $('b:contains("Синдикаты")').closest('tr').next().children();
      $contentTd = $td.children();

      if($contentTd.eq(0).is('br') && $contentTd.eq(1).is('br')) return false;
      if($td.text().search("остальных синдикатов скрыт") != -1) return false;

      $newContent = $('<span>').append('<br>');
      index = 1;
      html = "";
      panel.loadCSS("player/player_hide_sinds.css");

      if($contentTd.eq(index).is('ul')){
        $newContent.append($contentTd.eq(index)).append('<br>');
        index = 3;
      }

      for(i = index, length = $contentTd.length; i < length; i++){
        if($contentTd.eq(i).is('a')){
          url = $contentTd.eq(i).prop('href');
          html +=
            '<span class="list">&nbsp;&nbsp;#' + url.match(/(\d+)/)[0] +
              ' <a class="url" href="'+ url +'">' + $contentTd.eq(i).text() + '</a>' +
            '</span>' +
            '<br>';
        }
      }

      $newContent.append(
        $('<div>').addClass("center spoiler").append(
          $('<div>').addClass("title").html(
            '&nbsp;&nbsp;<img src="'+ panel.iconURL('spoiler_open.png') +'" />&nbsp;Список остальных синдикатов'
          ).click(
            function(){
              var $content, $img;
              $content = $("#listContent");
              $img = $(this).find('img');

              if($content.is(':hidden')){
                $content.show();
                $img.prop('src', panel.iconURL('spoiler_close.png'));
              } else {
                $content.hide();
                $img.prop('src', panel.iconURL('spoiler_open.png'));
              }
            }
          )
        ).append(
          $('<div>').addClass("content").html(html).hide().prop('id', 'listContent')
        ).append(
          $('<div>').addClass("space")
        )
      ).append($('<br>'));

      $td.empty().append($newContent);
    }
  });
})(window.__panel, jQuery);