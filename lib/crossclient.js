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
      // clean event & window stack
      var __holders = localStorage.event_holders;
      if(__holders && __holders.charAt(0) == '[') __holders = parseJSON(__holders);
      else __holders = [];
      if(removeWindow) {
        localStorage.removeItem('events_' + windowID);
        var index = __holders.indexOf(windowID);
        if(index != -1) __holders.splice(index, 1);
      };
      // clean garbage
      var cur_date = (new Date).getTime();
      for(var i = 0; i < __holders.length; i++) {
        var ar = __holders[i].split('_');
        var window_time = parseInt(ar[0]);
        if(cur_date - window_time > 86400000) { // Если запись старше суток, удаляем запись и стек событий
          localStorage.removeItem('events_' + __holders[i]);
          __holders.splice(i, 1);
        }
      };
      localStorage.event_holders = toJSON(__holders);
      for(var key in localStorage) {
        if(key.indexOf('events_') == 0) {
          var ar = key.split('_');
          if(parseInt(ar[2]) < cur_date - 86400000) {
            // Удаляем по одной левой записи за раз
            localStorage.removeItem(key);
            break;
          }
        }
      }
    };
    
    setTimeout(clean_garbage, 60000);
    
    window.addEventListener('unload', function(event) {
      clean_garbage(true);
    }, false);

    window.addEventListener('storage', function(event) {
      if(event.key.indexOf('events_') != -1) {
        var event_stack_id = event.key.substr(7);
        if(event_stack_id == windowID) return;
        
        var eventStack = parseJSON(event.newValue);
        
        if(!eventStack) return;
        
        var runEvents = [];
        
        for(var i = 0; i < eventStack.length; i++) {
          if(lastEvents[event_stack_id] && lastEvents[event_stack_id] == eventStack[i].msgID) break;
          runEvents.push(eventStack[i]);
        };
        if(eventStack.length) {
          lastEvents[event_stack_id] = eventStack[0].msgID;
        };
        for(var i = runEvents.length - 1; i >= 0; i--) {
          parent.postMessage(toJSON(runEvents[i]), '*');
        };
      }
    }, false);

    window.addEventListener('message', function(e) {
      // checking origin & domain
     var url;
      if(e.domain) url = e.domain;
      else if(e.origin) url = e.origin;
      if(!url.match(/[^\.]*[\.]?ganjawars.ru/) && !url.match(/[^\.]*[\.]?gwpanel.org/)) return false;
      
      // parsing data
      var data = parseJSON(e.data);
      
      // handling data
      if(data.type == 'set') {
        // set storage item and post callback
        var val = localStorage.setItem(data.key, data.value);
        parent.postMessage(toJSON({'type': 'callback', 'msgID': data.msgID, 'retval': val}), '*');
      } else if(data.type == 'get') {
        // get storage item and post callback
        var val = localStorage.getItem(data.key);
        parent.postMessage(toJSON({'type': 'callback', 'msgID': data.msgID, 'retval': val}), '*');
      } else if(data.type == 'del') {
        // get storage item and post callback
        localStorage.removeItem(data.key);
        parent.postMessage(toJSON({'type': 'callback', 'msgID': data.msgID, 'retval': val}), '*');
      } else if(data.type == 'event') {
        
        // handling events
        var __event = {
          'type': 'event',
          'event': data.event,
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
        var key = 'events_' + windowID;
        
        localStorage.setItem(key, toJSON(events));
        
        // return event to parent
        parent.postMessage(toJSON(__event), '*');
      };
        //this.parseMessage(e.data, e.source);
    }, false);
    
    holders = localStorage.event_holders;
    if(holders && holders.charAt(0) == '[') holders = parseJSON(holders);
    if(!holders || !holders.push) holders = [];

    windowID = (holders.length > 0? parseInt(holders[holders.length - 1].split('_', 1)[0]) + 1: '0') + '_' + (new Date).getTime();

    holders.push(windowID);
    localStorage.event_holders = toJSON(holders);
    
    // initializing current event call stack and set last event ID to first events in stack (for not to run all previous events)
    for(var i = 0; i < holders.length; i++) {
      if(holders[i] == windowID) continue;
      var item = localStorage.getItem('events_' + holders[i]);
      if(item) {
        var eventStack = parseJSON(item);
        if(eventStack.length) {
          lastEvents[holders[i]] = eventStack[0].msgID;
        }
      }
    };
    
    parent.postMessage(toJSON({'type': 'windowID', 'value': windowID}), '*');
  };
  return __crossClient;
};

if(window.parent && window.parent != window) window.crossClient = new __crossClient;
