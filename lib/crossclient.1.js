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
      // clean event & window stack
      var __holders = localStorage.gwp2_event_holders;
      if(__holders && __holders.charAt(0) == '[') __holders = JSON.parse(__holders);
      else __holders = [];
      // clean garbage
      var cur_date = (new Date).getTime();
      /*for(var i = 0; i < __holders.length; i++) {
        var ar = __holders[i].split('_');
        var window_time = parseInt(ar[0]);
        if(cur_date - window_time > 86400000) { // Если запись старше суток, удаляем запись и стек событий
          delete localStorage['gwp2_' + 'events_' + __holders[i]];
          __holders.splice(i, 1);
        }
      };*/
      var now = (new Date).getTime();
      for(var __windowID in __holders) {
        for(var key in __holders[__windowID]) {
          var __event = __holders[__windowID][key];
          if(!__event.created || __event.created + 10000 > now) {
            delete __holders[__windowID][key];
          }
        }
      }
      localStorage['gwp2_event_holders'] = JSON.stringify(__holders);
      for(var key in localStorage) {
        if(key.indexOf('gwp2_events_') == 0) {
          var ar = key.split('_');
          if(parseInt(ar[2]) < cur_date - 86400000) {
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
      if(event.key.indexOf('window_') != -1) {
        var event_stack_id = event.key.substr(7);
        /// для текущего окна не запускаем его же события, т.к. они уже были запущены
        if(event_stack_id == windowID) return;
        
        var now = (new Date).getTime();

        var __window;
        /// Получаем объект с информацией об удалённом окне
        if(event.newValue) {
          __window = JSON.parse(event.newValue);
        }
        if(!__window || typeof(__window) != 'object') {
          __window = {
            created: now,
            events: []
          }
        }
        /// стек событий
        var eventStack = __window.events;
        
        if(!eventStack || !eventStack.length) return;
        
        var runEvents = [];
        
        /// определяем какие события ещё не были запущены локально
        for(var i = 0; i < eventStack.length; i++) {
          if(lastEvents[event_stack_id] && 
            lastEvents[event_stack_id] == eventStack[i].msgID) break;
          /// если событие старше 10 секунд, то оно не будет запускаться
          if(!eventStack[i].created || eventStack[i].created + 10000 < now) continue;
          runEvents.push(eventStack[i]);
        };
        /// события для запуска найдены, помечаем их как запущенные
        if(eventStack.length) {
          lastEvents[event_stack_id] = eventStack[0].msgID;
        };
        /// собствено, запускаем их в родительском окне
        for(var i = runEvents.length - 1; i >= 0; i--) {
          parent.postMessage(JSON.stringify(runEvents[i]), '*');
        };
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
          'type': 'event',
          'event': data.event,
          'created': (new Date).getTime(),
          'data': data.data,
          'msgID': windowID + '_' + data.msgID
        };
        
        // push event in current window event stack
        events.unshift(__event);

        // clean the end of the events stack for better perfomance [on huge events number]
        while(events.length > 100) {
          events.pop();
        };
        
        // set current window events stack
        var key = 'window_' + windowID;

        var currentObject = localStorage['gwp2_' + key];
        if(currentObject) currentObject = JSON.parse(currentObject);

        if(!currentObject || !currentObject.created) {
          currentObject = {
            created: (new Date).getTime(),
            windowID: windowID
          }
        }

        currentObject.events = events;
        currentObject.changed = (new Date).getTime();
        
        localStorage['gwp2_' + key] = JSON.stringify(currentObject);
        // return event to parent
        parent.postMessage(JSON.stringify(__event), '*');
      };
        //this.parseMessage(e.data, e.source);
    }, false);
    
    holders = localStorage.gwp2_event_holders;
    if(holders && holders.charAt(0) == '[') holders = JSON.parse(holders);
    if(!holders || !holders.push) holders = [];

    if(sessionStorage['gwp2_windowID']) {
      windowID = sessionStorage['gwp2_windowID'];
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
        windowID: windowID,
        events: []
      }
    }
    w.changed = (new Date).getTime();

    events = w.events;
    localStorage['gwp2_window_' + windowID] = JSON.stringify(w);
    
    // initializing current event call stack and set last event ID to first events in stack (for not to run all previous events)
    for(var i = 0; i < holders.length; i++) {
      if(holders[i] == windowID) continue;
      
      var eventStack = w.events;
      if(eventStack.length) {
        lastEvents[holders[i]] = eventStack[0].msgID;
      }
    };
    parent.postMessage(JSON.stringify({'type': 'windowID', 'value': windowID}), '*');
  };
  return __crossClient;
};

if(window.parent && window.parent != window) window.crossClient = new __crossClient;
if(window.crossClientCallback) {
  window.crossClientCallback();
}