(function(panel) {

  jQuery.extend(panel, {
    items_putset: function(options) {
      var that = this;
      jQuery.ajax('http://www.ganjawars.ru/home.do.php?putset=' + options.set_id, {
        success: function(data) {
          /// Проверяем есть ли ссылка на этот комплект на странице
          if(jQuery(data).find('a[href*="/home.do.php?putset=' + options.set_id + '"]').length > 0) {
            jQuery(that).addClass('button-ok');
          } else {
            jQuery(that).addClass('button-error');
          }
        }, 
        error: function() {
          jQuery(that).addClass('button-error');
        }
      });
    }
  });
})(window.__panel);