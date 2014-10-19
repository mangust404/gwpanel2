// author   гном убийца
// id       433067

(function(panel) {
  jQuery.extend(panel, {
    player_hide_sinds: function(options){
      var $td, $contentTd, $newContent;
      var index, i, length, html, url;

      $td = jQuery('b:contains("Синдикаты")').closest('tr').next().children();
      $contentTd = $td.children();

      if($contentTd.eq(0).is('br') && $contentTd.eq(1).is('br')) return false;
      if($td.text().search("остальных синдикатов скрыт") != -1) return false;

      $newContent = jQuery('<span>').append('<br>');
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
        jQuery('<div>').addClass("center spoiler").append(
          jQuery('<div>').addClass("title").html(
            '&nbsp;&nbsp;<img src="' + panel.path_to_theme() + 'icons/spoiler_open.png" />&nbsp;Список остальных синдикатов'
          ).click(
            function(){
              var $content, $img;
              $content = jQuery("#listContent");
              $img = jQuery(this).find('img');

              if($content.is(':hidden')){
                $content.show();
                $img.prop('src', panel.path_to_theme() + 'icons/spoiler_close.png');
              } else {
                $content.hide();
                $img.prop('src', panel.path_to_theme() + 'icons/spoiler_open.png');
              }
            }
          )
        ).append(
          jQuery('<div>').addClass("content").html(html).hide().prop('id', 'listContent')
        ).append(
          jQuery('<div>').addClass("space")
        )
      ).append(jQuery('<br>'));

      $td.empty().append($newContent);

    }
  });
})(window.__panel);