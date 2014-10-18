(function(panel, $) {
jQuery.extend(panel, {
  home_health: function() {
    if(location.path == '/me/') panel.clearTimeouts();
    if(!window.hp_start || $(document.body).hasClass('ajax-processed')) return;
    panel.get('health', function(data) {
      var new_data = {hp_start: window.hp_start, hp_max: window.hp_max, hp_speed: window.hp_speed};
      if(!data || data.hp_start != new_data.hp_start || data.hp_max != window.hp_max || data.hp_speed != window.hp_speed) {
        panel.onload(function() {
          panel.triggerEvent('hp_update', new_data);
        });
      }
      //__panel.set('health', new_data);
    });
  }
});
})(window.__panel, jQuery);