(function(panel, $) {
jQuery.extend(panel, {

  home_get_items: function(items, callback) {
    panel.loadScript('data/items_db.js', function() {
      var result = {};
      $.each(items, function(i, item_id) {
        result[item_id] = panel.items_db[item_id];
      });
      callback(result);
    });
  },

  home_durability: function(options) {
    var $items = $('td[bgcolor="#e9ffe9"]:has(img[src$="_s.jpg"])')
                   .find('img[src$="_s.jpg"]').closest('a');
    var item_ids = $items.map(function() {
      return this.href.split('item_id=')[1].split('&')[0];
    });

    var f;
    eval('f = function(c) { __panel.home_get_items(' + JSON.stringify(item_ids.toArray()) + ', c) }');
    
    __panel.loadScript('data/items_mods.js', function() {
      panel.getCached(f, function(items) {
        $items.each(function() {
          var ar = this.href.split('item_id=')[1].split('&');
          var item_id = ar[0];
          var upgrade;
          var upgInfo;

          if(ar[1]) {
            var mod_ar = ar[1].split('=');
            if(mod_ar[0] == 'm' && parseInt(mod_ar[1]) > 0) {
              var modif_data;
              if(items[item_id] && items[item_id].isWear) {
                modif_data = __panel.mods_wear[mod_ar[1]];
              } else if(items[item_id] && items[item_id].isWeapon) {
                modif_data = __panel.mods_weapon[mod_ar[1]];
              }

              if(modif_data) {
                $('<font title="' + modif_data[1] + ', ' + modif_data[3] + 
                  '; частота появления: ' + modif_data[2] + '">' + modif_data[0] + '</font>')
                  .css({
                    color: 'green',
                    display: 'block',
                    'font-weight': 'bold',
                    position: 'absolute',
                    margin: '-26px 0 0 17px',
                    background: '#ecffed',
                    padding: '1px 1px 0px'
                  })
                  .appendTo(this.parentNode);
              }
            }

            if(mod_ar[0] == 'upg' && parseInt(mod_ar[1]) > 0) {
              upgrade = mod_ar[1];
            }
          }

          if(ar[2]) {
            var mod_ar = ar[2].split('=');
            if(mod_ar[0] == 'upg' && parseInt(mod_ar[1]) > 0) {
              upgrade = mod_ar[1];
            }
          }

          switch(upgrade) {
            case '1': upgInfo = ['D', 'увеличена дальность']; break;
            case '2': upgInfo = ['P', 'увеличен урон']; break;
            case '3': upgInfo = ['S', 'увеличено количество выстрелов']; break;
            case '10': upgInfo = ['D', 'увеличена броня']; break;
            case '11': upgInfo = ['A', 'увеличена активная броня']; break;
            case '12': 
              upgInfo = ['B']; 
              switch(items[item_id].type) {
                case 'helmets': upgInfo.push('бонус снайпера'); break;
                case 'armour': upgInfo.push('крепкий орешек'); break;
                case 'boots': upgInfo.push('второй шаг'); break;
              }
            break;
            case '13': 
              upgInfo = ['P']; 
              switch(items[item_id].type) {
                case 'helmets': upgInfo.push('увеличена меткость'); break;
                case 'armour': upgInfo.push('увеличена выносливость'); break;
                case 'boots': upgInfo.push('увеличена сила'); break;
              }
            break;
          }

          if(upgInfo) {
            /// Добавляем подсказку по улучшению
            $('<font title="' + upgInfo[1] + '">' + upgInfo[0] + '</font>')
              .css({
                color: '#900',
                display: 'block',
                'font-weight': 'bold',
                position: 'absolute',
                margin: '-62px 0 0 22px',
                background: '#ecffed',
                padding: '0 1px 0px'
              })
              .appendTo(this.parentNode);
          }

        });
      }, 86400);
    });
  }
});
})(window.__panel, jQuery);