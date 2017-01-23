(function(panel, $) {
jQuery.extend(panel, {

  items_home_checkboxes: function() {
    var mouseDown = false, // Флаг зажатия мышки
        checkSetup = true; // Флаг установки или снятия чекбокса

    /// При нажатии мышки на чекбокс и ведении вниз, отмечаем чекбоксы
    $('input[type="checkbox"][name*="items["]').mousedown(function() {
      mouseDown = true;
      if ($(this).prop('checked')) {
        // Снятие чекбоксов
        checkSetup = false;
      }
      else {
        // Установка чекбоксов
        checkSetup = true;
      }
      $eventCaller = $(this);

      $(document.body).one('mouseup', function() {
        mouseDown = false;
        return false;
      });

      return false;
    })
    .mouseover(function() {
      if (mouseDown) {
        $(this).prop('checked', checkSetup);
      }
      return false;
    })
    .closest('tr').mouseover(function() {
      // При проводе мышки по всей строке чекбокс тоже должен установиться или отжаться.
      if (mouseDown) {
        $(this).find('input[type="checkbox"]').trigger('mouseover');
      }
      return false;
    })
    .find('a, td').mouseover(function() {
      // При проводе мышки через ссылку на предмет, событие тоже должно срабатывать
      if (mouseDown) {
        $(this).parents('tr:first').find('input[type="checkbox"]').trigger('mouseover');
      }
      return false;
    });
  }

});
})(window.__panel, jQuery);