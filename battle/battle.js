(function(panel, $) {
  var bgenerated, rightattack, leftattack, defence, prevRightAttack, prevLeftAttack, prevDefence, bsrcframe, toAllies, battlechat, bgenerator, $bgenchk, walk, bredo;
  var battleFixed;
  var allies = {name: []}, enemies = {name: []};
  var enemySelectBox;
  var jsEnabled;
  var battle_modifyChatWait;
  var __genInitHandler, __redoInitHandler, __redoFillHandler;
  var battleMovesRequest;
  var selectedEnemy, savedMove;

jQuery.extend(panel, {
  battle_fix: function(options) {
    if(battleFixed) return;
    window.bf3 = window.bf3.replace(/<a/, '<a id="updbutton"');
    bsrcframe = $('#bsrc');
    bsrcframe.load(function() {
      panel.triggerEvent('updatedata', {}, true);
    });
    window.__updatebf = window.updatebf;
    window.updatebf = function() {
      window.__updatebf();
      setTimeout(function() {
        panel.triggerEvent('updatebf', {}, true);
      }, 10);
    };
    window.__updatedata = window.updatedata;
    window.updatedata = function() {
      panel.triggerEvent('beforeupdatedata', {}, true);
      window.__updatedata();
    };
    panel.bind('beforeupdatedata', function() {
      if($('#updbutton').length) {
        $('#updbutton').html('Подождите...');
      };
    });
    panel.bind('updatedata', function() {
      if($('#updbutton').length) {
        $('#updbutton').html('Обновить');
      };
    });
/*    if(options.wartime_s > 0) {
      if(window.DataTimer > 0) clearTimeout(window.DataTimer);
      window.DataTimer = setTimeout('updatedata()', options.wartime_s * 1000);
      panel.bind('updatedata', function() {
        if(window.DataTimer > 0) clearTimeout(window.DataTimer);
        window.DataTimer = setTimeout('updatedata()', options.wartime_s * 1000);
      });
    }*/
    window.__makebf = window.makebf;
    window.makebf = function() {
      window.__makebf();
      panel.triggerEvent('makebf', {}, true);
    };
    $(window).keydown(function(e) {
      if(e.keyCode == 13 && e.ctrlKey) {
        if($('#movego').length) fight();
        else updatedata();
        return false;
      }
    });
    window.__fight = window.fight;
    window.fight = function() {
      panel.triggerEvent('beforeFight', {}, true);
      window.__fight();
      panel.triggerEvent('fight', {}, true);
    };
    window.__updatechatlines = window.updatechatlines;
    
    window.updatechatlines = function() {
      window.__updatechatlines();
      panel.triggerEvent('updatechatlines', {}, true);
    };
  
    window.__clrline = window.clrline;
    window.clrline = function() {
      panel.triggerEvent('before_clrline', {}, true);
      window.__clrline();
      panel.triggerEvent('clrline', {}, true);
    };
    battleFixed = true;
    
  },
  
  battle_end: function(options) {
    panel.get('BattleID', function(data) {
      if(location.search.search(/bid=([0-9]+)/)) {
        var bid = RegExp.$1;
        if(data == bid) {
          panel.triggerEvent('battleend', {bid: bid});
          panel.set('BattleID', false);
        }
      }
    });
  },
  
/*  battle_indexes: function() {
    enemySelectBox = document.getElementsByTagName('select')[0];
    if(!enemySelectBox) return;
    if(enemies.indexesAdded) return;
    enemies.indexesAdded = true;
    var i = 0;
    $(enemySelectBox.childNodes).each(function(index) {
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
  
  battle_add_pm: function() {
    if(enemies.pmAdded) return;
    enemies.pmAdded = true;

    panel.currentPlayerName(function(player_name) {
      if(jsEnabled) {
        var msgfield = document.getElementsByName('oldm')[0];
      } else {
        var msgfield = document.forms['battlechat'].elements['newmessage'];
      };
      for(var j = 0; j < enemies['name'].length; j++) {
        if(enemies['name'][j] == player_name) continue;
        if($('#pm-' + enemies['id'][j]).length) continue;
        var pm = $('<span>[pm]</span>')
          .attr('id', 'pm-' + enemies['id'][j])
          .attr('name', enemies['name'][j])
          .css({
            'fontSize': '8px',
            'cursor': 'pointer',
            'margin': '3px 0px 0px -32px',
            'position': 'absolute'
          })
          .click(function() {
            var name = $(this).attr('name');
            var addText = name + ': ';
            if(msgfield.value.indexOf(addText) == -1)
              msgfield.value += addText;
            msgfield.focus();
          });
        pm.insertBefore(enemies['link'][j]);
      }

      if(allies.pmAdded) return;
      allies.pmAdded = true;
      for(var j = 0; j < allies['name'].length; j++) {
        if(allies['name'][j] == player_name) continue;
        if($('#pm-' + allies['id'][j]).length) continue;

        var pm = $('<span>[pm]</span>')
          .attr('id', 'pm-' + allies['id'][j])
          .attr('name', allies['name'][j])
          .css({
          'fontSize': '8px',
          'cursor': 'pointer',
          'position': 'absolute',
          'margin': '5px 0px 0px 15px'
          })
          .click(function() {
            var name = $(this).attr('name');
            var addText = name + ': ';
            if(msgfield.value.indexOf(addText) == -1)
              msgfield.value += addText;
            msgfield.focus();
          });
        pm.insertBefore(allies['link'][j].nextSibling.nextSibling);
      };
    });
  },
  
  battle_advselect: function() {
    if(!enemySelectBox) enemySelectBox = document.getElementsByTagName('select')[0];
    if(!enemySelectBox) return;
    if(enemies.advSelectCreated || enemySelectBox.advSelectCreated) return;
    enemies.advSelectCreated = enemySelectBox.advSelectCreated = true;
    $(enemySelectBox.childNodes).each(function(index) {
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
    panel.currentPlayerName(function(name) {
      $(document.images).each(function(index) {
        if(this.src.indexOf('i/icons/') != -1 && this.alt != undefined) {
          this.title = this.alt;
          var parts = this.alt.split(' ');
          if(name == parts[0]) {
            this.style.border='1px solid red';
          };
        };
      });
    });
  },
  
  battle_to_allies: function(options) {
    var battlechat = battlechat = document.forms['battlechat'];
    toAllies = $('<input type="checkbox">')
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
    $(battlechat).prepend(toAllies);
    
    panel.bind('clrline', function() {
      var oldm = document.getElementsByName('oldm')[0];
      if(toAllies.attr('checked')) oldm.value = '~';
      else oldm.value='';
      savedMove = true;
      if(!enemySelectBox) enemySelectBox = document.getElementsByTagName('select')[0];
      selectedEnemy = $(enemySelectBox).val();
    });
    $(battlechat).prepend('<font>своим</font>');
    var bowrds;
    if(options.bwords && (bwords = options.bwords.split('|')) && bwords.length) {
      var wordsdiv = $('<div id="wordsdiv"></div>')
        .css({
          'display': 'none',
          'position': 'absolute'
        }).appendTo(document.body);
      var btn = $('<a title="Быстрые фразы">&nbsp;&darr;&nbsp;</a>')
        .css({
        'cursor': 'pointer',
        'margin-right': '10px'
        })
        .click(function(e) {
          $(wordsdiv).css({
            'left': $(this).css('left') + 5,
            'top': $(this).css('top') + 25
          }).show();
          return false;
        });
      for(var i = 0; i < bwords.length; i++) {
        var element = $('<a class="bword">' + bwords[i] + '</a>').
          css({
            'border': '1px solid #339933',
            'display': 'block',
            'background': '#f0fff0',
            'height': '20px',
            'padding': '2px 4px'
          }).click(function() {
            var wordsdiv = $('#wordsdiv'); 
            if(wordsdiv && Element.visible(wordsdiv)) {
              Element.hide(wordsdiv);
            };
            battlechat.oldm.value = panel.textContent || panel.text || panel.innerText;
            document.forms['battlechat'].elements[document.forms['battlechat'].elements[document.forms['battlechat'].elements.length - 1].innerHTML == 'Обновить'? document.forms['battlechat'].elements.length - 2: document.forms['battlechat'].elements.length - 1].click();
          });
          $(wordsdiv).append(element);
      };
      $(document.body).click(function() {
        $('#wordsdiv:visible').hide();
      });
      btn.before(s);
    };
    var r = $('<button>Обновить</button>')
      .css({'background': '#D0EED0'})
      .click(function(e) {
        updatedata();
        return false;
      }).appendTo(battlechat);
  },
  
  battle_modify_chat: function() {
    try {
      var logField;
      if(jsEnabled) 
        logField = $('#log')[0];
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
            panel.dispatchException(e);
          };
        };
      };
    } catch(e) {
      if(!battle_modifyChatWait)
        battle_modifyChatWait = setTimeout(panel.battle_modifyChat.bind(this), 2000);
    };
    
  },
  
  battle_player_info: function(options) {
    var data = {};
    for(var i = 0; i < allies['id'].length; i++) {
      if(allies['id'][i] == panel.currentPlayerID()) {
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
        if(enemies['id'][i] == panel.currentPlayerID()) {
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
      if(!$('#infoElem1').length || !$('#infoElem2').length) {
        var elems = $('.txt');
        for(var j = 0; j < elems[0].childNodes.length; j++) {
          if(elems[0].childNodes[j].style) elems[0].childNodes[j].style.styleFloat = elems[0].childNodes[j].style.cssFloat = 'left';
        };
        for(var j = 0; j < elems[1].childNodes.length; j++) {
          if(elems[1].childNodes[j].style) elems[1].childNodes[j].style.styleFloat = elems[1].childNodes[j].style.cssFloat = 'left';
        };
        var elem1 = $('<div id="infoElem1"></div>').css({'float': 'right', 'margin-right': '40px'}).appendTo(elems[1]);
        var elem2 = $('<div id="infoElem2"></div>').css({'float': 'left', 'margin-left': '30px'}).appendTo(elems[2]);
      };
      if($('#infoElem1').length) {
        $('#infoElem1').html('<i>HP:</i> ' + (data['hpcur'] < data['hpall']/10? '<font color=red>' + data['hpcur'] + '</font>': data['hpcur']) + '&nbsp;/&nbsp;<font style="color: green; margin-right: 30px;">' + data['hpall'] + '</font><i>урон:</i> <font style="color: #790000;">' + data['damage'] + '</font> (' + data['killed'] + ') ');
      };
      if($('#infoElem2').length) {
        $('#infoElem2').html('<i>видимость:</i> <font style="color: #0072bc">' + data['visibility'] + '%</font>' + '&nbsp;&nbsp;&nbsp;<b><font color="blue" title="количество друзей">' + allies['id'].length + '</font></b> / <b><font color="red" title="количество противников">' + enemies['id'].length + '</font></b>');
      };
    } catch(e) {};
  },
  */
  battle_generator: function(options) {
    __genInitHandler = function(){
      if(bgenerated && defence) {
        if(!isNaN(rightattack) && $('#right_attack' + rightattack)) $('#right_attack' + rightattack).click();
        if(!isNaN(defence)) $('#defence' + defence).click();
        if(!isNaN(leftattack)) $('#left_attack' + leftattack).click();
        if(walk) $('#walk').attr('checked', 1);
      } else if($bgenchk.attr('checked')) {
        if($('#right_attack1').length){
          var r = Math.floor(Math.random() * 3) + 1;
          $('#right_attack'+r).click();
          rightattack = r;
        };
        if($('#left_attack1').length) {
          var l = Math.floor(Math.random() * 3) + 1;
          if(options.genuniq) {
            while(l == r) l = Math.floor(Math.random()*3) + 1;
          };
          $('#left_attack'+l).click();
          leftattack = l;
        };
        if($('#defence1').length) {
          var d = Math.floor(Math.random() * 3) + 1;
          $('#defence' + d).click();
          defence = d;
        };
        if(walk) $('#walk').attr('checked', 1);
        bgenerated = true;
        
      }
      if($('#bf').length) $('#bf').prepend(bgenerator);
      else {
        bgenerator.prepend(document.getElementsByTagName('script')[4]);
      };
    };
    
    if(!bgenerator) {
      bgenerator = $('<div id="generator"></div>').css({'margin':'0 0 0 20px','position':'absolute'});
      if(!$bgenchk) {
        $bgenchk = $('<input type="checkbox">')
          .appendTo(bgenerator)
          .change(function(e) {
            panel.setOptions({'autogen': panel.checked}, 'battle');
            if(panel.checked){
              if($bredochk && $bredochk.attr('checked')) $bredochk.click();
            };
          });
      }
      $('#walk').change(function() {
        if(this.checked) walk = true;
      });
      if(parseInt(options.autogen) && 
         (!panel.getOptions().settings.battle.battle_redo || 
          !parseInt(panel.getOptions().settings.battle.battle_redo.autoredo))) {
        $bgenchk.attr('checked', 1);
      }
      $('<a href="#">случайный ход</a>').click(
        function(){ bgenerated = false; __genInitHandler();
      }).appendTo(bgenerator);
    }
    if($('#bf').length) $('#bf').prepend(bgenerator);
    else {
      bgenerator.prepend(document.getElementsByTagName('script')[4]);
    };
    if($bgenchk.attr('checked')) {
      setTimeout(function() { __genInitHandler(); }, 10);
    };
  },
  
  battle_redo: function(options) {
    __redoInitHandler = function(){
      if(prevRightAttack) {
        $('#right_attack'+prevRightAttack).click();
      };
      if(prevLeftAttack) {
        $('#left_attack'+prevLeftAttack).click();
      };
      if(prevDefence) {
        $('#defence'+prevDefence).click();
      };
      if(walk) {
        var __walk = document.getElementsByName('walk');
        if(__walk && __walk.length && __walk[0]) __walk[0].click();
      };
      var bf = $('#bf');
      if(bf.length) bf.prepend(bredo);
      else {
        var s = document.getElementsByTagName('script')[4];
        $(s).before(bredo);
      };
    };
    __redoFillHandler = function() {
      if($('#right_attack1')) {
        if($('#right_attack1').checked) {
          prevRightAttack = 1;
        } else if($('#right_attack2').checked) {
          prevRightAttack = 2;
        } else if($('#right_attack3').checked) {
          prevRightAttack = 3;
        };
      }
      if($('#left_attack1')) {
        if($('#left_attack1').checked) {
          prevLeftAttack = 1;
        } else if($('#left_attack2').checked) {
          prevLeftAttack = 2;
        } else if($('#left_attack3').checked) {
          prevLeftAttack = 3;
        };
      };
      if($('#defence1').checked) {
        prevDefence = 1;
      } else if($('#defence2').checked) {
        prevDefence = 2;
      } else if($('#defence3').checked) {
        prevDefence = 3;
      };
      var __walk = document.getElementsByName('walk');
      if(__walk && __walk.length && __walk[0]) walk = __walk[0].checked;
    };
    
    bredo = $('<div id="redo_move"></div>')
      .css({'margin':'20px 0 0 20px','position':'absolute'});
      
    var bf = $('#bf');
    if(bf.length) bf.prepend(bredo);
    else {
      var s = document.getElementsByTagName('script')[4];
      $(s).before(bredo);
    };
    $bredochk = $('<input type="checkbox" />')
      .change(function(e) {
        var target = e.currentTarget;
        options.autoredo = target.checked;
        options.save();
        if(target.checked) {
          if($bgenchk && $bgenchk.attr('checked')) $bgenchk.click();
        };
      })
      .appendTo(bredo);
    if(options.autoredo) $bredochk.attr('checked', 1);
      
    var a = $('<span>запомнить ход</span>').appendTo(bredo);
    
  },

  battle_std_init: function() {
    panel.triggerEvent('battlebegin', {'bid': window.BattleID});
    panel.set('BattleID', window.BattleID);

    //panel.battle_players_init();
  },
  
  battle_js_init: function() {
    panel.triggerEvent('battlebegin', {'bid': window.BattleID});
    
    panel.set('BattleID', window.BattleID);
    jsEnabled = true;
    //panel.battle_players_init();
    panel.bind('makebf', function() {
      if($bgenchk) {
        __genInitHandler();
      }
      if($bredochk) {
        __redoInitHandler()
      };
      if(!enemySelectBox) enemySelectBox = document.getElementsByTagName('select')[0];
      if(selectedEnemy) $(enemySelectBox).val(selectedEnemy);
    });
    panel.bind('beforeFight', function() {
      if($bredochk && $bredochk.attr('checked')) {
        __redoFillHandler()
      };
      bgenerated = rightattack = leftattack = defence = panel.__clrline = false;
    });
    panel.bind('fight', function() {
      bgenerated = rightattack = leftattack = defence = panel.__clrline = false;
    });
    // if(options.battle_moves) {
    //   panel.bind('updatedata', function() {
    //     if(window.waitforturn == 1 && !battleMovesRequest) {
    //       battleMovesRequest = $.ajax('b.php?bid=' + window.bid, {
    //         success: function(response) {
    //           battleMovesRequest = false;
    //           var i = response.indexOf('style=\'color:#008800\' target=_blank');
    //           while(i > 0) {
    //             var esIndex = response.indexOf('=', i - 10);
    //             if(esIndex == -1) break;
    //             var plId = response.substr(esIndex + 1, i - esIndex - 2);
    //             var link = false;
    //             for(var j = 0; j < allies['id'].length; j++) {
    //               if(plId == allies['id'][j]) {
    //                 link = allies['link'][j];
    //                 break;
    //               };
    //             };
    //             if(!link) {
    //               for(var j = 0; j < enemies['id'].length; j++) {
    //                 if(plId == enemies['id'][j]) {
    //                   link = enemies['link'][j];
    //                   break;
    //                 };
    //               };
    //             };
    //             link.style.color = '#008800';
    //             i = response.indexOf('style=\'color:#008800\' target=_blank', i + 1);
    //           };
    //         }
    //       });
    //     };
    //   });
    // };
    if(!panel.__makebfHandler) {
      panel.__makebfHandler = function() {
        //if(!window.waitforturn) panel.battle_players_init();
        panel.__clrline = false;
      };
      panel.bind('makebf', panel.__makebfHandler);
    };
/*    panel.__battlePlayersInit = function() {
      if(!options.nobattlepm) {
        panel.battle_addPM();
      };
      if(options.indexes) {
        panel.battle_indexes();
      };
      if(options.advSelect) {
        panel.battle_advselect();
      };
      if(!options.noplinfo) {
        panel.battle_player_info();
      };
      if(panel.getOptions().system.plugins.indexOf('battleimg') == -1) {
        panel.battle_convertTitles();
      };
    };*/
    //panel.bind('players_init', panel.__battlePlayersInit);
    panel.bind('clrline', function() {
      panel.__clrline = true;
    });
    /*if(!options.nobchat_m && !panel.__updatechatlinesHandler) {
      panel.__updatechatlinesHandler = function() {
        panel.battle_modifyChat();
      };
      panel.bind('updatechatlines', panel.__updatechatlinesHandler);
    };*/
  }
  
/*  battle_players_init: function() {
    try {
      var images = {
        name: [], 
        img: [],
        pos: []
      };
      var myImgIndex = -1;
      var orientation = 0;
      panel.currentPlayerName(function(name) {
        $(document.images).each(function(i) {
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
        panel.myImgIndex = myImgIndex;
        panel.orientation = orientation;
        panel.btlImages = images;
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
              if(panel.orientation == 1) {
                if(iind > myImgIndex)
                  allies['distance'].push(-parseInt(matches[3]));
                else
                  allies['distance'].push(parseInt(matches[3]));
              } else if(panel.orientation == -1) {
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
              if(panel.orientation == 0) {
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
        
        $(images['img']).filter(function(index) {
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
        panel.triggerEvent('players_init', {}, true);
      });
    } catch(e) {
      panel.dispatchException(e);
    };
  }*/

})})(window.__panel, $);