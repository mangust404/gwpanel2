(function(panel, $) {
  var $notepad;
jQuery.extend(panel, {
  notepad_button: function(options) {
    panel.loadCSS('notepad/notepad.css');
    if(!$notepad) {
      $(document.body).addClass('ajax-loading');
      $notepad = $('<div>', {id: 'notepad'}).appendTo(document.body).hide();
      var $container = $('<div>', {class: 'container'}).appendTo($notepad);
      $('<textarea>').appendTo($container);
      $('<button>', {class: 'close-button'}).html('Сохранить и закрыть').click(function() {
        panel.haveServerSync(function(have) {
          if(have) {
            $.ajax('http://new.gwpanel.org/settings.php?auth_key=' + panel.authKey + '&notepad_save=1', {
              type: 'POST',
              data: {
                content: $notepad.find('textarea').val()
              },
              success: function(data) {
                if(data.indexOf('OK') == 0) {
                  panel.showFlash('Данные успешно сохранены на сервере gwpanel');
                } else {
                  panel.showFlash('Произошла ошибка во время сохранения, попробуйте ещё раз.');
                  $notepad.fadeIn();
                }
              },
              error: function() {
                panel.showFlash('Произошла ошибка во время сохранения, попробуйте ещё раз.');
                $notepad.fadeIn();
              }
            });
          }
        });
        $notepad.fadeOut();
        panel.set('notepad', $notepad.find('textarea').val(), function() {}, true);
      }).appendTo($notepad);
    }

    panel.get('notepad', function(data) {
      $notepad.find('textarea').val(data);
      panel.haveServerSync(function(have) {
        if(have) {
          panel.auth(function() {
            $.ajax('http://new.gwpanel.org/settings.php?auth_key=' + panel.authKey + '&notepad_load=1', {
              type: 'GET',
              success: function(data) {
                if(data.length) {
                  $notepad.find('textarea').val(data);
                }
                $(document.body).removeClass('ajax-loading');
                $notepad.fadeIn();
                $notepad.find('textarea').focus();
              }, error: function() {
                $notepad.fadeIn();
                panel.showFlash('Произошла ошибка во время передачи данных. Попробуйте перезагрузить страницу (клавиша F5)');
              }
            });
          });
        } else {
          $(document.body).removeClass('ajax-loading');
          $notepad.fadeIn();
          $notepad.find('textarea').focus();
        }
      });
    }, true);
  }
  
});
})(window.__panel, jQuery);