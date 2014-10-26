(function(panel, $) {
jQuery.extend(panel, {
  /**
  * Мастер настроек. Вызывается когда настроек нет.
  **/
  panel_master: function() {
    panel.loadScript('panel/panel_settings.js', function() {
      panel.panel_settings_init(function() {
        alert('Мастре');
      });
    });
  }

});
})(__panel, jQuery);