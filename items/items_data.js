(function(panel, $) {
jQuery.extend(panel, {
  /**
  * Получение списка комплектов
  */
  items_get_sets_async: function(callback) {
    var sets = {};
    var links = $('a[href*="/home.do.php?putset="]');
    if(links.length) {
      /// ссылки с комплектами найдены на текущей странице
      links.each(function() {
        sets[$(this).attr('href').split('=')[1]] = $(this).html();
      });
      callback(sets);
    } else {
      $.ajax('/items.php', {
        success: function(data) {
          links = $(data).find('a[href*="/home.do.php?putset="]');
          links.each(function() {
            sets[$(this).attr('href').split('=')[1]] = $(this).html();
          });
          callback(sets);
        },
        error: function() {
          callback({});
        }
      })
    }
  }
});
})(window.__panel, jQuery);