(function(panel, $) {
  var originalTitle;
  var isTime;
  var timeout;
  var widgetData;

  function setData(data) {
    widgetData = data;
  }
  function drawTimer($widget) {
    //console.log('drawTimer, data=', data);
    if(widgetData && widgetData.text) {
      $widget.html('');

      $('<a class="icon" href="' + widgetData.href + '"><img src="' + panel.iconURL('ferma.png') + '"/></a>')
        .appendTo($widget);

      /// высчитываем оставшееся время в секундах
      var seconds = widgetData.time - Math.floor(((new Date).getTime() - widgetData.start) / 1000);
      if(seconds > 0) {
        var timeStr = '';
        if(seconds <= 20) {
          timeStr = seconds + ' ' + panel.pluralize(seconds, 'секунду', 'секунды', 'секунд');
          if(!timeout) timeout = panel.setTimeout(function() {timeout = false; drawTimer($widget);}, 1000);
        } else if(seconds <= 60) {
          timeStr = seconds + ' ' + panel.pluralize(seconds, 'секунду', 'секунды', 'секунд');
          if(!timeout) timeout = panel.setTimeout(function() {timeout = false; drawTimer($widget);}, 10000);
        } else if(seconds <= 3600) {
          var minutes = Math.ceil(seconds / 60);
          timeStr = minutes + ' ' + panel.pluralize(minutes, 'минуту', 'минуты', 'минут');
          if(!timeout) timeout = panel.setTimeout(function() {timeout = false; drawTimer($widget);}, 60000);
        } else {
          var hours = Math.floor(seconds / 3600);
          var minutes = Math.floor((seconds - hours * 3600) / 60);
          timeStr = hours + ' ' + panel.pluralize(hours, 'час', 'часа', 'часов') + ' ' + 
                 minutes + ' ' + ' мин';
          if(!timeout) timeout = panel.setTimeout(function() {timeout = false; drawTimer($widget);}, 60000);
        }
        $('<p>Через ' + timeStr + ':</p>').appendTo($widget);
        isTime = false;
      } else {
        $('<p class="time">Уже пора:</p>').appendTo($widget);
        panel.checkFocused(function() {
        }, function() {
          panel.lockAcquire('ferma_widget_notify', function() {
            panel.loadScript('lib/jquery.title.alert.js', function() {
              jQuery.titleAlert('Уже пора', {
                interval: 1000
              });
            });
          }, function() {
          }, 3);
        });
        isTime = true;
      }
      var $link = $('<a href="' + widgetData.href + '">' + widgetData.text + '</a>')
        .click(function() {
          panel.gotoHref(this.href);
          return false;
        })
        .appendTo($widget);

      if(isTime) {
        $link.css({color: 'red', 'font-weight': 'bold'});
      }

      $widget.show();
    } else {
      $widget.hide().html('');
    }
  }

$.extend(panel, {
  ferma_timer_widget: function(options) {
    var $widget = this;
    $widget.hide();
    if(location.pathname == '/b0/btl.php' || 
       location.pathname == '/b0/b.php' || 
       (document.domain != 'www.ganjawars.ru' && 
        document.domain != 'ganjawars.ru'
       )) {
      return;
    }
    var new_data;
    panel.loadCSS('ferma/ferma.css', function() {
      panel.loadScript('ferma/ferma_parser.js', function() {
        if(location.pathname == '/ferma.php') {
          panel.ferma_action_parser(function(data) {
            panel.setCached(panel.ferma_action_parser, data, function() {
              setData(data);
              drawTimer($widget);
            });
          }, $(document.body));
        } else {
          panel.getCached(panel.ferma_action_parser, function(data) {
            setData(data);
            drawTimer($widget);
          }, 1800);
        }

        panel.bind('ferma_data', function(data) {
          /// сохраняем новые данные, чтобы не перерисовывать виджет при каждом пуке
          new_data = data;
          panel.setCached(panel.ferma_action_parser, new_data);
        });

        /// Слушаем событие focus, и перерисовываем данные если нужно
        $(window).focus(function() {
          if(new_data != null) {
            setData(new_data);
            drawTimer($widget);
          }
        });
      });
    });
  }
});
})(window.__panel, jQuery);