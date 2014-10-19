// author   гном убийца
// url      http://www.ganjawars.ru/info.php?id=433067

(function(panel, $) {

var forumsDefine = {
  "main_forums" : {"count": 16, "header": "Основные форумы"},
  "trade_forums": {"count": 12, "header": "Торговля"},
  "sud_forums"  : {"count": 4, "header": "Суд"},
  "tech_forums" : {"count": 5, "header": "Технические вопросы"},
  "rh_forums"   : {"count": 1, "header": "Автономные районы"}
};

$.extend(panel, {
  forum_hide: function(options){
    var $forumsTable, $tempForums;
    var i, counter;

    panel.loadCSS('forum/forum_hide.css');

    if(location.search != "?gid=2"){
      $forumsTable = $('b:contains("Основные форумы")').closest('table');
      $tempForums = $('<table>').html($forumsTable.html());
      counter = {"all": 0, "success": 0};

      for(i in options){
        if($.type(options[i]) == 'array'){
          counter.all++;
          counter.success += hideForum($tempForums, i, options[i]);
        }
      }
      if(counter.all == counter.success){
        $forumsTable.html($tempForums.html());
      }
    } else {
      $forumsTable = $('b:contains("Торговля")').closest('table');
      $tempForums = $('<table>').html($forumsTable.html());

      if(hideForum($tempForums, "trade_forums", options.trade_forums)){
        $forumsTable.html($tempForums.html());
      }
    }
  }
});

function hideForum($tempList, section, dataSection){
  var i, length;
  var $forumHeader;
  length = dataSection.length;

  if(!length) return 1;
  $forumHeader = $tempList.find('b:contains("' + forumsDefine[section].header + '")');

  for(i = 0; i < length; i++){
    $tempList.find('a[href="/threads.php?' + dataSection[i] + '"]').closest('tr').remove();
  }
  if(length == forumsDefine[section].count){
    $forumHeader.closest('tr').remove();
  } else {
    $forumHeader.addClass('def_forumHeader');
    $("<div>")
      .html("Скрыто разделов: " + i)
      .addClass('tip_forumHeader')
      .attr("title", "Их номера: " + dataSection.join(", "))
      .insertAfter($forumHeader);
  }

  return 1;
}
})(window.__panel, jQuery);