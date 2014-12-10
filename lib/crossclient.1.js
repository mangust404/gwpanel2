(function($) {
  var xhr;

  function parseUrl(url) {
    if(url.indexOf('http://') == -1) {
      url = 'http://' + location.hostname + url;
    }
    var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

    var ar = parse_url.exec(url);

    var uri = {
      protocol: ar[1],
      hostname: ar[3],
      port: ar[4],
      pathname: '/' + ar[5],
      search: '?' + ar[6],
      hash: '#' + ar[7],
      origin: ar[1] + '://' + ar[3]
    };

    return uri;
  }

  var __crossClient = new function() {
    var instance;
    var windowID;
    var events = [];
    var lastEvents = {};
    var holders = [];
    
    function __crossClient() {
      if(!instance )
        instance = this;
      else return instance;
      function clean_garbage(removeWindow) {
        if(removeWindow) {
          /// при закрытии окна, удаляем его данные
          delete localStorage['gwp2_' + 'window_' + windowID];
        };

        var now = (new Date).getTime();

        for(var key in localStorage) {
          if(key.indexOf('gwp2_event_') == 0) {
            /// удаляем события старше 5 минут
            var _e = JSON.parse(localStorage[key]);
            if(_e.created < now - 300000) {
              delete localStorage[key];
            }
          } else if(key.indexOf('gwp2_window_') == 0) {
            /// удаляем все старые окна, в которых не было активности больше суток
            var _w = JSON.parse(localStorage[key]);
            if(_w.changed < now - 86400000) {
              delete localStorage[key];
            }
          } else if(key.indexOf('gwp2_lock_') == 0 || key.indexOf('gwp2_cached_') == 0) {
            /// в этих ключах хранятся объекты, у которых есть поле expiration
            var o = JSON.parse(localStorage[key]);
            if(o.expiration && o.expiration < now) {
              delete localStorage[key];
            }
          }
        }
      };
      
      setTimeout(clean_garbage, 60000);
      
      window.addEventListener('beforeunload', function(event) {
        clean_garbage(true);
      }, false);

      window.addEventListener('storage', function(event) {
        /// обработчик для запуска событий из других окон
        if(event.key.indexOf('event_') != -1 && event.newValue) {
          /// для текущего окна не запускаем его же события, т.к. они уже были запущены
          var __event = JSON.parse(event.newValue);

          if(__event.windowID == windowID) return;
          
          var now = (new Date).getTime();

          /// запускаем событие в родительском окне
          parent.postMessage(JSON.stringify(__event), '*');
        }
      }, false);

      window.addEventListener('message', function(e) {
        // checking origin & domain
       var url;
        if(e.domain) url = e.domain;
        else if(e.origin) url = e.origin;
        if(!url.match(/[^\.]*[\.]?ganjawars.ru/) && !url.match(/[^\.]*[\.]?gwpanel.org/)) {
          throw('Error receiving message, wrong domain: ' + url);
          return false;
        }
        
        // parsing data
        var data = JSON.parse(e.data);
        // handling data
        if(data.type == 'set') {
          // set storage item and post callback
          localStorage['gwp2_' + data.key] = String(data.value);
          //console.log('crossclient set ', 'gwp2_' + data.key, data.value);
          parent.postMessage(JSON.stringify({'type': 'callback', 'msgID': data.msgID}), '*');
        } else if(data.type == 'get') {
          // get storage item and post callback
          var val = localStorage['gwp2_' + data.key];
          //console.log('crossclient get ', 'gwp2_' + data.key, val);
          parent.postMessage(JSON.stringify({'type': 'callback', 'msgID': data.msgID, 'retval': val}), '*');
        } else if(data.type == 'del') {
          // get storage item and post callback
          delete localStorage['gwp2_' + data.key];
          //console.log('crossclient del ', 'gwp2_' + data.key);
          parent.postMessage(JSON.stringify({'type': 'callback', 'msgID': data.msgID}), '*');
        } else if(data.type == 'event') {
          
          // handling events
          var __event = {
            type: 'event',
            event: data.event,
            created: (new Date).getTime(),
            data: data.data,
            msgID: windowID + '_' + data.msgID,
            windowID: windowID
          };
          
          // set current window events stack
          var key = 'event_' + data.msgID;

          localStorage['gwp2_' + key] = JSON.stringify(__event);
          // return event to parent
          parent.postMessage(JSON.stringify(__event), '*');
        } else if(data.type == 'ajax') {
          var options = data.options;
          $.extend(options, {
            success: function(ajax_data) {
              var __data = {
                type: 'callback',
                msgID: data.msgID,
                retval: JSON.stringify({
                  callback: 'success',
                  data: ajax_data,
                  responseURL: xhr.responseURL
                })
              }
              parent.postMessage(JSON.stringify(__data), '*');
            },
            complete: function(ajax_data) {
              var __data = {
                type: 'callback',
                msgID: data.msgID,
                retval: JSON.stringify({
                  callback: 'complete',
                  responseURL: xhr.responseURL
                })
              }
              parent.postMessage(JSON.stringify(__data), '*');
            },
            error: function(ajax_data) {
              if(options.url.indexOf('home.do.php') > -1) {
                /// Эта страница даёт перенаправление на /items.php
                $.ajax('http://ganjawars.ru/items.php', {
                  success: function(ajax_data) {
                    var __data = {
                      type: 'callback',
                      msgID: data.msgID,
                      retval: JSON.stringify({
                        callback: 'success',
                        responseURL: xhr.responseURL,
                        data: ajax_data
                      })
                    }
                    parent.postMessage(JSON.stringify(__data), '*');
                  }
                });
              } else {
                var __data = {
                  type: 'callback',
                  msgID: data.msgID,
                  retval: JSON.stringify({
                    callback: 'error',
                    responseURL: xhr.responseURL
                  })
                }
                parent.postMessage(JSON.stringify(__data), '*');
              }
            }
          });

          $.ajax(options);
        } else if(data.type == 'size') {
          var size = {
            size: 0,
            used: 0,
            free: 0
          };

          size.used = JSON.stringify(localStorage).length;
          var DATA = '';
          for(var i = 0; i < 1024 * 1024; i++) {
            DATA += 'm';
          }
          localStorage.setItem("DATA", "m");
          var i;
          for(i = 0 ; i < 40 ; i++) {
              var __data = localStorage.getItem("DATA");
              try { 
                  localStorage.setItem("DATA", __data + DATA);
              } catch(e) {
                  break;
              }
          }
          localStorage.removeItem("DATA");
          size.size = (i + 1) * 1024 * 1024;

          size.free = size.size - size.used;

          parent.postMessage(JSON.stringify({'type': 'callback', 'msgID': data.msgID, 'retval': JSON.stringify(size)}), '*');
        };
          //this.parseMessage(e.data, e.source);
      }, false);
      
      holders = localStorage.gwp2_event_holders;
      if(holders && holders.charAt(0) == '[') holders = JSON.parse(holders);
      if(!holders || !holders.push) holders = [];

      if(sessionStorage['gwp2_windowID']) {
        windowID = sessionStorage['gwp2_windowID'];
        /// У открытых попапов в хроме тот же самый sessionStorage что и у родителя
        /// поэтому для попапов мы должны сгенерировать уникальный WindowID с учётом
        /// этой особенности
        if(window.name && window.name.indexOf('_child_popup') > -1) {
          windowID += '_p';
        }
      } else {
        windowID = (holders.length > 0? parseInt(holders[holders.length - 1].split('_', 1)[0]) + 1: '0') + '_' + (new Date).getTime();
        holders.push(windowID);
        localStorage.gwp2_event_holders = JSON.stringify(holders);
        sessionStorage['gwp2_windowID'] = windowID;
      }

      var w = localStorage['gwp2_window_' + windowID];
      if(w) {
        w = JSON.parse(w);
      }
      if(!w) {
        w = {
          created: (new Date).getTime(),
          windowID: windowID
        }
      }
      w.changed = (new Date).getTime();

      localStorage['gwp2_window_' + windowID] = JSON.stringify(w);
      
      parent.postMessage(JSON.stringify({'type': 'windowID', 'value': windowID}), '*');
    };
    return __crossClient;
  };

  if(window.parent && window.parent != window) window.crossClient = new __crossClient;
  if(window.crossClientCallback) {
    window.crossClientCallback();
  }

  var _orgAjax = $.ajaxSettings.xhr;
  $.ajaxSettings.xhr = function () {
    xhr = _orgAjax();
    var origonreadystatechange = xhr.onreadystatechange;
    xhr.onreadystatechange = function() {
      if(origonreadystatechange) origonreadystatechange();
    }
    return xhr;
  };
})(jQuery);