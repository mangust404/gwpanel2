// author   гном убийца
// id       433067
(function(panel, $) {
  var focused;

  function removeAllTooltips() {
    $('.player-tools').remove();
  }

  $.extend(panel, {
    common_players_tooltip: function(options) {
      if(location.pathname.indexOf('war') > -1) return;
      /*if (location.pathname == "/info.php") {

        var $playerLinkOnInfo = $('img[src*="male.gif"]').closest('td').find('b');

        $playerLinkOnInfo.replaceWith(
          $('<a>')
          .prop('href', location.href)
          .html($playerLinkOnInfo.text())
          .css({
            "text-decoration": "none",
            "font-weight": "bold"
          })
        );

      }*/
      $(document.body).on('click', removeAllTooltips);

      $('a[href*="info.php?id="]:not([href$="' + panel.currentPlayerID() + 
        '"])').mouseenter(function() {

        if(this.$hover) return;
        if(this.$toolWindow && this.$toolWindow.is(':visible')) return;

        if(this.blurTO > 0) {
          clearTimeout(this.blurTO);
          this.blurTO = 0;
        }
        var $that = $(this);
        var that = this;

        if(this.hoverTO > 0) return;
        this.hoverTO = setTimeout(function() {
          var position = $that.position();
          $('.player-hover').remove();
          that.$hover = $('<div class="player-hover">?</div>')
            .css({
              position: 'absolute',
              left: position.left + $that.width(),
              top: position.top
            })
            .click(function() {
              var paramButtons, toolHTML, i, length;

              that.$hover.remove();
              delete that.$hover;

              paramButtons = [
                "Написать письмо", "send_mail.png",
                "Передать деньги", "send_money.png",
                "Добавить в друзья", "friend_list.png",
                "Список аренды", "list_rents.png",
                /* вторая строка */
                "Письма от персонажа ", "mails_from.png",
                "Передать предмет", "send_item.png",
                "Добавить в черный список", "black_list.png",
                "Иски игрока", "claims.png"
              ];

              $('.player-tools').remove();

              that.$toolWindow = $('<div class="player-tools"></div>')
                .addClass('pane left');
              toolHTML = "&nbsp;";
              for (i = 0, length = paramButtons.length; i < length; i = i + 2) {
                if (i == 8) that.$toolWindow.append('<br>');
                that.$toolWindow.append('<a title="' + paramButtons[i] + 
                  '"><img src="' + panel.iconURL(paramButtons[i + 1]) + 
                  '"></a>&nbsp;');

              }

              $('body').append(that.$toolWindow);

              showToolWindow($that, that.$toolWindow);
              return false;
            })
            .mouseover(function() {
              that.focused++;
            })
            .mouseleave(function() {
              that.focused--;
              if(that.focused <= 0) {
                that.$hover.remove();
                delete that.$hover;
              }
            })
            .insertAfter(that);
          that.hoverTO = 0;
        }, 100);
        this.focused++;
      }).mouseleave(function() {
        if(this.hoverTO > 0) {
          clearTimeout(this.hoverTO);
          this.hoverTO = 0;
        }
        if(!this.$hover) return;

        var that = this;
        this.focused--;
        if(this.blurTO > 0) return;
        this.blurTO = setTimeout(function() {
          if(that.focused <= 0 && that.$hover) {
            that.$hover.remove();
            delete that.$hover;
          }
          that.blurTO = 0;
        }, 500);
      }).click(function() {
        //clearTimeout(showWaitId);
      }).each(function() {
        this.focused = 0;
      });

      if (location.pathname == '/send.php' || location.pathname == "/home.senditem.php" || location.pathname == "/items.php") {
        // Проставление ника на соответствующих формах

        // Интервал, через который имя для передачи (денег, предметов) будет удалено (ms).
        var clearDataTimeout = 300000;
        var $input;
        var time = new Date().getTime();
        panel.get("nameToSendMoneyItem", function(info) {
          if (info != null) {
            time = time - info.time;
            if (clearDataTimeout > time) {
              $input = $('tr:contains("Имя получателя:")').find('input');
              if ($input.length) {
                $input.eq(0).prop("value", info.name);
                panel.set("nameToSendMoneyItem", null);
              } else {
                panel.showFlash("Выберите предмет для передачи игроку <b>" + info.name + "</b>, и нажмите «Передать».", 'message', 5000);
              }
            } else {
              panel.set("nameToSendMoneyItem", null);
            }
          }
        });
      }

      panel.onunload(function() {
        $(document.body).off('click', removeAllTooltips);
        $('.player-hover, .player-tools').remove();
      });
    }
  });

  function showToolWindow($playerLink, $toolWindow) {
    var $urlTool;
    var dimensions, left, top, id, name, login, bodyWidth, info;

    id = $playerLink.prop("href").match(/(\d+)/)[0];
    name = $playerLink.text();
    login = name.replace(/ /g, '+');
    dimensions = $playerLink.position();
    bodyWidth = $('body').width() - 275;

    left = dimensions.left - 80;
    if (left < 10 || left > bodyWidth) {
      if (left < 10) {
        left = 10;
      } else {
        left = bodyWidth;
      }
    }
    top = dimensions.top + 22;

    $toolWindow.css({
      position: 'absolute',
      left: left,
      top: top
    });

    $urlTool = $toolWindow.find('a');

    // Первая строка:
    // Написать письмо
    $urlTool.eq(0).prop("href", "http://www.ganjawars.ru/sms-create.php?mailto=" + login);

    // Передать деньги
    $urlTool.eq(1).unbind().click(
      function() {
        info = {
          name: name,
          time: new Date().getTime()
        };
        panel.set("nameToSendMoneyItem", info);
      }
    ).prop("href", "http://www.ganjawars.ru/send.php");

    // Добавить в друзья
    $urlTool.eq(2).unbind().click(
      function() {
        addToFriendOrEnemy(0, name);
      }
    ).css({
      "cursor": "pointer"
    });

    // Список аренды
    $urlTool.eq(3).prop("href", "http://www.ganjawars.ru/info.rent.php?id=" + id);

    // Вторя строка:
    // Письма от персонажа
    $urlTool.eq(4).prop("href", "http://www.ganjawars.ru/sms.php?page=0&search=" + login)
      .prop("title", "Письма от персонажа " + name);

    //Передать предмет
    $urlTool.eq(5).unbind().click(
      function() {
        info = {
          name: name,
          time: new Date().getTime()
        };
        panel.set("nameToSendMoneyItem", info);
      }
    ).prop("href", "http://www.ganjawars.ru/items.php");

    // Добавить в черный список
    $urlTool.eq(6).unbind().click(function() {

      addToFriendOrEnemy(1, name);

    }).css({
      "cursor": "pointer"
    });

    //Иски игрока
    $urlTool.eq(7).prop("href", "http://www.ganjawars.ru/isks.php?sid=" + id + "&st=1&period=4");
  }

  function addToFriendOrEnemy(type, name) {
    var text;

    $.ajax({
      type: "POST",
      url: "http://www.ganjawars.ru/home.friends.php",
      data: "blop=" + type + "&addfriend=" + panel.encodeURIComponent(name),
      success: function(data) {
        text = !type ? "Ваши друзья" : "Черный список";
        if ($(data).find('b:contains("' + text + '")').closest('table').find('b:contains("' + name + '")').length) {
          text = "<b>" + name + "</b> добавлен в ";
          text += !type ? "друзья." : "черный список.";
          panel.showFlash(text, 'message', 2500);
        }
      }
    });
  }

})(window.__panel, jQuery);