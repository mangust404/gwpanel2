(function(panel) {
jQuery.extend(panel, {
  /**
  * Получение списка комплектов
  */
  items_get_sets_async: function(callback) {
    var sets = {};
    var links = jQuery('a[href*="/home.do.php?putset="]');
    if(links.length) {
      /// ссылки с комплектами найдены на текущей странице
      links.each(function() {
        sets[jQuery(this).attr('href').split('=')[1]] = jQuery(this).html();
      });
      callback(sets);
    } else {
      jQuery.ajax('/items.php', {
        success: function(data) {
          links = jQuery(data).find('a[href*="/home.do.php?putset="]');
          links.each(function() {
            sets[jQuery(this).attr('href').split('=')[1]] = jQuery(this).html();
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
})(window.__panel);