(function(panel, $) {
  var $notepad;
jQuery.extend(panel, {
  notepad_button: function(options) {
    panel.loadCSS('notepad/notepad.css');
    panel.get('notepad_' + panel.currentPlayerID(), function(data) {
      if(!$notepad) {
        $notepad = $('<div>', {id: 'notepad'}).appendTo(document.body);
        var $container = $('<div>', {class: 'container'}).appendTo($notepad);
        $('<textarea>').val(data).appendTo($container);
        $('<button>', {class: 'close-button'}).html('Сохранить и закрыть').click(function() {
          $notepad.fadeOut();
          panel.set('notepad_' + panel.currentPlayerID(), $notepad.find('textarea').val());
        }).appendTo($notepad);
      }
      $notepad.fadeIn();
      $notepad.find('textarea').focus();
    });
  }
  
});
})(window.__panel, jQuery);