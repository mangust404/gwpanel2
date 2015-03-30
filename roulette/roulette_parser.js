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
        var ids = [];
        var hrefs = [];
        $d.find('a[href*="rouinfo.php"]').each(function() {
          var last = parseInt(localStorage['last_rouinfo']);
          var prev = parseInt(localStorage['prev_rouinfo']);
          var id = parseInt(this.href.split('id=')[1]);
          //console.log('id', id, 'last', last, 'prev', prev);
          index++;
          if(isNaN(prev) || prev > id || id > last) {
            ids.push(id);
            hrefs.push(this.href);
            if(id > last || isNaN(last)) {
              localStorage['last_rouinfo'] = id;
            }
            if(id < prev || isNaN(prev)) {
              localStorage['prev_rouinfo'] = id;
            }
          }
        });

        console.log(ids.length, Object.keys(rouinfo).length);
        if(ids.length > 10 || Object.keys(rouinfo).length == 0) {
          var s = document.createElement('script');
          s.type = 'text/javascript';
          var date_ar = date_str.split('_');
          s.src = 'http://gwpanel.org/roulette/' + date_ar[2] + '/' + date_ar[1] + '/' + date_str + '.js?' + (new Date).getTime();

          window.rouinfo_callback = function() {
            localStorage['rouinfo_' + date_str] = JSON.stringify(window.rouinfo);
          }
          document.body.appendChild(s);
        } else {
          for(var i = 0; i < ids.length; i++) {
            var last = parseInt(localStorage['last_rouinfo']);
            var prev = parseInt(localStorage['prev_rouinfo']);
            var id = ids[i];
            var href = hrefs[i];
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
          }
        }
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