(function(panel, $) {
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
  },

  panel_turbo: function(options) {
    var currentOptions = panel.getOptions();
    if($(this).hasClass('disabled')) {
      var i = currentOptions.blacklist.indexOf('panel_ajaxify');
      currentOptions.blacklist.splice(i, 1);
      panel.setOptions(currentOptions);
      $(this).removeClass('disabled')
        .find('h3').html('Турбо ВКЛ');
      panel.showFlash('Турбо-режим включен.<br />' + 
        'Обновите страницу чтобы он начал работать.', 5000);
    } else {
      currentOptions.blacklist.push('panel_ajaxify');
      panel.setOptions(currentOptions);
      $(this).addClass('disabled')
        .find('h3').html('Включить Турбо');
      panel.showFlash('Турбо-режим выключен.<br />' + 
        'Обновите страницу чтобы он перестал действовать.', 5000);
    }
  },

  panel_turbo_draw: function(options) {
    var currentOptions = panel.getOptions();
    if(currentOptions.blacklist.indexOf('panel_ajaxify') > -1) {
      $(this).addClass('disabled');
      $(this).find('h3').html('Включить Турбо');
    } else {
      $(this).find('h3').html('Турбо ВКЛ');
    }
  }
});
})(window.__panel, jQuery);