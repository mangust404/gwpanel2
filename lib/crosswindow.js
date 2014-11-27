var __crossWindow = new function() {
  var instance;
  var postStack = {};
  var listenersStack = {};
  var frame;
  var domain;
  
  function genUniqID(callback) {
    callback = callback || function() {};
    var callerFunc = callback.toString().hashCode();
    var index = 0;

    var base = callerFunc + '_' + (new Date).getTime();
    var msgID = base + '_' + index++;
    while(sessionStorage[msgID]) {
      msgID = base + '_' + index++;
    }
    sessionStorage[msgID] = 1;

    setTimeout(function() {
      delete sessionStorage[msgID];
    }, 3);

    return msgID;
  }

  function dispatchException(e, comment) {
    if(window.console) console.log(comment, e);
  }
  
  // Sending message to subframe
  function postMessage(message, msgID, callback) {
    /// Проверяем уникальность ID сообщения, до тех пор пока такое сообщение есть, добавляем к айдишнику индекс. Вероятность совпадения айдишников мала, но она есть.
    var index = 0;
    while(postStack[msgID]) {
      msgID += index++;
    }
    
    message['msgID'] = msgID;
    /// Сохраняем в стек вызовов сообщение
    postStack[msgID] = message;
    postStack[msgID]['callback'] = callback;
    
    /// Передаём сообщение фрейму
    frame.contentWindow.postMessage(JSON.stringify(message), '*');
  }

  function fireEvent(type, data) {
    if(typeof(listenersStack['*'] != 'undefined')) {
      for(var key in listenersStack['*']) {
        try {
          listenersStack['*'][key]['callback'](type, data);
        } catch(e) {
          dispatchException(e, 'crossWindow FireEvent error: ');
        }
      }
    }
    if(typeof(listenersStack[type]) == 'undefined') return;
    for(var key in listenersStack[type]) {
      if(typeof(listenersStack[type][key]) != 'object') return;
      try {
        listenersStack[type][key]['callback'](data);
      } catch(e) {
        dispatchException(e, 'crossWindow FireEvent error: ');
      }
    }
  }

  // Конструктор
  function __crossWindow(container, readyCallback, __domain) {
    if(!instance )
      instance = this;
    else return instance;
    if(!container) throw('You should specify container URL');
    if(__domain) {
      domain = __domain;
    } else {
      /// Обрезаем домен до второго уровня
      var ar = document.domain.split('.');
      domain = ar.slice(ar.length - 2).join('.');
    }
    var __frame = jQuery('<iframe id="crossWindowContainer" name="cross_window' + 
                          (window.opener? '_child_popup': '') + 
                          '" src="http://' + domain + container + '"></iframe>')
                  .css({'display': 'none' })
                  .appendTo(document.documentElement);
    frame = __frame[0];
  
    window.addEventListener('message', function(e) {
      var url;
      if(e.domain) url = e.domain;
      else if(e.origin) url = e.origin;
      if(!url.match(new RegExp('[^\.]*[\.]?' + domain))) return false;
      var data = JSON.parse(e.data);
      
      if(data.type == 'callback') {
        if(postStack[data.msgID] && postStack[data.msgID]['callback']) {
          try {
            postStack[data.msgID]['callback'](typeof(data.retval) == 'undefined'? null: JSON.parse(data.retval));
          } catch(e) {
            dispatchException(e, 'crossWindow Callback error: ');
          }
        }
      } else if(data.type == 'event') {
        fireEvent(data.event, JSON.parse(data.data));
      } else if(data.type == 'windowID') {
        instance.windowID = data.value;
        if(readyCallback) readyCallback();

        instance.set('focused', data.value);
      }
    });
  }
  
  jQuery.extend(__crossWindow.prototype, {
    // Getting value from storage (asynchronous)
    get: function(key, callback) {
      var msgID = genUniqID(callback);
      
      //console.log('crosswindow get ', key, msgID);
      postMessage({type: 'get', key: key}, msgID, callback);
    },
    
    // Getting value from storage (asynchronous)
    set: function(key, value, callback) {
      var msgID = genUniqID(callback);
      
      //console.log('crosswindow set ' + key + '=', value, msgID);
      postMessage({type: 'set', key: key, 'value': JSON.stringify(value)}, msgID, callback);
      
    },

    // Removinb value from storage (asynchronous)
    del: function(key, callback) {
      var msgID = genUniqID(callback);
      
      //console.log('crosswindow del ', key, 'msgID:', msgID, 'callback:', callback);
      postMessage({type: 'del', key: key}, msgID, callback);
    },
    
    // Binding event to callback function, function returns unique event listener ID
    bind: function(type, callback, listenerID) {
      if(!listenersStack[type]) listenersStack[type] = {};

      if(!listenerID) {
        var listenerID = genUniqID(callback);
      }
      listenersStack[type][listenerID] = {
        'callback': callback 
      };
      return listenerID;
    },
    
    // Unbinding event by listener ID, returned by bind()
    unbind: function(type, listenerID) {
      delete listenersStack[type][listenerID];
    },
    
    triggerEvent: function(type, data, local) {
      if(local) {
        fireEvent(type, data);
      } else {
        var callerFunc = String(arguments.callee.caller);
        var msgID = (callerFunc.substring(8, callerFunc.indexOf("(")).replace(' ', '') || "anoynmous") + '_' + String((new Date).getTime() + Math.random()).hashCode();
        
        postMessage({type: 'event', event: type, data: JSON.stringify(data)}, msgID);
      }
    },
    
    ajax: function(options) {
      var msgID = genUniqID(callback);
      var __callbacks = {};
      var __data = {};

      jQuery.each(options, function(key, value) {
        if(jQuery.type(value) == 'function') {
          __callbacks[key] = value;
        } else {
          __data[key] = value;
        }
      });
      var uri = __panel.parseUrl(options.url);

      var callback = function(data) {
        if(__callbacks[data.callback]) {
          if(data.callback == 'success') {
            // Подменяем все относительные action="/" и href="/" на http://ganjawars.ru/
            var url_ex = /\s(action|href)=([^\s>]+)?/g;
            while(match = url_ex.exec(data.data)) {
              if(match[1].indexOf('http:') == -1) {
                data.data = data.data.substr(0, match.index) + ' ' + match[1] + '="' + 
                            uri.origin + match[2] + '"' + 
                            data.data.substr(match.index + match[0].length);
              }
            }
            __callbacks[data.callback].apply(this, [data.data]);
          } else {
            __callbacks[data.callback].apply(this, [data]);
          }
        }
      }
      postMessage({type: 'ajax', options: __data}, msgID, callback);
    },

    getListeners: function() {
      return listenersStack;
    }

  });

  return __crossWindow;
}

