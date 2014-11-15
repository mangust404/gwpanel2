(function(panel, $) {
  $.extend(panel, {
    dev_widget: function(options) {
      this.append('<div style="left: 0; top: 0; width: 70px; height: 85px;">' +
                    '<a>' +
                      '<div style="margin-left: auto; margin-right: auto;">' +
                        '<img src="' + panel.path_to_theme() + '/icons/debug.png">' +
                      '</div>' +
                      '<span style="margin-left: auto; margin-right: auto;">' + options.title + '</span>' +
                    '</a>' +
                  '</div>').click(
          function(){
            eval(options.functions_todo);
          }
        );
    }
  });
})(window.__panel, jQuery);