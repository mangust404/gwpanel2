(function(panel) {
jQuery.extend(panel, {
  stat_check_update_achievements: function() {
    __panel.get('stat_ach_upd', function(stat_ach_upd) {
      if(!stat_ach_upd || stat_ach_upd < ((new Date).getTime() - 1800000)) {
        __panel.loadScript('stat/stat.ach.js', function() {
          __panel.stat_get_achievements();
        });
        __panel.set('stat_ach_upd', (new Date).getTime());
      }
    });
  }
})})(window.__panel);