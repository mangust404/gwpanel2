(function(panel, $) {
  var slots = {
    'Голова': 'hd',
    'Левая рука': 'lh',
    'Правая рука': 'rh',
    'В руках': 'bh',
    'Корпус': 'bd',
    'Спина': 'bk',
    'Граната': 'gr',
    'Пояс': 'bt',
    'Ноги': 'ft',
    'Транспорт': 'tr',
    'Левый': 'lp',
    'Правый': 'rp',
    'Очки': 'gl',
    'Чипсет': 'ch',
  }

  var is_edit = false;

jQuery.extend(panel, {
  // Функция получения ссылок на смену транспорта
  getSwitchTransportLink: function(transport_id) {
    return new Promise(function(resolve, reject) {
      $.ajax('/items.php', {
        success: function(data) {
          var $data = $(data), $take_off_link, $dress_on_link, $sw_link, prev_transport_id;

          // Определяем текущий надетый транспорт
          // Находим ссылку "убрать" для слота "Транспорт"
          $take_off_link = $data.find('a[href*="take_off=transport"]')
            // переходим к родителю
            .parents('tr')
            // находим ссылку на предмет
            .find('a[href*="item_id="]');

            // Ссылка "Убрать" присутсвует, вытаскиваем item_id надетого предмета.
          if ($take_off_link.length > 0) {
            prev_transport_id = $take_off_link.attr('href').split('item_id=')[1];
          }

          if (prev_transport_id == transport_id) {
            // Указанный транспорт уже надет.
            resolve([null, null, null]);
          }

          $dress_on_link = $data.find('a[href*="' + transport_id + '"]');
          if ($dress_on_link.length > 0) {
            $sw_link = $dress_on_link.parents('tr').find('a:contains("Транспорт")');
          }

          if ($sw_link && $sw_link.length > 0) {
            // ссылка на надевание найдена, успешное завершение промиса
            resolve([$sw_link.attr('href'), transport_id, prev_transport_id]);
            return;
          }

          reject('Не найти ссылку чтобы надеть указанный транспорт');
        },
        error: function() {
          reject('ошибка передачи данных');
        }
      });
    });
  },

  // Функция смены транспорта на тот, с которым происходит перемещение в другой сектор.
  switchTransport: function(args) {
    var transport_link = args[0], transport_id = args[1], prev_transport_id = args[2];

    return new Promise(function(resolve, reject) {
      if (!transport_link || !transport_id) {
        // Ничего надевать не нужно, всё уже надето.
        return resolve();
      }
      $.ajax(transport_link, {
        success: function(data) {
          // Проверка слота "транспорт"
          var $data = $(data), prev_transport_dress_link, $prev_transport_dress_link, $take_off_link;

          // Находим ссылку "убрать" для слота "Транспорт"
          $take_off_link = $data.find('a[href*="take_off=transport"]')
            // переходим к родителю
            .parents('tr')
            // находим ссылку на предмет
            .find('a[href*="item_id="]');

          if ($take_off_link.length > 0 && $take_off_link.attr('href').indexOf(transport_id) !== -1) {
            // Траспорт надет правильно

            if (prev_transport_id) {
              // Находим ссылку на надевание предыдущего транспорта если он был надет
              $prev_transport_dress_link = $data.find('a[href*="' + prev_transport_id + '"]')
                                                              .parents('tr').find('a[href*="&take=1"');
              if ($prev_transport_dress_link.length > 0) {
                // Ссылка найдена, передаём её в следующий промис.
                prev_transport_dress_link = $prev_transport_dress_link.attr('href');
              }
            }
            resolve([prev_transport_dress_link, prev_transport_id]);
            return;
          }
          reject('не удалось надеть транспорт для перемещения');
        },
        error: function() {
          reject('ошибка передачи данных');
        }
      });
    });
  },

  // Функция возврата предыдущего надетого транспорта.
  returnOriginalTransport: function(args) {
    var prev_transport_dress_link = args[0], prev_transport_id = args[1];

    return new Promise(function(resolve, reject) {
      if (prev_transport_dress_link && prev_transport_id) {
        // Был надет другой транспорт, надеваем его обратно.
        $.ajax(prev_transport_dress_link, {
          success: function(data) {
            // Проверяем надетый транспорт
            var $data = $(data), $take_off_link;

            // Определяем текущий надетый транспорт
            // Находим ссылку "убрать" для слота "Транспорт"
            $take_off_link = $data.find('a[href*="take_off=transport"]')
              // переходим к родителю
              .parents('tr')
              // находим ссылку на предмет
              .find('a[href*="item_id="]');

            if ($take_off_link.length > 0 && $take_off_link.attr('href').indexOf(prev_transport_id) !== -1) {
              // Всё верно, надет нужный транспорт
              resolve();
              return;
            }
            reject('не удалось вернуть предыдущий транспорт, возможно персонаж в заявке на бой');
          },
          error: function() {
            reject('ошибка передачи данных');
          }
        });
      }
      else {
        // Транспорта надето не было, просто снимаем текущий.
        $.ajax('/home.do.php?take_off=transport', {
          success: function() {
            var $take_off_link;
            // Находим ссылку "Убрать" из слота транспорт, её не должно быть
            $take_off_link = $data.find('a[href*="take_off=transport"]');

            if ($take_off_link.length == 0) {
              resolve();
              return;
            }

            // Ссылка "Убрать" присутсвует, значит что-то пошло не так, возможно персонаж
            // в заявке на бой.
            reject('не удалось снять транспорт, возможно персонаж в заявке на бой');

          },
          error: function() {
            reject('ошибка передачи данных');
          }
        });
      }
    });
  }

});
})(window.__panel, jQuery);