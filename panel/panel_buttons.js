(function(panel) {
jQuery.extend(panel, {
  // функция для базовой кнопки - переход по ссылке
  panel_link: function(event, data) {
    if(data.blank) {
      window.open(data.link);
    } else {
      __panel.gotoHref(data.link);
    }
  },
  panel_exit: function(event) {
    location.href = 'http://www.ganjawars.ru/logout.php';
  }
});
})(window.__panel);