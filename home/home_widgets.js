(function(panel) {
  var progressBar, progressContainer, progressText, progressImg, timer100, timer80;
  var healthUpdInterval;
  var hp_current;
  var timerType;
  var health, options, widget;
  
  function home_formatTime(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s - h * 3600) / 60);
    var s = s - h * 3600 - m * 60;
    return (h > 0? (h < 9? '0' + h: h) + ':': '') + (m < 10? '0' + m: m) + ':' + (s < 10? '0' + s: s);
  }

  function home_health_timer() {
    var width = Math.round(100 * 100 * hp_current / health.hp_max) / 100;
    progressBar.css({width: width + '%'});
    //progressContainer.attr('title', width + '%');
    if(width >= 80) {
      if(progressImg.css('opacity') == 0.2) {
        var width = parseInt(progressImg.css({opacity: 0.9}).attr('width'));
        var count = 0;
        var blinkInterval = setInterval(function() {
          if(count > 5) {
            clearInterval(blinkInterval);
            return; 
          }
          var curWidth = parseInt(progressImg.attr('width'));
          if(curWidth == width) {
            progressImg.css({margin: '-2px 0 0 -2px'}).attr('width', width + 4);
          } else {
            progressImg.css({margin: '0'}).attr('width', width);
          }
          count++;
        }, 150);
      }
    } else {
      progressImg.css({opacity: 0.2});
    }
    var text;
    switch(timerType) {
      case 0: 
        text = parseInt(width) + '%';
      break;
      case 1: 
        text = width > 80? home_formatTime(parseInt((health.hp_max - hp_current) / health.hp_speed)): home_formatTime(parseInt((health.hp_max - (health.hp_max * 20 / 100) - hp_current) / health.hp_speed));
      break;
      case 2:
        text = home_formatTime(parseInt((health.hp_max - hp_current) / health.hp_speed));
      break;
    }
    progressText.html(text);
    progressBarText.html(text);
    
    hp_current += health.hp_speed;
    if(hp_current >= health.hp_max) {
      progressBar.css({width: '100%'});
      progressText.html('100%');
      progressBarText.html('100%');
      health.hp_current = health.hp_start = health.hp_max;
      if(options.autohide) widget.css({display: 'none'});
      clearInterval(healthUpdInterval);
      healthUpdInterval = false;
      hp_current = false;
      __panel.set('health', health);
    } else {
      health.hp_start = hp_current;
      __panel.set('health', health);
    }
  }
  
  function home_health_progress(widget, init) {
    if(((!hp_current && health.hp_start != health.hp_max) || hp_current < health.hp_start || init)) {
      if(healthUpdInterval) {
        clearInterval(healthUpdInterval);
      } else {
        if(health.hp_start / health.hp_max > 0.8) {
          progressImg.css({opacity: 0.9});
        }
      }
      widget.show();
      var width = Math.round(100 * 100 * hp_current / health.hp_max) / 100;
      progressBar.css({width: width + '%'});
      
      hp_current = health.hp_start;
      healthUpdInterval = setInterval(home_health_timer, 1000);
    }
    if(health.hp_start == health.hp_max) {
      progressBar.css({width: '100%'});
      if(options.autohide) widget.css({display: 'none'});
    }
  }
  
jQuery.extend(panel, {
  home_health_widget: function(_widget, _options) {
    widget = _widget;
    options = _options;
    options.size = options.size || 2;
    progressImg = jQuery('<img src="' + __panel.path_to_theme() + '/icons/heart.png" width=' + (options.size * 11 + 5) + '"/>');
    widget.hide().css({
      height: 'auto'
    }).append(progressImg);
    __panel.loadCSS('home/home_widget.css');
    progressBarText = jQuery('<div class="progress-bar-text"></div>');
    progressBar = jQuery('<div class="progress-bar"></div>').css({
      height: options.size * 10, 
      'line-height': options.size * 10 + 'px'
    }).append(progressBarText);
    progressText = jQuery('<div class="text"></div>')
      .css({'line-height': options.size * 10 + 'px'});
    timerType = options.type;
    
    progressContainer = jQuery('<div class="progress-container"></div>')
      .append(progressBar)
      .append(progressText)
      .appendTo(widget)
      .css({
        height: options.size * 10
      })
      .attr('title', 'Нажмите для переключения вида')
      .click(function() {
        options.type++;
        if(options.type > 2 || isNaN(options.type)) options.type = 0;
        timerType = options.type;
        __panel.setWidgetOptions(options, widget);
        home_health_timer();
        switch(timerType) {
          case 0:
            jQuery(this).attr('title', 'Процент выздоровления, от 0% до 100%');
          break;
          case 1:
            jQuery(this).attr('title', 'Таймер выздоровления до 80%, а затем оставшееся время выздоровления до 100%');
          break;
          case 2:
            jQuery(this).attr('title', 'Таймер выздоровления до 100%');
          break;
        }
      });
    timer100 = jQuery('<div class="timer100"></div>');
    timer80 = jQuery('<div class="timer80"></div>');
    jQuery('<div class="timers"></div>')
      .append(timer100)
      .append(timer80)
      .appendTo(widget);
    switch(options.size) {
      case 1:
        progressBarText.css({'font-size': '10px'});
        progressText.css({'font-size': '10px'});
      break;
      case 2:
        progressBarText.css({'font-size': '12px'});
        progressText.css({'font-size': '12px'});
      break;
    }
    __panel.get('health', function(_health) {
      health = _health;
      home_health_progress(widget);
    });
    __panel.bind('hp_update', function(_health) {
      __panel.set('health', _health);
      health = _health;
      home_health_progress(widget, true);
    });
  }
});
})(window.__panel);