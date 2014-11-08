(function(panel, $) {
  window.panel_release_migration = window.panel_release_migration || [];
  panel_release_migration.push(function() {
    window.onunload = function() {
      sessionStorage.clear();
    }
  });

})(window.__panel, jQuery);
