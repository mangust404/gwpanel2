(function(panel, $) {
$.extend(panel, {

  roulette_stat_parser: function(callback, $data) {
    function parse($d) {
      panel.getTime(function(serverDate) { /// Получаем время на сервере
        var date_str = serverDate.getDate().toString() + '_' + (serverDate.getMonth() + 1).toString() + '_' + serverDate.getFullYear().toString();

        //delete localStorage['rouinfo_' + date_str];
        //delete localStorage['last_rouinfo'];
        //delete localStorage['prev_rouinfo'];

        var rouinfo = JSON.parse(localStorage['rouinfo_' + date_str] || JSON.stringify({history: {}, summ: {}, overall: 0})) || {history: {}, summ: {}, overall: 0};
        var index = 0;
        
        //console.log($d.find('a[href*="rouinfo.php"]'));
        var ids = [];
        var last_id;
        var hrefs = [];
        $d.find('a[href*="rouinfo.php"]:first').each(function() {
          last_id = parseInt(this.href.split('id=')[1]);
        });
        var need_parse = false;
        for(var i = 1; i < 4; i++) {
          if(!rouinfo['history'][last_id - i]) {
            need_parse = true;
          }
        }
        if(need_parse) {
          /// слишком много игр пропущено, лучше взять данные с сервера gwpanel
          var s = document.createElement('script');
          s.type = 'text/javascript';
          var date_ar = date_str.split('_');
          s.src = 'http://gwpanel.org/roulette/' + date_ar[2] + '/' + date_ar[1] + '/' + date_str + '.js?' + (new Date).getTime();

          window.rouinfo_callback = function() {
            localStorage['rouinfo_' + date_str] = JSON.stringify(window.rouinfo);
            callback(window.rouinfo);
          }
          s.addEventListener('error', function() {
            callback(rouinfo);
          }, false);

          document.body.appendChild(s);
        } else {
          /// меньше 4х игр нужно спарсить, парсим синхронно из истории
          $d.find('a[href*="rouinfo.php"]:first').each(function() {
            var id = parseInt(this.href.split('id=')[1]);
            if(id > 0 && rouinfo['history'][id] == undefined) {
              jQuery.ajax(this.href, {
                async: false,
                success: function(data) {
                  jQuery(data).text().search(/Выпало число[\s]+([0-9]+)/);
                  var result = parseInt(RegExp.$1);
                  if(result > 0) {
                    rouinfo['history'][id] = result;
                    if(rouinfo['summ'][result] == undefined) {
                      rouinfo['summ'][result] = 1;
                    } else {
                      rouinfo['summ'][result]++;
                    }
                    rouinfo['overall']++;
                  }
                }
              });
            }
          });
          localStorage['rouinfo_' + date_str] = JSON.stringify(rouinfo);
          callback(rouinfo);
        }
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