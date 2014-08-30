(function(__panel) {
  var bgenerated, rightattack, leftattack, defence, prevRightAttack, prevLeftAttack, prevDefence, bsrcframe, toAllies, battlechat, bgenerator, bgenchk, walk, bredo;
  var battleFixed;
  var allies = {}, enemies = {};
  var options = {};
  var enemySelectBox;
  var jsEnabled;
  var battle_modifyChatWait;
  var __genInitHandler, __redoInitHandler, __redoFillHandler;
  var battleMovesRequest;
  var selectedEnemy, savedMove;
  
jQuery.extend(__panel, {
  battle_fix: function(__options) {
    jQuery.extend(options, __options);
    
    if(battleFixed) return;
    window.bf3 = window.bf3.replace(/<a/, '<a id="updbutton"');
    bsrcframe = jQuery('#bsrc');
    bsrcframe.load(function() {
      __panel.triggerEvent('updatedata', {}, true);
    });
    window.__updatebf = window.updatebf;
    window.updatebf = function() {
      window.__updatebf();
      __panel.triggerEvent('updatebf', {}, true);
    };
    window.__updatedata = window.updatedata;
    window.updatedata = function() {
      __panel.triggerEvent('beforeupdatedata', {}, true);
      window.__updatedata();
    };
    __panel.bind('beforeupdatedata', function() {
      if(jQuery('#updbutton').length) {
        jQuery('#updbutton').html('Подождите...');
      };
    });
    __panel.bind('updatedata', function() {
      if(jQuery('#updbutton').length) {
        jQuery('#updbutton').html('Обновить');
      };
    });
    if(options.wartime_s > 0) {
      if(window.DataTimer > 0) clearTimeout(window.DataTimer);
      window.DataTimer = setTimeout('updatedata()', options.wartime_s * 1000);
      __panel.bind('updatedata', function() {
        if(window.DataTimer > 0) clearTimeout(window.DataTimer);
        window.DataTimer = setTimeout('updatedata()', options.wartime_s * 1000);
      });
    }
    window.__makebf = window.makebf;
    window.makebf = function() {
      window.__makebf();
      __panel.triggerEvent('makebf', {}, true);
    };
    jQuery(window).keydown(function(e) {
      if(e.keyCode == 13 && e.ctrlKey) {
        if(jQuery('#movego').length) fight();
        else updatedata();
        return false;
      }
    });
    window.__fight = window.fight;
    window.fight = function() {
      __panel.triggerEvent('beforeFight', {}, true);
      window.__fight();
      __panel.triggerEvent('fight', {}, true);
    };
    window.__updatechatlines = window.updatechatlines;
    
    window.updatechatlines = function() {
      window.__updatechatlines();
      __panel.triggerEvent('updatechatlines', {}, true);
    };
  
    window.__clrline = window.clrline;
    window.clrline = function() {
      __panel.triggerEvent('before_clrline', {}, true);
      window.__clrline();
      __panel.triggerEvent('clrline', {}, true);
    };
    battleFixed = true;
    
  },
  
  battle_init: function(__options) {
    jQuery.extend(options, __options);
    
    allies = false;
    if(location.pathname.indexOf('/b.php') != -1)
      __panel.battle_stdInit();
    else if(location.pathname.indexOf('/btl.php') != -1) {
      __panel.battle_fix();
      __panel.battle_jsInit();
    } else if(location.pathname.indexOf('/warlog.php') != -1 && document.body.innerHTML.indexOf('[ Ваш бой ]') == -1) {
      var args = location.search.substr(1).toQueryParams();
      var bid = args['bid'];
      panel.get('BattleID', function(data) {
        if(data == bid) {
          __panel.triggerEvent('battleend', {bid: bid});
        }
      });
    }
  },
  
  battle_indexes: function() {
    enemySelectBox = document.getElementsByTagName('select')[0];
    if(!enemySelectBox) return;
    if(enemies.indexesAdded) return;
    enemies.indexesAdded = true;
    var i = 0;
    jQuery(enemySelectBox.childNodes).each(function(index) {
      var matches = this.innerHTML.match(/([0-9]+)\. (.*)\[[0-9]+\]/);
      if(!matches) return;
      if(!enemies['index']) enemies['index'] = [];
      for(var j = i; j < enemies['name'].length; j++) {
        if(enemies['name'][j] == matches[2]) {
          var b = document.createElement('b');
          b.innerHTML = matches[1] + '. ';
          enemies['index'][j] = matches[1];
          if(enemies['link'][j].previousSibling && enemies['link'][j].previousSibling.tagName.toUpperCase() == 'B' && enemies['link'][j].previousSibling.innerHTML == b.innerHTML) return;
          enemies['link'][j].parentNode.insertBefore(b, enemies['link'][j]);
          i = j - 1;
        };
      };
      
    });
  },
  
  battle_addPM: function() {
    if(enemies.pmAdded) return;
    enemies.pmAdded = true;
    if(jsEnabled) {
      var msgfield = document.getElementsByName('oldm')[0];
    } else {
      var msgfield = document.forms['battlechat'].elements['newmessage'];
    };
    for(var j = 0; j < enemies['name'].length; j++) {
      if(enemies['name'][j] == options.name) continue;
      if(jQuery('#pm-' + enemies['id'][j]).length) continue;
      var pm = jQuery('<span>[pm]</span>')
        .attr('id', 'pm-' + enemies['id'][j])
        .attr('name', enemies['name'][j])
        .css({
          'fontSize': '8px',
          'cursor': 'pointer',
          'margin': '3px 0px 0px -32px',
          'position': 'absolute'
        })
        .click(function() {
          var name = jQuery(this).attr('name');
          var addText = name + ': ';
          if(msgfield.value.indexOf(addText) == -1)
            msgfield.value += addText;
          msgfield.focus();
        });
      pm.insertBefore(enemies['link'][j]);
    };
    if(allies.pmAdded) return;
    allies.pmAdded = true;
    for(var j = 0; j < allies['name'].length; j++) {
      if(allies['name'][j] == options.name) continue;
      if(jQuery('#pm-' + allies['id'][j]).length) continue;

      var pm = jQuery('<span>[pm]</span>')
        .attr('id', 'pm-' + allies['id'][j])
        .attr('name', allies['name'][j])
        .css({
        'fontSize': '8px',
        'cursor': 'pointer',
        'position': 'absolute',
        'margin': '5px 0px 0px 15px'
        })
        .click(function() {
          var name = jQuery(this).attr('name');
          var addText = name + ': ';
          if(msgfield.value.indexOf(addText) == -1)
            msgfield.value += addText;
          msgfield.focus();
        });
      pm.insertBefore(allies['link'][j].nextSibling.nextSibling);
    };
  },
  
  battle_advselect: function() {
    if(!enemySelectBox) enemySelectBox = document.getElementsByTagName('select')[0];
    if(!enemySelectBox) return;
    if(enemies.advSelectCreated || enemySelectBox.advSelectCreated) return;
    enemies.advSelectCreated = enemySelectBox.advSelectCreated = true;
    jQuery(enemySelectBox.childNodes).each(function(index) {
      var matches = this.innerHTML.match(/([0-9]+)\. (.*)\[[0-9]+\]/);
      if(!matches) return;
      for(var j = 0; j < enemies['name'].length; j++) {
        if(enemies['name'][j] == matches[2]) {
          this.text = this.text + "; HP: " + enemies['hpcur'][j] + ' / ' + enemies['hpall'][j] + ";\tвидимость: " + enemies['visibility'][j] + "%;\t" + enemies['weapon'][j];
          return;
        };
      };
      for(var j = 0; j < allies['name'].length; j++) {
        if(allies['name'][j] == matches[2]) {
          this.text = this.text + "; HP: " + allies['hpcur'][j] + ' / ' + allies['hpall'][j] + ";\tвидимость: " + allies['visibility'][j] + "%;\t" + allies['weapon'][j];
          return;
        };
      };
    });
  }, 
  
  battle_convertTitles: function() {
    jQuery(document.images).each(function(index) {
      if(this.src.indexOf('i/icons/') != -1 && this.alt != undefined) {
        this.title = this.alt;
        var parts = this.alt.split(' ');
        if(options.name == parts[0]) {
          this.style.border='1px solid red';
        };
      };
    });
  },
  
  battle_addToAllies: function() {
    var battlechat = battlechat = document.forms['battlechat'];
    toAllies = jQuery('<input type="checkbox">')
      .change(function(e) {
        var target = e.currentTarget;
        if(jsEnabled) {
          var msgfield = document.getElementsByName('oldm')[0];
        } else {
          var msgfield = battlechat.elements['newmessage'];
        };
        var ch = msgfield.value.charAt(0);
        if(target.checked) {
          if(ch == '~' || ch == '%' || ch == '*') return;
          msgfield.value='~' + msgfield.value;
          msgfield.focus();
        } else {
          if(ch == '~' || ch == '%' || ch == '*') {
            msgfield.value = msgfield.value.slice(1);
            msgfield.focus();
          };
        };
      });
    jQuery(battlechat).prepend(toAllies);
    
    __panel.bind('clrline', function() {
      var oldm = document.getElementsByName('oldm')[0];
      if(toAllies.attr('checked')) oldm.value = '~';
      else oldm.value='';
      savedMove = true;
      if(!enemySelectBox) enemySelectBox = document.getElementsByTagName('select')[0];
      selectedEnemy = jQuery(enemySelectBox).val();
    });
    jQuery(battlechat).prepend('<font>своим</font>');
    var bowrds;
    if(options.bwords && (bwords = options.bwords.split('|')) && bwords.length) {
      var wordsdiv = jQuery('<div id="wordsdiv"></div>')
        .css({
          'display': 'none',
          'position': 'absolute'
        }).appendTo(document.body);
      var btn = jQuery('<a title="Быстрые фразы">&nbsp;&darr;&nbsp;</a>')
        .css({
        'cursor': 'pointer',
        'margin-right': '10px'
        })
        .click(function(e) {
          jQuery(wordsdiv).css({
            'left': jQuery(this).css('left') + 5,
            'top': jQuery(this).css('top') + 25
          }).show();
          return false;
        });
      for(var i = 0; i < bwords.length; i++) {
        var element = jQuery('<a class="bword">' + bwords[i] + '</a>').
          css({
            'border': '1px solid #339933',
            'display': 'block',
            'background': '#f0fff0',
            'height': '20px',
            'padding': '2px 4px'
          }).click(function() {
            var wordsdiv = jQuery('#wordsdiv'); 
            if(wordsdiv && Element.visible(wordsdiv)) {
              Element.hide(wordsdiv);
            };
            battlechat.oldm.value = __panel.textContent || __panel.text || __panel.innerText;
            document.forms['battlechat'].elements[document.forms['battlechat'].elements[document.forms['battlechat'].elements.length - 1].innerHTML == 'Обновить'? document.forms['battlechat'].elements.length - 2: document.forms['battlechat'].elements.length - 1].click();
          });
          jQuery(wordsdiv).append(element);
      };
      jQuery(document.body).click(function() {
        jQuery('#wordsdiv:visible').hide();
      });
      btn.before(s);
    };
    var r = jQuery('<button>Обновить</button>')
      .css({'background': '#D0EED0'})
      .click(function(e) {
        updatedata();
        return false;
      }).appendTo(battlechat);
  },
  
  battle_modifyChat: function() {
    try {
      var logField;
      if(jsEnabled) 
        logField = jQuery('#log')[0];
      else {
        logField = document.getElementsByName('newmessage')[0].parentNode.parentNode.parentNode.getElementsByTagName('div')[0];
      };
      if(!logField || logField.firstChild.converted || (window.chrome && logField.firstChild.getAttribute && logField.firstChild.getAttribute('converted'))) return;
      for(var i = 0; i < logField.childNodes.length; i++) {
        if(!logField.childNodes[i+2] || logField.childNodes[i].converted || (logField.childNodes[i].getAttribute && logField.childNodes[i].getAttribute('converted'))) break;
        logField.childNodes[i].converted = true;
        if(logField.childNodes[i].setAttribute) logField.childNodes[i].setAttribute('converted', 1);
        if(logField.childNodes[i+2].tagName && logField.childNodes[i+2].tagName.toUpperCase() == 'FONT' && logField.childNodes[i+2].getAttribute('color') == '#009999') { //is team text
          try {
            var playerName = logField.childNodes[i].textContent || logField.childNodes[i].innerText;
            if(!playerName) throw ('Weird colors in chat!');
            var pindex = allies.name.indexOf(playerName);
            if(pindex == -1) throw ('Player not found');
            logField.childNodes[i+2].innerHTML += '&nbsp;&nbsp;[<font color=\'red\'>' + allies['weapon'][pindex] + '</font>]';
          } catch (e) {
            __panel.dispatchException(e);
          };
        };
      };
    } catch(e) {
      if(!battle_modifyChatWait)
        battle_modifyChatWait = setTimeout(__panel.battle_modifyChat.bind(this), 2000);
    };
    
  },
  
  battle_playerInfo: function() {
    if(options.uid) {
      var data = {};
      for(var i = 0; i < allies['id'].length; i++) {
        if(allies['id'][i] == options.uid) {
          data = {
            'hpcur': allies['hpcur'][i],
            'hpall': allies['hpall'][i],
            'damage': allies['damage'][i],
            'killed': allies['killed'][i],
            'visibility': allies['visibility'][i]
          };
          break;
        };
      };
      if(!data) {
        for(var i = 0; i < enemies['id'].length; i++) {
          if(enemies['id'][i] == options.uid) {
            data = {
              'hpcur': enemies['hpcur'][i],
              'hpall': enemies['hpall'][i],
              'damage': enemies['damage'][i],
              'killed': enemies['killed'][i],
              'visibility': enemies['visibility'][i]
            };
            break;
          };
        };
      };
      if(!data['hpcur']) return;
      try {
        if(!jQuery('#infoElem1').length || !jQuery('#infoElem2').length) {
          var elems = jQuery('.txt');
          for(var j = 0; j < elems[0].childNodes.length; j++) {
            if(elems[0].childNodes[j].style) elems[0].childNodes[j].style.styleFloat = elems[0].childNodes[j].style.cssFloat = 'left';
          };
          for(var j = 0; j < elems[1].childNodes.length; j++) {
            if(elems[1].childNodes[j].style) elems[1].childNodes[j].style.styleFloat = elems[1].childNodes[j].style.cssFloat = 'left';
          };
          var elem1 = jQuery('<div id="infoElem1"></div>').css({'float': 'right', 'margin-right': '40px'}).appendTo(elems[1]);
          var elem2 = jQuery('<div id="infoElem2"></div>').css({'float': 'left', 'margin-left': '30px'}).appendTo(elems[2]);
        };
        if(jQuery('#infoElem1').length) {
          jQuery('#infoElem1').html('<i>HP:</i> ' + (data['hpcur'] < data['hpall']/10? '<font color=red>' + data['hpcur'] + '</font>': data['hpcur']) + '&nbsp;/&nbsp;<font style="color: green; margin-right: 30px;">' + data['hpall'] + '</font><i>урон:</i> <font style="color: #790000;">' + data['damage'] + '</font> (' + data['killed'] + ') ');
        };
        if(jQuery('#infoElem2').length) {
          jQuery('#infoElem2').html('<i>видимость:</i> <font style="color: #0072bc">' + data['visibility'] + '%</font>' + '&nbsp;&nbsp;&nbsp;<b><font color="blue" title="количество друзей">' + allies['id'].length + '</font></b> / <b><font color="red" title="количество противников">' + enemies['id'].length + '</font></b>');
        };
      } catch(e) {};
    };
  },
  
  battle_generator: function() {
    __genInitHandler = function(){
      if(bgenerated && defence) {
        if(!isNaN(rightattack) && jQuery('#right_attack' + rightattack)) jQuery('#right_attack' + rightattack).click();
        if(!isNaN(defence)) jQuery('#defence' + defence).click();
        if(!isNaN(leftattack)) jQuery('#left_attack' + leftattack).click();
        if(walk) jQuery('#walk').attr('checked', 1);
      } else if(bgenchk.attr('checked')) {
        if(jQuery('#right_attack1').length){
          var r = Math.floor(Math.random() * 3) + 1;
          jQuery('#right_attack'+r).click();
          rightattack = r;
        };
        if(jQuery('#left_attack1').length) {
          var l = Math.floor(Math.random() * 3) + 1;
          if(options.genuniq) {
            while(l == r) l = Math.floor(Math.random()*3) + 1;
          };
          jQuery('#left_attack'+l).click();
          leftattack = l;
        };
        if(jQuery('#defence1').length) {
          var d = Math.floor(Math.random() * 3) + 1;
          jQuery('#defence' + d).click();
          defence = d;
        };
        if(walk) jQuery('#walk').attr('checked', 1);
        bgenerated = true;
        
      }
      if(jQuery('#bf').length) jQuery('#bf').prepend(bgenerator);
      else {
        bgenerator.prepend(document.getElementsByTagName('script')[4]);
      };
    };
    
    if(!bgenerator) {
      bgenerator = jQuery('<div id="generator"></div>').css({'margin':'0 0 0 20px','position':'absolute'});
      if(!bgenchk) {
        bgenchk = jQuery('<input type="checkbox">')
          .appendTo(bgenerator)
          .change(function(e) {
            __panel.setOptions({'autogen': __panel.checked}, 'battle');
            if(__panel.checked){
              if(bredochk && bredochk.attr('checked')) bredochk.click();
            };
          });
      }
      jQuery('#walk').change(function() {
        if(this.checked) walk = true;
      });
      if(parseInt(options.autogen) && !parseInt(options.autoredo)) bgenchk.attr('checked', 1);
      jQuery('<a href="#">случайный ход</a>').click(
        function(){ bgenerated = false; __genInitHandler();
      }).appendTo(bgenerator);
    }
    if(jQuery('#bf').length) jQuery('#bf').prepend(bgenerator);
    else {
      bgenerator.prepend(document.getElementsByTagName('script')[4]);
    };
    if(bgenchk.attr('checked')) {
      setTimeout(function() { __genInitHandler(); }, 10);
    };
  },
  
  battle_redoMove: function() {
    __redoInitHandler = function(){
      if(prevRightAttack) {
        jQuery('#right_attack'+prevRightAttack).click();
      };
      if(prevLeftAttack) {
        jQuery('#left_attack'+prevLeftAttack).click();
      };
      if(prevDefence) {
        jQuery('#defence'+prevDefence).click();
      };
      if(walk) {
        var __walk = document.getElementsByName('walk');
        if(__walk && __walk.length && __walk[0]) __walk[0].click();
      };
      var bf = jQuery('#bf');
      if(bf.length) bf.prepend(bredo);
      else {
        var s = document.getElementsByTagName('script')[4];
        jQuery(s).before(bredo);
      };
    };
    __redoFillHandler = function() {
      if(jQuery('#right_attack1')) {
        if(jQuery('#right_attack1').checked) {
          prevRightAttack = 1;
        } else if(jQuery('#right_attack2').checked) {
          prevRightAttack = 2;
        } else if(jQuery('#right_attack3').checked) {
          prevRightAttack = 3;
        };
      }
      if(jQuery('#left_attack1')) {
        if(jQuery('#left_attack1').checked) {
          prevLeftAttack = 1;
        } else if(jQuery('#left_attack2').checked) {
          prevLeftAttack = 2;
        } else if(jQuery('#left_attack3').checked) {
          prevLeftAttack = 3;
        };
      };
      if(jQuery('#defence1').checked) {
        prevDefence = 1;
      } else if(jQuery('#defence2').checked) {
        prevDefence = 2;
      } else if(jQuery('#defence3').checked) {
        prevDefence = 3;
      };
      var __walk = document.getElementsByName('walk');
      if(__walk && __walk.length && __walk[0]) walk = __walk[0].checked;
    };
    
    bredo = jQuery('<div id="redo_move"></div>')
      .css({'margin':'20px 0 0 20px','position':'absolute'});
      
    var bf = jQuery('#bf');
    if(bf.length) bf.prepend(bredo);
    else {
      var s = document.getElementsByTagName('script')[4];
      jQuery(s).before(bredo);
    };
    bredochk = jQuery('<input type="checkbox" />')
      .change(function(e) {
        var target = e.currentTarget;
        __panel.setOptions({'autoredo': target.checked}, 'battle');
        if(target.checked) {
          if(bgenchk && bgenchk.attr('checked')) bgenchk.click();
        };
      })
      .appendTo(bredo);
    if(options.autoredo) bredochk.attr('checked', 1);
      
    var a = jQuery('<span>запомнить ход</span>').appendTo(bredo);
    
  },

  battle_stdInit: function() {
    __panel.triggerEvent('battlebegin', {'bid': window.BattleID});
    __panel.set('BattleID', window.BattleID);

    __panel.battle_getUserInfo();
    __panel.battle_playersInit();
    if(!options.nobattlepm) {
      __panel.battle_addPM();
    };
    if(options.indexes) {
      __panel.battle_indexes();
    };
    if(options.advSelect) {
      __panel.battle_advselect();
    }
    if(__panel.getOptions().system.plugins.indexOf('battleimg') == -1) {
      __panel.battle_convertTitles();
    };
    if(!options.noplinfo) {
      __panel.battle_playerInfo();
    };
    __panel.battle_addToAllies();
    if(!options.nobchat_m) {
      __panel.battle_modifyChat();
    };
    if(!options.nobgen) {
      __panel.battle_generator();
    };
  },
  
  battle_jsInit: function() {
    __panel.triggerEvent('battlebegin', {'bid': window.BattleID});
    
    __panel.set('BattleID', window.BattleID);
    jsEnabled = true;
    __panel.battle_playersInit();
    __panel.battle_getUserInfo();
    __panel.battle_addToAllies();
    if(!options.nobattlepm) {
      __panel.battle_addPM();
    };
    if(options.indexes) {
      __panel.battle_indexes();
    };
    if(options.advSelect) {
      __panel.battle_advselect();
    }
    if(!options.noplinfo) {
      __panel.battle_playerInfo();
    };
    if(__panel.getOptions().system.plugins.indexOf('battleimg') == -1) {
      __panel.battle_convertTitles();
    };
    if(!options.nobchat_m) {
      __panel.battle_modifyChat();
    };
    if(!options.nobgen) {
      __panel.battle_generator();
    };
    __panel.battle_redoMove();
    __panel.bind('makebf', function() {
      if(bgenchk) {
        __genInitHandler();
      }
      if(bredochk) {
        __redoInitHandler()
      };
      if(!enemySelectBox) enemySelectBox = document.getElementsByTagName('select')[0];
      if(selectedEnemy) jQuery(enemySelectBox).val(selectedEnemy);
    });
    __panel.bind('beforeFight', function() {
      if(bredochk && bredochk.attr('checked')) {
        __redoFillHandler()
      };
      bgenerated = rightattack = leftattack = defence = __panel.__clrline = false;
    });
    __panel.bind('fight', function() {
      bgenerated = rightattack = leftattack = defence = __panel.__clrline = false;
    });
    if(options.battle_moves) {
      __panel.bind('updatedata', function() {
        if(window.waitforturn == 1 && !battleMovesRequest) {
          battleMovesRequest = jQuery.ajax('b.php?bid=' + window.bid, {
            success: function(response) {
              battleMovesRequest = false;
              var i = response.indexOf('style=\'color:#008800\' target=_blank');
              while(i > 0) {
                var esIndex = response.indexOf('=', i - 10);
                if(esIndex == -1) break;
                var plId = response.substr(esIndex + 1, i - esIndex - 2);
                var link = false;
                for(var j = 0; j < allies['id'].length; j++) {
                  if(plId == allies['id'][j]) {
                    link = allies['link'][j];
                    break;
                  };
                };
                if(!link) {
                  for(var j = 0; j < enemies['id'].length; j++) {
                    if(plId == enemies['id'][j]) {
                      link = enemies['link'][j];
                      break;
                    };
                  };
                };
                link.style.color = '#008800';
                i = response.indexOf('style=\'color:#008800\' target=_blank', i + 1);
              };
            }
          });
        };
      });
    };
    if(!__panel.__makebfHandler) {
      __panel.__makebfHandler = function() {
        if(!window.waitforturn) __panel.battle_playersInit();
        __panel.__clrline = false;
      };
      __panel.bind('makebf', __panel.__makebfHandler);
    };
    __panel.__battlePlayersInit = function() {
      if(!options.nobattlepm) {
        __panel.battle_addPM();
      };
      if(options.indexes) {
        __panel.battle_indexes();
      };
      if(options.advSelect) {
        __panel.battle_advselect();
      };
      if(!options.noplinfo) {
        __panel.battle_playerInfo();
      };
      if(__panel.getOptions().system.plugins.indexOf('battleimg') == -1) {
        __panel.battle_convertTitles();
      };
    };
    __panel.bind('playersInit', __panel.__battlePlayersInit);
    __panel.bind('clrline', function() {
      __panel.__clrline = true;
    });
    if(!options.nobchat_m && !__panel.__updatechatlinesHandler) {
      __panel.__updatechatlinesHandler = function() {
        __panel.battle_modifyChat();
      };
      __panel.bind('updatechatlines', __panel.__updatechatlinesHandler);
    };
  },
  
  battle_playersInit: function() {
    try {
    var images = {
      name: [], 
      img: [],
      pos: []
    };
    var myImgIndex = -1;
    var orientation = 0;
    if(!options.name) __panel.battle_getUserInfo();
    var name = options.name;
    jQuery(document.images).each(function(i) {
      var alt = this.title? this.title: this.alt;
      if((this.src.indexOf('i/icons/') != -1 || this.src.indexOf('b_files/') != -1) && alt) {
        var parts = alt.split(' [');
        if(parseInt(parts[1]))
          images['name'].push(parts[0]);
        else {
          images['name'].push(alt.split('] [')[0] + ']');
        };
        images['img'].push(this);
        if(this.src.indexOf('left') != -1) images['pos'] = -1;
        else if(this.src.indexOf('right') != -1) images['pos'] = 1;
        else if(this.src.indexOf('tigr') != -1) this.className += 'tigr';
        if(name == parts[0]) {
          myImgIndex = images['img'].length - 1;
          if(this.src.indexOf('left') != -1) orientation = -1;
          else if(this.src.indexOf('right') != -1) orientation = 1;
        };
      };
    });
    if(orientation == 0) {
       var name = images['name'][images['name'].length - 1];
       for(var i = document.links.length - 1; i > 0; i--) {
         if(document.links[i].textContent == name) {
           var matches = document.links[i].nextSibling.nextSibling.innerHTML.match(/расстояние: ([\d]+)/);
           myImgIndex = images['img'][0].parentNode.parentNode.childNodes.length - matches[1] + 1;
           break;
         }
       }
    };
    //Экспорт для battleimg
    __panel.myImgIndex = myImgIndex;
    __panel.orientation = orientation;
    __panel.btlImages = images;
    var i=0;
    var ac = -1; //Allie counter
    allies = {
      id: [], 
      name: [],
      level: [],
      link: [], 
      hpcur: [],
      hpall: [],
      img: [], 
      distance: [],
      power: [],
      damage: [],
      killed: [],
      weapon: [],
      weapon_code: [],
      visibility: []
    };
    var foundImages = [];
    var parentNode = null;
    for(; i < document.links.length && document.links[i].href.indexOf('javascript:') != 0; i++) {
      var l = document.links[i];
      if(l.href.indexOf('info.php') != -1) {
        ac++;
        var name = l.textContent || l.innerText;
        var nextDiv = l.nextSibling;
        while(nextDiv.nextSibling && (!nextDiv.tagName || nextDiv.tagName.toUpperCase() != 'DIV')) nextDiv = nextDiv.nextSibling;
        var matches = nextDiv.innerHTML.match(/.*HP:[^\d]+(\d+)[^\d]+(\d+)[^\d]+: (\d+)[^\d]+: (\d+)[^\d]+: (\d+)[^\d]+(\d+)[^\d+][^\d]+: (\d+)/);
        if(matches) {
          if(parentNode && parentNode != l.parentNode) {i--; break;}
          parentNode =  l.parentNode;
          allies['id'].push(l.href.split('=')[1]);
          allies['name'].push(name);
          if(String(l.nextSibling.data || l.nextSibling.nodeValue).search(/([0-9]+)/))
            allies['level'].push(RegExp.$1);
          else
            allies['level'].push('');
          allies['link'].push(l);
          allies['hpcur'].push(parseInt(matches[1]));
          allies['hpall'].push(parseInt(matches[2]));
          try {
            var iind = images['name'].indexOf(name);
            foundImages.push(iind);
          } catch(e) {};
          allies['img'].push(images['img'][iind]);
          if(__panel.orientation == 1) {
            if(iind > myImgIndex)
              allies['distance'].push(-parseInt(matches[3]));
            else
              allies['distance'].push(parseInt(matches[3]));
          } else if(__panel.orientation == -1) {
            if(iind < myImgIndex)
              allies['distance'].push(-parseInt(matches[3]));
            else
              allies['distance'].push(parseInt(matches[3]));
          } else {
            if(images['img'][iind] && images['img'][iind].parentNode.cellIndex < myImgIndex)
              allies['distance'].push(-parseInt(matches[3]));
            else
              allies['distance'].push(parseInt(matches[3]));
          };
          allies['power'].push(parseInt(matches[4]));
          allies['damage'].push(parseInt(matches[5]));
          allies['killed'].push(parseInt(matches[6]));
          allies['visibility'].push(parseInt(matches[7]));
          var lis = nextDiv.getElementsByTagName('li');
          if(lis.length) { 
            allies['weapon'].push(lis[0].textContent || lis[0].innerText);
            if(lis[0].firstChild.href) {
              var parts = lis[0].firstChild.href.split('=');
              allies['weapon_code'].push(parts[1]);
            } else {
              allies['weapon_code'].push('');
            };
          } else {
            allies['weapon'].push('');
            allies['weapon_code'].push('');
          };
        };
      };
    };
    enemies = {
      id: [], 
      name: [],
      level: [], 
      link: [], 
      hpcur: [],
      hpall: [],
      img: [], 
      distance: [],
      power: [],
      damage: [],
      weapon: [],
      weapon_code: [],
      killed: [],
      visibility: []
    };
    var ec = -1;
    var len = document.links.length;
    for(; i < len; i++) {
      var l = document.links[i];
      if(l.href.indexOf('info.php') != -1) {
        ec++;
        var name = l.textContent || l.innerText;
        var nextDiv = l.nextSibling.nextSibling;
        var matches = nextDiv.innerHTML.match(/.*HP:[^\d]+(\d+)[^\d]+(\d+)[^\d]+: (\d+)[^\d]+: (\d+)[^\d]+: (\d+)[^\d]+(\d+)[^\d+][^\d]+: (\d+)/);
        if(matches) {
          enemies['id'].push(l.href.split('=')[1]);
          enemies['name'].push(name);
          if(String(l.nextSibling.data || l.nextSibling.nodeValue).search(/([0-9]+)/))
            enemies['level'].push(RegExp.$1);
          else
            enemies['level'].push('');
          enemies['link'].push(l);
          enemies['hpcur'].push(parseInt(matches[1]));
          enemies['hpall'].push(parseInt(matches[2]));
          var iind = images['name'].indexOf(name);
          foundImages.push(iind);
          enemies['img'].push(images['img'][iind]);
          var distance = parseInt(matches[3]);
          if(__panel.orientation == 0) {
            if(images['img'][iind] && images['img'][iind].parentNode.cellIndex < myImgIndex)
              enemies['distance'].push(-parseInt(matches[3]));
            else
              enemies['distance'].push(parseInt(matches[3]));
          } else {
            enemies['distance'].push(parseInt(matches[3]));
          };
          
          enemies['power'].push(parseInt(matches[4]));
          enemies['damage'].push(parseInt(matches[5]));
          enemies['killed'].push(parseInt(matches[6]));
          enemies['visibility'].push(parseInt(matches[7]));
          var lis = nextDiv.getElementsByTagName('li');
          if(lis.length) {
            enemies['weapon'].push(lis[0].textContent || lis[0].innerText);
            if(lis[0].firstChild.href) {
              var parts = lis[0].firstChild.href.split('=');
              enemies['weapon_code'].push(parts[1]);
            } else {
              enemies['weapon_code'].push('');
            };
          } else {
            enemies['weapon'].push('');
            enemies['weapon_code'].push('');
          };
        };
      };
    };
    
    jQuery(images['img']).filter(function(index) {
      this.__index = index;
      return foundImages.indexOf(index) == -1; 
    }).each(function(index) {
      var bs = document.getElementsByTagName('b');
      var item = null;
      for(var i = 0; i < bs.length; i++) {
        if(bs[i].innerHTML == images['name'][this.__index])
          item = bs[i];
      };
      if(!item) return;
      var matches = (item.nextSibling.nextSibling || item.nextSibling).innerHTML.match(/.*HP:[^\d]+(\d+)[^\d]+(\d+)[^\d]+: (\d+)[^\d]+: (\d+)[^\d]+: (\d+)[^\d]+(\d+)[^\d+][^\d]+: (\d+)/);
      if(matches) {
        enemies['id'].push(null);
        enemies['name'].push(images['name'][this.__index]);
        enemies['link'].push(item);
        enemies['hpcur'].push(parseInt(matches[1]));
        enemies['hpall'].push(parseInt(matches[2]));
        enemies['img'].push(this);
        enemies['distance'].push(parseInt(matches[3]));
        enemies['power'].push(parseInt(matches[4]));
        enemies['damage'].push(parseInt(matches[5]));
        enemies['killed'].push(parseInt(matches[6]));
        enemies['visibility'].push(parseInt(matches[7]));
        enemies['weapon'].push('неизвестное оружие');
        enemies['weapon_code'].push('');
      };
    });
    } catch(e) {
      __panel.dispatchException(e);
    };
    __panel.triggerEvent('playersInit', {}, true);
  },
  
  battle_getUserInfo: function() {
    //получаем id юзера
    var cookies = document.cookie.split('; ');
    for(var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split('=');
      if(parts[0] == 'uid') {
        options.uid = parts[1];
        break;
      };
    };
    //получаем ник юзера
    for(var i = 0; i < document.links.length; i++) {
      if(document.links[i].href.indexOf('info.php?id=' + options.uid) != -1) {
        options.name = document.links[i].textContent || document.links[i].innerText;
      };
    };
  }
})})(window.__panel);