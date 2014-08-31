var __crossWindow = new function() {
  var instance;
  var postStack = {};
  var listenersStack = {};
  var frame;
  var domain;
  
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
    
    //if(!frame.contentWindow) console.log(frame);
    /// Передаём сообщение фрейму
    frame.contentWindow.postMessage(toJSON(message), '*');
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
    var __frame = jQuery('<iframe id="crossWindowContainer" src="http://' + 
                          domain + container + '"></iframe>')
                  .css({'display': 'none' }).load(function() {
      //   this.contentWindow.postMessage(toJSON({'type': 'event', 'event': 'load'}));
      //   this.contentWindow.document.writeln('test');
      //alert(this.contentWindow.postMessage);
      if(readyCallback) setTimeout(readyCallback, 1);
    }).appendTo(document.documentElement);
    frame = __frame[0];
  
    window.addEventListener('message', function(e) {
      var url;
      if(e.domain) url = e.domain;
      else if(e.origin) url = e.origin;
      if(!url.match(new RegExp('[^\.]*[\.]?' + domain))) return false;
      var data = parseJSON(e.data);
      
      if(data.type == 'callback') {
        if(postStack[data.msgID] && postStack[data.msgID]['callback']) {
          try {
            postStack[data.msgID]['callback'](typeof(data.retval) == 'undefined'? null: unserialize(data.retval));
          } catch(e) {
            dispatchException(e, 'crossWindow Callback error: ');
          }
        }
      } else if(data.type == 'event') {
        fireEvent(data.event, unserialize(data.data));
      } else if(data.type == 'windowID') {
        instance.windowID = data.value;
        instance.set('focused', data.value);
      }
    });
  }
  
  // Getting value from storage (asynchronous)
  __crossWindow.prototype.get = function(key, callback) {
    var callerFunc = String(arguments.callee.caller);
    var msgID = (callerFunc.substring(8, callerFunc.indexOf("(")).replace(' ', '') || "anoynmous") + '_' + (new Date).getTime();
    
    postMessage({'type': 'get', 'key': key}, msgID, callback);
  };
  
  // Getting value from storage (asynchronous)
  __crossWindow.prototype.set = function(key, value, callback) {
    var callerFunc = String(arguments.callee.caller);
    var msgID = (callerFunc.substring(8, callerFunc.indexOf("(")).replace(' ', '') || "anoynmous") + '_' + (new Date).getTime();
    
    postMessage({'type': 'set', 'key': key, 'value': serialize(value)}, msgID, callback);
    
  };

  // Removinb value from storage (asynchronous)
  __crossWindow.prototype.del = function(key, callback) {
    var callerFunc = String(arguments.callee.caller);
    var msgID = (callerFunc.substring(8, callerFunc.indexOf("(")).replace(' ', '') || "anoynmous") + '_' + (new Date).getTime();
    
    postMessage({'type': 'del', 'key': key}, msgID, callback);
  };
  
  // Binding event to callback function, function returns unique event listener ID
  __crossWindow.prototype.bind = function(type, callback) {
    if(!listenersStack[type]) listenersStack[type] = {};
    var callerFunc = String(arguments.callee.caller);
    var listenerID = (callerFunc.substring(8, callerFunc.indexOf("(")).replace(' ', '') || "anoynmous") + '_' + (new Date).getTime();
    var index = 0;
    while(listenersStack[type][listenerID]) {
      listenerID += index++;
    }
    listenersStack[type][listenerID] = {
      'callback': callback 
    };
    return listenerID;
  };
  
  // Unbinding event by listener ID, returned by bind()
  __crossWindow.prototype.unbind = function(type, listenerID) {
    listenersStack[type][listenerID] = null;
  };
  
  __crossWindow.prototype.triggerEvent = function(type, data, local) {
    if(local) {
      fireEvent(type, data);
    } else {
      var callerFunc = String(arguments.callee.caller);
      var msgID = (callerFunc.substring(8, callerFunc.indexOf("(")).replace(' ', '') || "anoynmous") + '_' + (new Date).getTime();
      
      postMessage({'type': 'event', 'event': type, 'data': serialize(data)}, msgID);
    }
  };
   
  return __crossWindow;
}

