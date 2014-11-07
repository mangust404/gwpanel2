(function(panel, $) {
jQuery.extend(panel, {

  items_dress: function() {
    /// Добавляем слушатель на все ссылки надевания комплектов
    var $links = $('a[href*="putset="]').click(function() {
      var href = this.href;
      if(href.search(/putset=([0-9]+)/)) {
        var set_id = RegExp.$1;
        __panel.set('dress_on_set', set_id, function() {
          panel.gotoHref(href);
        });
      }
      return false;
    });
    panel.onunload(function() {
      $links.unbind('click');
    });
  }

});
})(window.__panel, jQuery);