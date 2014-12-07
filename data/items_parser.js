(function($, panel) {
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

  var skills = {
    'Владение пистолетами': 'pistols',
    'Владение тяжелым оружием': 'heavy',
    'Владение снайперскими винтовками': 'snipe',
    'Владение автоматическим оружием': 'auto',
    'Владение дробовиками': 'shotguns',
    'Владение гранатами и гранатометами': 'grenades'
  }

	$.extend(panel, {
    items_parser: function(callback) {
      var result = {};
      /// Гос предметы
      var shops = {
        'gos': '/shop.php',
        'art': '/shopc.php',
        'synd': '/sshop.php',
        'rent': '/rent-a-gun.php'
      };
      jQuery.each(shops, function(shopType, shopUrl) {
        jQuery.ajax('http://www.ganjawars.ru' + shopUrl, {
          success: function(shopData) {
            jQuery(shopData).find('a[href*="' + shopUrl + '?shop="]').each(function() {
              var itemType = this.href.split(shopUrl + '?shop=')[1].split('_')[1];
              jQuery.ajax(this.href, {
                success: function(itemTypeData) {
                  var $itemTypeData = jQuery(itemTypeData);
                  $itemTypeData.find('img[src$="_b.jpg"]').each(function() {
                    var item_id = this.src.split('img/items/')[1].split('_b.jpg')[0];
                    var descr = jQuery(this).closest('td').next().html();
                    descr = descr.replace(/<br>/g, "\n");
                    descr = jQuery(descr).text();

                    var itemData = {};

                    itemData.name = jQuery(this).closest('tr').prev().find('td').text();

                    if(descr.search(/Стоимость:\s?\$([0-9\,]+)/) > -1) {
                      var cost = RegExp.$1.replace(/,/g, '');
                      itemData.cost = parseInt(cost);
                    }
                    if(descr.search(/Вес:\s?([0-9]+)/) > -1) {
                      itemData.weight = parseInt(RegExp.$1);
                    }
                    if(descr.search(/Прочность:\s?([0-9]+)/) > -1) {
                      itemData.dura = parseInt(RegExp.$1);
                    }
                    if(descr.search(/Слоты:\s?([^\n]+)/) > -1) {
                      itemData.slots = [];
                      var __slots = RegExp.$1.toLowerCase();
                      for(var key in slots) {
                        if(__slots.indexOf(key.toLowerCase()) > -1) {
                          itemData.slots.push(slots[key]);
                        }
                      }
                    }
                    if(descr.search(/Минимальный боевой уровень: ([0-9]+)/) > -1) {
                      itemData.minLvl = parseInt(RegExp.$1);
                    }
                    if(descr.search(/Повреждение: ([0-9\-]+)/) > -1) {
                      itemData.damage = RegExp.$1;
                    }
                    if(descr.search(/Точность стрельбы: ([0-9\%]+)/) > -1) {
                      itemData.precision = parseInt(RegExp.$1);
                    }
                    if(descr.search(/Дальность стрельбы: ([0-9]+)/) > -1) {
                      itemData.range = parseInt(RegExp.$1);
                    }
                    if(descr.search(/Количество выстрелов за раз: ([0-9]+)/) > -1) {
                      itemData.shots = parseInt(RegExp.$1);
                    }

                    if(descr.search(/Используемое умение: ([^\n]+)/) > -1) {
                      for(var key in skills) {
                        if(RegExp.$1.indexOf(skills[key]) > -1) {
                          itemData.skills = skills[key];
                        }
                      }
                    }

                    if(descr.search(/Радиус поражения: ([0-9]+)/) > -1) {
                      itemData.area = parseInt(RegExp.$1);
                    }

                    itemData.shop = shopType;
                    itemData.type = itemType;

                    if(itemData.damage) {
                      itemData.isWeapon = true;
                    }

                    if(['wear', 'masks', 'boots', 'helmets', 'armour'].indexOf(itemType) > -1) {
                      itemData.isWear = true;
                    }
                    result[item_id] = itemData;
                  });
                },
                async: false
              });
            });
          },
          async: false
        });
      });
  
      if(callback) {
        callback(result);
        return;
      }
      return result;
    }
  });
})(jQuery, __panel);