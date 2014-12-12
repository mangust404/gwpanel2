(function(panel, $) {
  window.panel_release_migration = window.panel_release_migration || [];
  panel_release_migration.push(function() {
    __panel.haveServerSync(function(have) {
      /// Добавляем кнопку "Турбо"
      __panel.check_button('panel_turbo');
      /// для членов синдиката добавляем кнопку тестирования
      if(have) {
        __panel.check_button('panel_staging');
      }
      __panel.setOptions(__panel.getOptions());
    });
  });

})(window.__panel, jQuery);
