(function(panel) {
  var forumsDefine = {
    "main_forums" : {"count": 16, "header": "Основные форумы"},
    "trade_forums": {"count": 12, "header": "Торговля"},
    "sud_forums"  : {"count": 4, "header": "Суд"},
    "tech_forums" : {"count": 5, "header": "Технические вопросы"},
    "rh_forums"   : {"count": 1, "header": "Автономные районы"}
  };

jQuery.extend(panel, {
  forum_hide: function(options){
    var $forumsTable, $tempForums;
    var i, counter;

    panel.loadCSS('forum/forum_hide.css');

    if(location.search != "?gid=2"){
      $forumsTable = jQuery('b:contains("Основные форумы")').closest('table');
      $tempForums = jQuery('<table>').html($forumsTable.html());

      counter = 0;

      for(i in options){
        if(typeof options[i] == "object"){
          counter += hideForum($tempForums, i, options[i]);
        }
      }
      if(counter == 5){
        $forumsTable.html($tempForums.html());
      }
    } else {
      $forumsTable = jQuery('b:contains("Торговля")').closest('table');
      $tempForums = jQuery('<table>').html($forumsTable.html());

      if(hideForum($tempForums, "trade_forums", options.trade_forums)){
        $forumsTable.html($tempForums.html());
      }
    }
  }
});

  function hideForum($tempList, section, dataSection){
    var i, length;
    var $forumHeader, $tip;
    length = dataSection.length;

    if(length){
      $forumHeader = $tempList.find('b:contains("' + forumsDefine[section].header + '")');

      for(i = 0; i < length; i++){
        $tempList.find('a[href="/threads.php?fid=' + dataSection[i] + '"]').closest('tr').remove();
      }
      if(length == forumsDefine[section].count){
        $forumHeader.closest('tr').remove();
      } else {
        $tip = jQuery("<div>").html(" Скрыто форумов: " + i).addClass('tip_forumHeader');
        $tip.prop("title", "Их номера: " + dataSection.join(", "));
        $forumHeader.addClass('def_forumHeader');
        $forumHeader.after($tip);
      }
    }

    return 1;
  }
})(window.__panel);