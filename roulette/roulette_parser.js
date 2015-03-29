(function(panel, $) {
$.extend(panel, {

  roulette_stat_parser: function(callback, $data) {
    function parse($d) {
      panel.getTime(function(serverDate) { /// Получаем время на сервере
        var date_str = serverDate.getDate().toString() + '_' + (serverDate.getMonth() + 1).toString() + '_' + serverDate.getFullYear().toString();

        //delete localStorage['rouinfo_' + date_str];
        //delete localStorage['last_rouinfo'];
        //delete localStorage['prev_rouinfo'];

        var rouinfo = JSON.parse(localStorage['rouinfo_' + date_str] || JSON.stringify({})) || {};
        var index = 0;
        
        //console.log($d.find('a[href*="rouinfo.php"]'));
        $d.find('a[href*="rouinfo.php"]').each(function() {
          var last = parseInt(localStorage['last_rouinfo']);
          var prev = parseInt(localStorage['prev_rouinfo']);
          var id = parseInt(this.href.split('id=')[1]);
          //console.log('id', id, 'last', last, 'prev', prev);
          index++;
          if(isNaN(prev) || prev > id || id > last) {
            var href = this.href;
            jQuery.ajax(href, {
              async: false,
              success: function(data) {
                jQuery(data).text().search(/Выпало число[\s]+([0-9]+)/);
                var result = parseInt(RegExp.$1);
                if(result > 0) {
                  if(rouinfo[result] == undefined) {
                    rouinfo[result] = 1;
                  } else {
                    rouinfo[result]++;
                  }
                }
              }
            });
            
            if(id > last || isNaN(last)) {
              localStorage['last_rouinfo'] = id;
            }
            if(id < prev || isNaN(prev)) {
              localStorage['prev_rouinfo'] = id;
            }
          }
        });

        localStorage['rouinfo_' + date_str] = JSON.stringify(rouinfo);

        callback(rouinfo);
      });
    }

    if($data && $data.length > 0) {
      parse($data);
    } else {
      $.ajax('/roulist.php', {
        success: function(data) {
          parse($(data));
        },
        error: function() {
          callback({});
        }
      });
    }
  }
});
})(window.__panel, jQuery);