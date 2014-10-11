(function(panel, $) {
jQuery.extend(panel, {
  notepad_sticker: function(options) {
    panel.loadCSS('notepad/notepad.css');
    $('<div class="title">').text(options.title || '').appendTo(this);
    $('<div class="text">').text(options.text || '').appendTo(this);
  }
});
})(window.__panel, jQuery);