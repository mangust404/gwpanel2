(function(panel, $) {

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
    if($('#hpheader').length > 0) {
      $('#hpheader font').html(parseInt(this.hp_current));
    }
    if(this.hp_current >= health.hp_max) {
      this.progressBar.css({width: '100%'});
      this.progressText.html('100%');
      this.progressBarText.html('100%');
      health.hp_current = health.hp_start = health.hp_max;
      if(this.options.autohide) this.css({display: 'none'});
      clearInterval(this.healthUpdInterval);
      this.healthUpdInterval = false;
      this.hp_current = false;
    } else {
      health.hp_start = this.hp_current;
    }
  }
  
  function home_health_progress(init, health) {
    if(!health) return;
    if(((!this.hp_current && health.hp_start != health.hp_max) || this.hp_current < health.hp_start || init)) {
      if(this.healthUpdInterval) {
        clearInterval(this.healthUpdInterval);
      } else {
        if(health.hp_start / health.hp_max > 0.8) {
          this.progressImg.css({opacity: 0.9});
        }
      }
      //this.show();
      var width = Math.round(100 * 100 * this.hp_current / health.hp_max) / 100;
      this.progressBar.css({width: width + '%'});
      
      this.hp_current = health.hp_start + health.hp_speed * parseInt(((new Date).getTime() - health.date) / 1000);
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
  
$.extend(panel, {
  home_health_widget: function(options) {
    var $widget = this;
    $widget.hide();
    this.options = options;
    options.size = options.size || 2;
    panel.loadCSS('home/home_widget.css', function() {
      if(!options.autohide) $widget.show();
    });
    window.hpupdate_header = function() {}

    if(options.size == 3) $widget.addClass('big');
    if(options.size == 2) $widget.addClass('medium');
    if(options.size == 1) $widget.addClass('small');

    $widget.progressImg = $('<img src="' + __panel.path_to_theme() + '/icons/heart.png"/>');
    $widget.css({
      height: 'auto'
    }).append($widget.progressImg);
    $widget.progressBarText = $('<div class="progress-bar-text"></div>');
    $widget.progressBar = $('<div class="progress-bar"></div>').append($widget.progressBarText);
    $widget.progressText = $('<div class="text"></div>');
    $widget.timerType = options.type;
    
    $widget.progressContainer = $('<div class="progress-container">', 
      {title: 'Нажмите для переключения вида'})
      .append($widget.progressBar)
      .append($widget.progressText)
      .appendTo($widget)
      .click(function() {
        options.type++;
        if(options.type > 2 || isNaN(options.type)) options.type = 0;
        $widget.timerType = options.type;
        panel.setWidgetOptions(options, $widget);
        panel.get('health', function(health) {
          home_health_timer.apply($widget, [health]);
        });
        switch($widget.timerType) {
          case 0:
            $(this).attr('title', 'Процент выздоровления, от 0% до 100%');
          break;
          case 1:
            $(this).attr('title', 'Таймер выздоровления до 80%, а затем оставшееся время выздоровления до 100%');
          break;
          case 2:
            $(this).attr('title', 'Таймер выздоровления до 100%');
          break;
        }
        return false;
      });
    $widget.timer100 = $('<div class="this.timer100"></div>');
    $widget.timer80 = $('<div class="this.timer80"></div>');
    $('<div class="timers"></div>')
      .append($widget.timer100)
      .append($widget.timer80)
      .appendTo($widget);
    panel.get('health', function(health) {
      home_health_progress.apply($widget, [false, health]);
    });
    panel.bind('hp_update', function(health) {
      panel.set('health', health);
      home_health_progress.apply($widget, [true, health]);
    });

  }
});
})(window.__panel, jQuery);