(function(panel, $) {

  var mmoves = {};
  var mlinks = {};
  var keys = {};
  var $input;

  function keyup(e) {
    switch(e.keyCode) {
      case 37: case 100: keys['left'] = true; break;
      case 38: case 104: keys['up'] = true; break;
      case 39: case 102: keys['right'] = true; break;
      case 40: case 98: keys['down'] = true; break;
      case 103: case 36: keys['up'] = keys['left'] = true; break;
      case 105: case 33: keys['up'] = keys['right'] = true; break;
      case 99: case 34: keys['right'] = keys['down'] = true; break;
      case 97: case 35: keys['down'] = keys['left'] = true; break;
      case 101: case 13: keys['center'] = true; break;
      default: break;
    };
    var __goto;
    if(keys['left'] && keys['up']) {
      __goto = mlinks['topleft'].href;
    } else if(keys['right'] && keys['up']) {
      __goto = mlinks['topright'].href;
    } else if(keys['left'] && keys['down']) {
      __goto = mlinks['bottomleft'].href;
    } else if(keys['right'] && keys['down']) {
      __goto = mlinks['bottomright'].href;
    } else if(keys['left'] && mlinks['left']) {
      __goto = mlinks['left'].href;
    } else if(keys['right'] && mlinks['right']) {
      __goto = mlinks['right'].href;
    } else if(keys['up'] && mlinks['top']) {
      __goto = mlinks['top'].href;
    } else if(keys['down'] && mlinks['bottom']) {
      __goto = mlinks['bottom'].href;
    } else if(keys['center']) {
      if(mlinks['center']) __goto = mlinks['center'].href;
      else {
        var d = new Date();
        __goto = location.href.split('?')[0] + '?' + d.getTime();
      };
    };
    if(__goto) {
      panel.gotoHref(__goto);
      mmoves = {};
      mlinks = {};
    }
    keys = {};
  }

  function keydown(e) {
    switch(e.keyCode) {
      case 37: keys['left'] = true; return false;
      case 38: keys['up'] = true; return false;
      case 39: keys['right'] = true; return false;
      case 40: keys['down'] = true; return false;
      default: break;
    };
  }



jQuery.extend(__panel, {
  outland_highlight: function() {
    __panel.loadCSS('outland/outland.css');
    $(document.body).addClass('walk-php');
    for(var i = 0; i < document.links.length; i++) {
      var link = document.links[i];
      if(link.href.indexOf('.php?w=') != -1 && link.href.indexOf('walk') != -1) {
        if(link.innerHTML.indexOf('t_a.gif') != -1) {
          link.firstChild.className = 'attack';
        } else if(link.innerHTML.indexOf('t_o.gif') != -1) {
          link.firstChild.className = 'busy';
        } else if(link.innerHTML.indexOf('t_b.gif') != -1) {
          link.firstChild.className = 'battle';
        };
      };
    };
  },
  
  outland_auto_sail: function(options) {
    var port = parseInt(options.port); 
    if(!isNaN(port)) {
      var $e = $('select[name=sectorin]');
      if($e.length) {
        $e.val(port).closest('form').submit();
      }
    }
  },

  outland_hotkeys: function() {
    mmoves = {};
    mlinks = {};
    for(var i = 0; i < document.links.length; i++) {
      var link = document.links[i];
      if(link.href.search(/walk(\.op|\.ep|\.p|\.bp)\.php\?w=[0-9]+&wx=([0-9\-]+)&wy=([0-9\-]+)/) != -1 && (link.innerHTML.indexOf('t.gif') != -1 || link.innerHTML.indexOf('turist') != -1)) {
        var x = parseInt(RegExp.$2);
        var y = parseInt(RegExp.$3);
        if(!mmoves['topleft'] || (mmoves['topleft'][0] + mmoves['topleft'][1] > x + y)) {
          mmoves['topleft'] = [x, y];
          mlinks['topleft'] = link;
        };
        if(!mmoves['topright'] || (mmoves['topright'][0] - mmoves['topright'][1] < x - y)) {
          mmoves['topright'] = [x, y];
          mlinks['topright'] = link;
        };
        if(!mmoves['bottomright'] || (mmoves['bottomright'][0] + mmoves['bottomright'][1] < x + y)) {
          mmoves['bottomright'] = [x, y];
          mlinks['bottomright'] = link;
        };
        if(!mmoves['bottomleft'] || (mmoves['bottomleft'][1] - mmoves['bottomleft'][0] < y - x)) {
          mmoves['bottomleft'] = [x, y];
          mlinks['bottomleft'] = link;
        };
        if(!mmoves['left'] || (mmoves['left'][0] > x || (mmoves['left'][0] >= x && (Math.abs(mmoves['left'][0]) - Math.abs(mmoves['left'][1]) < Math.abs(x) - Math.abs(y))))) {
          mmoves['left'] = [x, y];
          mlinks['left'] = link;
        };
        if(!mmoves['right'] || (mmoves['right'][0] < x || (mmoves['right'][0] <=x && (Math.abs(mmoves['right'][0]) - Math.abs(mmoves['right'][1]) < Math.abs(x) - Math.abs(y))))) {
          mmoves['right'] = [x, y];
          mlinks['right'] = link;
        };
        if(!mmoves['top'] || (mmoves['top'][1] > y || (mmoves['top'][0] >= y && (Math.abs(mmoves['top'][1]) - Math.abs(mmoves['top'][0]) < Math.abs(y) - Math.abs(x))))) {
          mmoves['top'] = [x, y];
          mlinks['top'] = link;
        };
        if(!mmoves['bottom'] || (mmoves['bottom'][1] < y || (mmoves['bottom'][1] <= y && (Math.abs(mmoves['bottom'][1]) - Math.abs(mmoves['bottom'][0]) < Math.abs(y) - Math.abs(x))))) {
          mmoves['bottom'] = [x, y];
          mlinks['bottom'] = link;
        };
      } else if(!mlinks['center'] && link.innerHTML.indexOf('anchor.gif') != -1) {
        mlinks['center'] = link;
      };
    };
    if(mlinks['left']) mlinks['left'].innerHTML = '<div class="move_left">' + mlinks['left'].innerHTML + '</div>';
    if(mlinks['right']) mlinks['right'].innerHTML = '<div class="move_right">' + mlinks['right'].innerHTML + '</div>';
    if(mlinks['top']) mlinks['top'].innerHTML = '<div class="move_top">' + mlinks['top'].innerHTML + '</div>';
    if(mlinks['bottom']) mlinks['bottom'].innerHTML = '<div class="move_bottom">' + mlinks['bottom'].innerHTML + '</div>';
    if(mlinks['topleft']) mlinks['topleft'].innerHTML = '<div class="move_topleft">' + mlinks['topleft'].innerHTML + '</div>';
    if(mlinks['topright']) mlinks['topright'].innerHTML = '<div class="move_topright">' + mlinks['topright'].innerHTML + '</div>';
    if(mlinks['bottomright']) mlinks['bottomright'].innerHTML = '<div class="move_bottomright">' + mlinks['bottomright'].innerHTML + '</div>';
    if(mlinks['bottomleft']) mlinks['bottomleft'].innerHTML = '<div class="move_bottomleft">' + mlinks['bottomleft'].innerHTML + '</div>';
    $(window).focus();

    keys = {};
    $(window).off('keydown').on('keydown', keydown)
    .off('keyup').on('keyup', keyup);

    var $input;
    function unfocus() {
      $input = $('<input type="text">').css({
        height: 1,
        width: 1,
        position: 'absolute',
        autocomplete: 'off'
      }).prependTo(document.body).focus();
      if(panel.panel_ajaxify) {
        setTimeout(function() {
          $input.remove();
        }, 10);
      }
    }

    if(panel.panel_ajaxify) {
      $(window).on('load', unfocus);
    } else {
      unfocus();
    }

    $('#newline').keydown(function(e) {
      e.stopPropagation();
    }).keyup(function(e) {
      e.stopPropagation();
    });
    panel.onunload(function() {
      $(window).off('keydown', keydown)
        .off('keyup', keyup);
      $(window).off('load', unfocus);
      $input.remove();
    });
  },

  outland_auto_close: function() {
    var e = document.getElementsByName('startbattle');
    if(e.length) document.forms[1].submit();
  },

  outland_auto_pick: function(options) {
    var $button;
    var loot, i, length, take, ignoredLoot;

    $button = $('input[value="Взять"]');

    if($button.length){
      take = true;
      loot = $button.closest('table').find('b').eq(1).text();
      ignoredLoot = options.type_loot;

      for(i = 0, length = ignoredLoot.length; i <length; i++){
        if(ignoredLoot[i] == loot){
          take = false;
          break;
        }
      }
      
      if(take){
        $button.trigger('click');
      }
    }
  },

  outland_check_set: function(options) {

  }

})})(window.__panel, jQuery);