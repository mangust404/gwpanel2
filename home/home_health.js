(function(panel, $) {
  var initialized = false;
jQuery.extend(panel, {
  home_health: function() {
    if(location.path == '/me/') panel.clearTimeouts();
    if(!window.hp_start || (initialized && $(document.body).hasClass('ajax-processed'))) return;
    panel.get('health', function(data) {
      var new_data = {hp_start: window.hp_start || window.hp_start_h, 
                      hp_max: window.hp_max || window.hp_max_h, 
                      hp_speed: window.hp_speed || window.hp_speed_h, 
                      date: (new Date).getTime(), 
                      hp_current: window.hp_current || window.hp_current_h};
      initialized = true;
      if($.type(data) != 'object' || data.hp_start != new_data.hp_start || data.hp_max != window.hp_max || data.hp_current != window.hp_current) {
        panel.onload(function() {
          panel.triggerEvent('hp_update', new_data);
        });
      }
      //__panel.set('health', new_data);
    });
  }
});
})(window.__panel, jQuery);