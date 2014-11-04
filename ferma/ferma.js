(function(panel, $) {
  var mmoves = {};
  var mlinks = {};
  var keys = {};

  function keydown(e) {
    switch(e.keyCode) {
      case 37: keys['left'] = true; return false;
      case 38: keys['up'] = true; return false;
      case 39: keys['right'] = true; return false;
      case 40: keys['down'] = true; return false;
      default: break;
    };
  }
  function keyup(e) {
    if(!$(document.body).hasClass('ferma-php')) return;
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
      case 32:           keys['space'] = true; break;
      default: break;
    };
    var __goto;
    if(keys['left'] && keys['up'] && mlinks['topleft']) {
      __goto = mlinks['topleft'];
    } else if(keys['right'] && keys['up'] && mlinks['topright']) {
      __goto = mlinks['topright'];
    } else if(keys['left'] && keys['down'] && mlinks['bottomleft']) {
      __goto = mlinks['bottomleft'];
    } else if(keys['right'] && keys['down'] && mlinks['bottomright']) {
      __goto = mlinks['bottomright'];
    } else if(keys['left'] && mlinks['left']) {
      __goto = mlinks['left'];
    } else if(keys['right'] && mlinks['right']) {
      __goto = mlinks['right'];
    } else if(keys['up'] && mlinks['top']) {
      __goto = mlinks['top'];
    } else if(keys['down'] && mlinks['bottom']) {
      __goto = mlinks['bottom'];
    } else if(keys['center']) {
      if($('input[value="Посадить везде"]').length) {
        $('input[value="Посадить везде"]').click();
        mlinks = {};
        return false;
      } else if($('input[value="Посадить"]').length) {
        $('input[value="Посадить"]').click();
        mlinks = {};
        return false;
      } else {
        __goto = $('a:contains("Собрать весь урожай"), a:contains("Вскопать"), a:contains("Собрать урожай"), a:contains("Полить")').last();
      }
    } else if(keys['space']) {
      __goto = $('td:contains("Ближайшее действие")').find('a');
    }

    if(__goto && __goto.length) {
      mlinks = {};
      $(window).off('keyup').off('keydown');
      panel.gotoHref(__goto.attr('href'));
      return false;
    }

    keys = {};
  }

jQuery.extend(__panel, {

  ferma_hotkeys: function() {
    mmoves = {};
    mlinks = {};
    var matches = $('img[src$="point2.gif"]').closest('a').attr('href').match(/x=([0-9]+)&y=([0-9]+)/);
    var x = parseInt(matches[1]);
    var y = parseInt(matches[2]);
    if(x > 0) {
      mlinks['left'] = $('a[href*="x=' + (x - 1) + '&y=' + y + '"]');
      if(y > 0) {
        mlinks['topleft'] = $('a[href*="x=' + (x - 1) + '&y=' + (y - 1) + '"]');
      }
      if(y < 6) {
        mlinks['bottomleft'] = $('a[href*="x=' + (x - 1) + '&y=' + (y + 1) + '"]');
      }
    }
    if(x < 6) {
      mlinks['right'] = $('a[href*="x=' + (x + 1) + '&y=' + y + '"]');
      if(y > 0) {
        mlinks['topright'] = $('a[href*="x=' + (x + 1) + '&y=' + (y - 1) + '"]');
      }
      if(y < 6) {
        mlinks['bottomright'] = $('a[href*="x=' + (x + 1) + '&y=' + (y + 1) + '"]');
      }
    }
    if(y > 0) {
      mlinks['top'] = $('a[href*="x=' + x + '&y=' + (y - 1) + '"]');
    }
    if(y < 6) {
      mlinks['bottom'] = $('a[href*="x=' + x + '&y=' + (y + 1) + '"]');
    }

    $(window).focus();

    keys = {};
    $(window).off('keydown').on('keydown', keydown)
    .off('keyup').on('keyup', keyup);

    panel.onunload(function() {
      $(window).off('keydown', keydown)
        .off('keyup', keyup);
    });
    panel.get('ferma_hide_hint', function(hide) {
      var $right_td = $($('table[background$="ferma_bg.jpg"]').parents('table').eq(1).get(0).rows[0].cells[1]);
      $right_td.css({position: 'relative'});
      var $hint = $('<div class="hint"></div>')
        .css({
          position: 'absolute',
          padding: '5px 10px',
          border: '1px dotted #040',
          opacity: '0.5',
          bottom: 0,
          left: 6,
          right: 0
        })
      .html('<h4 style="margin: 5px 0;">Горячие клавиши</h4>\
<p><b>Стрелки</b> &larr;&uarr;&rarr;&darr; &ndash; переход между грядками</p>\
<p><b>Пробел</b> &ndash; переход к &laquo;Ближайшему действию&raquo;</p>\
<p><b>Enter</b> &ndash; выполнение действия (собрать/полить/посадить)</p>')
      .appendTo($right_td);
      var $hide_link = $('<a>скрыть</a>').css({
        position: 'absolute',
        right: 8,
        top: 10,
        cursor: 'pointer',
        'font-size': 10
      }).click(function() {
        if($hide_link.html() == 'скрыть') {
          $hide_link.html('раскрыть');
          $hint.find('p').hide();
          panel.set('ferma_hide_hint', true, function() {}, true);
        } else {
          $hide_link.html('скрыть');
          $hint.find('p').show();
          panel.set('ferma_hide_hint', false, function() {}, true);
        }
      }).appendTo($hint);
      if(hide || $right_td.find('input[value="Посадить"]').length > 0) {
        $hide_link.html('раскрыть');
        $hint.find('p').hide();
      }
    }, true);
  }
  
})
})(__panel, jQuery);