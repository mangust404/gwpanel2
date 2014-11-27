(function(panel, $) {
jQuery.extend(panel, {
  /**
  * Получение списка комплектов
  */
  items_get_sets_async: function(callback) {
    var sets = {};
    var links = $('a[href*="/home.do.php?putset="]');
    if(links.length) {
      /// ссылки с комплектами найдены на текущей странице
      links.each(function() {
        sets[$(this).attr('href').split('=')[1]] = $(this).html();
      });
      callback(sets);
    } else {
      $.ajax('/items.php', {
        success: function(data) {
          links = $(data).find('a[href*="/home.do.php?putset="]');
          links.each(function() {
            sets[$(this).attr('href').split('=')[1]] = $(this).html();
          });
          callback(sets);
        },
        error: function() {
          callback({});
        }
      })
    }
  },

  items_synd_grenades: [
    'lightss',
    'lightsm',
    'rgd2s',
    'grenade_dg1',
    'fg5',
    'molotov',
    'hellsbreath',
    'napalm',
    'ghtb',
    'me85'
  ],

  items_skills_parser: function(callback) {
    panel.loadScript('panel/panel_ajax.js', function() {
      $.ajax('http://www.ganjawars.ru/home.skills.php', {
        success: function(data) {
          var result = {
            all: {},
            current: {}
          };

          var $div = $('<div>').hide().appendTo(document.body)
            .html(data)
            .find('div:hidden').remove().end()
            .find('input[type=radio]').each(function() {
              if(!result.all[this.name]) {
                result.all[this.name] = {};
              }
              if(this.value) {
                result.all[this.name][this.value] = $(this).closest('tr').find('a').text();
              } else {
                result.all[this.name][''] = 'Нет';
              }
              if(this.checked) {
                result.current[this.name] = this.value; 
              }
            }).end();

          callback(result);
          //$div.remove();
        }
      });
    });
  },

  items_all_skills_async: function(section, callback) {
    panel.getCached(panel.items_skills_parser, function(skills) {
      callback(skills.all[section]);
    }, 60);
  },

  items_current_skills_async: function(section, callback) {
    panel.getCached(panel.items_skills_parser, function(skills) {
      callback(skills.current[section]);
    }, 60);
  },

  items_skills_buttons: function(callback) {
    var result = {};
    $.each(panel.getAllButtons('items_skills_button'), function(i, btn) {
      result[btn.button.id] = btn.button.title || ('Набор #' + (i + 1));
    });
    return result;
  }
});
})(window.__panel, jQuery);