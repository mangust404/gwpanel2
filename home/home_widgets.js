(function(panel) {

  function home_formatTime(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s - h * 3600) / 60);
    var s = s - h * 3600 - m * 60;
    if(isNaN(h) || isNaN(m)) return '';
    return (h > 0? (h < 9? '0' + h: h) + ':': '') + (m < 10? '0' + m: m) + ':' + (s < 10? '0' + s: s);
  }

  function home_health_timer(health) {
    var width = Math.round(100 * 100 * this.hp_current / health.hp_max) / 100;
    this.progressBar.css({width: width + '%'});
    //this.progressContainer.attr('title', width + '%');
    if(width >= 80) {
      if(this.progressImg.css('opacity') == 0.2) {
        var width = parseInt(this.progressImg.css({opacity: 0.9}).attr('width'));
        var count = 0;
        var blinkInterval = setInterval(function() {
          if(count > 5) {
            clearInterval(blinkInterval);
            return; 
          }
          var curWidth = parseInt(this.progressImg.attr('width'));
          if(curWidth == width) {
            this.progressImg.css({margin: '-2px 0 0 -2px'}).attr('width', width + 4);
          } else {
            this.progressImg.css({margin: '0'}).attr('width', width);
          }
          count++;
        }, 150);
      }
    } else {
      this.progressImg.css({opacity: 0.2});
    }
    var text;
    switch(this.timerType) {
      case 0: 
        text = parseInt(width) + '%';
      break;
      case 1: 
        text = width > 80? 
          home_formatTime(parseInt((health.hp_max - this.hp_current) / health.hp_speed)): 
          home_formatTime(parseInt((health.hp_max - (health.hp_max * 20 / 100) - 
            this.hp_current) / health.hp_speed));
      break;
      case 2:
        text = home_formatTime(parseInt((health.hp_max - this.hp_current) / health.hp_speed));
      break;
    }
    this.progressText.html(text);
    this.progressBarText.html(text);
    
    this.hp_current += health.hp_speed;
    if(this.hp_current >= health.hp_max) {
      this.progressBar.css({width: '100%'});
      this.progressText.html('100%');
      this.progressBarText.html('100%');
      health.hp_current = health.hp_start = health.hp_max;
      if(this.options.autohide) this.css({display: 'none'});
      clearInterval(this.healthUpdInterval);
      this.healthUpdInterval = false;
      this.hp_current = false;
      __panel.set('health', health);
    } else {
      health.hp_start = this.hp_current;
      __panel.set('health', health);
    }
  }
  
  function home_health_progress(init, health) {
    if(((!this.hp_current && health.hp_start != health.hp_max) || this.hp_current < health.hp_start || init)) {
      if(this.healthUpdInterval) {
        clearInterval(this.healthUpdInterval);
      } else {
        if(health.hp_start / health.hp_max > 0.8) {
          this.progressImg.css({opacity: 0.9});
        }
      }
      this.show();
      var width = Math.round(100 * 100 * this.hp_current / health.hp_max) / 100;
      this.progressBar.css({width: width + '%'});
      
      this.hp_current = health.hp_start;
      var that = this;
      this.healthUpdInterval = setInterval(function() {
        home_health_timer.apply(that, [health]);
      }, 1000);
    }
    if(health.hp_start == health.hp_max) {
      this.progressBar.css({width: '100%'});
      if(this.options.autohide) this.css({display: 'none'});
    }
  }
  
jQuery.extend(panel, {
  home_health_widget: function(options) {
    var that = this;
    this.options = options;
    options.size = options.size || 2;
    this.progressImg = jQuery('<img src="' + __panel.path_to_theme() + '/icons/heart.png" width=' + (options.size * 11 + 5) + '"/>');
    this.hide().css({
      height: 'auto'
    }).append(this.progressImg);
    if(!options.autohide) this.show();
    __panel.loadCSS('home/home_widget.css');
    this.progressBarText = jQuery('<div class="progress-bar-text"></div>');
    this.progressBar = jQuery('<div class="progress-bar"></div>').css({
      height: options.size * 10, 
      'line-height': options.size * 10 + 'px'
    }).append(this.progressBarText);
    this.progressText = jQuery('<div class="text"></div>')
      .css({'line-height': options.size * 10 + 'px'});
    this.timerType = options.type;
    
    this.progressContainer = jQuery('<div class="progress-container"></div>')
      .append(this.progressBar)
      .append(this.progressText)
      .appendTo(this)
      .css({
        height: options.size * 10
      })
      .attr('title', 'Нажмите для переключения вида')
      .click(function() {
        options.type++;
        if(options.type > 2 || isNaN(options.type)) options.type = 0;
        that.timerType = options.type;
        __panel.setWidgetOptions(options, that);
        __panel.get('health', function(health) {
          home_health_timer.apply(that, [health]);
        });
        switch(that.timerType) {
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
        return false;
      });
    this.timer100 = jQuery('<div class="this.timer100"></div>');
    this.timer80 = jQuery('<div class="this.timer80"></div>');
    jQuery('<div class="timers"></div>')
      .append(this.timer100)
      .append(this.timer80)
      .appendTo(this);
    switch(options.size) {
      case 1:
        this.progressBarText.css({'font-size': '10px'});
        this.progressText.css({'font-size': '10px'});
      break;
      case 2:
        this.progressBarText.css({'font-size': '12px'});
        this.progressText.css({'font-size': '12px'});
      break;
    }
    __panel.get('health', function(health) {
      home_health_progress.apply(that, [false, health]);
    });
    __panel.bind('hp_update', function(health) {
      __panel.set('health', health);
      home_health_progress.apply(that, [true, health]);
    });
  }
});
})(window.__panel);