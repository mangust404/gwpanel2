(function(panel) {
jQuery.extend(panel, {
  // функция для базовой кнопки - переход по ссылке
  panel_link: function(options) {
    if(options.blank) {
      window.open(options.link);
    } else {
      __panel.gotoHref(options.link);
    }
  },
  panel_exit: function(options) {
    location.href = 'http://www.ganjawars.ru/logout.php';
  }
});
})(window.__panel);