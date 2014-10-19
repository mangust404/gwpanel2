// author   гном убийца
// id       433067

(function(panel, $) {
  $.extend(panel, {
    player_hide_sinds: function(options){
      var $td, $contentTd;
      var index, i, length, html, url;

      $td = $('b:contains("Синдикаты")').closest('tr').next().children();
      $contentTd = $td.children();

      if($contentTd.eq(0).is('br') && $contentTd.eq(1).is('br')) return false;
      if($td.text().search("остальных синдикатов скрыт") != -1) return false;

      $td.empty().append('<br>');
      index = 1;
      html = "";

      if($contentTd.eq(index).is('ul')){
        $td.append($contentTd.eq(index)).append('<br>');
        index = 2;
      }

      for(i = index, length = $contentTd.length; i < length; i++){
        if($contentTd.eq(i).is('a')){
          url = $contentTd.eq(i).prop('href');
          html +=
            '<span class="phs_list">&nbsp;&nbsp;#' + url.match(/(\d+)/)[0] +
              ' <a class="phs_url" href="'+ url +'">' + $contentTd.eq(i).text() + '</a>' +
            '</span>' +
            '<br>';
        }
      }

      if(html != ""){
        panel.loadCSS("player/player_hide_sinds.css");

        $td.append(
          $('<div>').addClass("phs_center phs_spoiler").append(
            $('<div>').addClass("phs_title").html(
              '&nbsp;&nbsp;<img src="'+ panel.iconURL('spoiler_open.png') +'" />&nbsp;Список остальных синдикатов'
            ).click(
              function(){
                var $content, $img;
                $content = $("#phs_listContent");
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
            $('<div>').addClass("phs_content").html(html).hide().prop('id', 'phs_listContent')
          ).append(
            $('<div>').addClass("phs_space")
          )
        ).append('<br>');
      }
    }
  });
})(window.__panel, jQuery);