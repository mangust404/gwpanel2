window.panel_release_migration = window.panel_release_migration || [];
window.panel_release_migration.push(function() {
  /// Первый скрипт миграции, добавляем новые окна
  var options = __panel.getOptions();
  if(jQuery.type(options.panes[4]) != 'object') {
    options.panes[4] = {width: 6, height: 5};
  }
  if(jQuery.type(options.panes[5]) != 'object') {
    options.panes[4] = {width: 6, height: 5};
  }
  if(jQuery.type(options.panes[6]) != 'object') {
    options.panes[4] = {width: 6, height: 5};
  }
  /// сохраняем
  __panel.setOptions(options);
});