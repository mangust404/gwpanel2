(function(panel, $) {
  var initialized = false;
jQuery.extend(panel, {
  home_health: function() {
    if(location.path == '/me/') panel.clearTimeouts();
    if(!window.hp_start || (initialized && $(document.body).hasClass('ajax-processed'))) return;
    panel.get('health', function(data) {
      var new_data = {hp_start: window.hp_start, hp_max: window.hp_max, hp_speed: window.hp_speed, date: (new Date).getTime()};
      initialized = true;
      if(!data || data.hp_start != new_data.hp_start || data.hp_max != window.hp_max) {
        panel.onload(function() {
          panel.triggerEvent('hp_update', new_data);
        });
      }
      //__panel.set('health', new_data);
    });
  }
});
})(window.__panel, jQuery);