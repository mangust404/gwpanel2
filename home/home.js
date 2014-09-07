(function(panel) {
jQuery.extend(panel, {
  home_durability: function() {
    __panel.loadScript('data/items.js', function() {
    for(var i = 0; i < document.links.length; i++) {
      if(document.links[i].href.indexOf('?item_id=') != -1 && (document.links[i].innerHTML.indexOf('<img') != -1 || document.links[i].innerHTML.indexOf('<IMG') != -1)) {
        try {
          var img = document.links[i].firstChild.tagName && document.links[i].firstChild.tagName.toUpperCase() == 'IMG'? document.links[i].firstChild: document.links[i].childNodes[1];
          if(!img) continue;
          var ar = img.title.split('/');
          if(ar.length < 2) continue;
          for(var j = 0; j < ar.length; j++) {
            if(ar[j] < 4) ar[j] = '<font style="color: red; font-weight: bold;">' + ar[j] + '</font>';
          };
          var mods = document.links[i].href.match(/item_id=([^=]+)&m=([0-9]+)/);
          var mod_add = '';
          if(mods) {
            var item_id = mods[1];
            var mod = mods[2];
              if(__panel.wear_string.indexOf(item_id) == -1) {
                //Это оружие
                if(__panel.mods_weapon[mod]) mod_add = '<font style="color: green; display: block; font-weight: bold; position: absolute; margin: -26px 0 0 17px; background: #ecffed; padding: 1px 1px 0px;" title="' + __panel.mods_weapon[mod][1] + ', ' + __panel.mods_weapon[mod][3] + '; частота появления: ' + __panel.mods_weapon[mod][2] + '">' + __panel.mods_weapon[mod][0] + '</font>';
              } else {
                //Это броня
                if(__panel.mods_wear[mod]) mod_add = '<font style="color: green; display: block; font-weight: bold; position: absolute; margin: -26px 0 0 17px; background: #ecffed; padding: 1px 1px 0px;" title="' + __panel.mods_wear[mod][1] + ', ' + __panel.mods_wear[mod][3] + '; частота появления: ' + __panel.mods_wear[mod][2] + '">' + __panel.mods_wear[mod][0] + '</font>';
              };
          }
          document.links[i].parentNode.innerHTML += '<font style="display: block; text-align: center; font-size: 8px; color: #809980;">' +  ar[0] + '/' + ar[1] + (mod_add? mod_add: '') + '</font>';
        } catch(e) {}
      };
    };
    });
  }
});

panel.home_durability.description = 'Отображение прочности предметов на домашней страничке';
})(window.__panel);