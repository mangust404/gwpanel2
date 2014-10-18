function presentation_start(callback) {
  window.$ = jQuery;
(function($) {
  var myDate = new Date();
  myDate.setMonth(myDate.getMonth() + 120);
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = 'http://gwpanel.org/panel2/version_production.js?_' + (new Date).getTime();
  s.addEventListener('load', function() {
    document.cookie = "gwp2_v=" + window.current_panel_version + ";expires=" + myDate 
                      + ";domain=.gwpanel.org;path=/";

    document.cookie = "gwp2_e=deploy;expires=" + myDate 
                      + ";domain=.gwpanel.org;path=/";
  	$('<script>', {src: 'http://gwpanel.org/panel2/bootstrap.js'}).appendTo('head');
    waitFor(function() {
      return window.__panel && jQuery('.pane-bubble:visible').length > 0;
    }, function() {
      if(callback) callback();
      else initPresentaion();
    });
  }, false);
  jQuery('head').get(0).appendChild(s);

})(jQuery);
}

var clearWaitFor = {};

jQuery(document).on('pagehide', function(e, ui) {
  if(ui.prevPage) {
    clearWaitFor[ui.prevPage.attr('id')] = true;
  }
});

function waitFor(condition_func, success_func, timeout) {
  timeout = timeout || 10000; // Максимальный таймаут ожидания - 10 секунд
  var page_id = jQuery('.ui-page:visible').attr('id');
  //console.log(page_id, condition_func);
  var count = 0;
  var f = function() {
    if(clearWaitFor[page_id]) {
      clearWaitFor[page_id] = false;
      return; /// выходим из цикла если юзер перешёл на другую страницу
    }
    if(condition_func()) {
      success_func();
      return;
    }
    count++;
    if(count * 10 > timeout) {
      return;
    }
    setTimeout(f, 10);
  }
  f();
}

function emptyFunc(e) {
  alert(e);
  e.preventDefault();
  e.stopImmediatePropagation();
  return false;
}

/** взято с http://stackoverflow.com/questions/1809275/suppress-jquery-event-handling-temporarily */
(function($) {
$.event.freezeEvents = function(elem) {

    if (typeof($._funcFreeze)=="undefined") {
        $._funcFreeze = [];
    }

    if (typeof($._funcNull)=="undefined") {
        $._funcNull = function() {return false};
    }                

    // don't do events on text and comment nodes
    if ( elem.nodeType == 3 || elem.nodeType == 8 ) {
        return;
    }

    var events = $._data(elem, "events");

    if (events) {
        $.each(events, function(type, definition) {
            $.each(definition, function(index, event) {
                if (event.handler != $._funcNull){
                    $._funcFreeze["events_freeze_" + event.guid] = event.handler;
                    event.handler = $._funcNull;
                }
            })
        })
    }
}

$.event.unFreezeEvents = function(elem) {

    // don't do events on text and comment nodes
    if ( elem.nodeType == 3 || elem.nodeType == 8 )
            return;

    var events = $._data(elem, "events");

    if (events) {
        $.each(events, function(type, definition) {
            $.each(definition, function(index, event) {
                if (event.handler == $._funcNull){
                    event.handler = $._funcFreeze["events_freeze_" + event.guid];
                }
            })
        })
    }
}

$.fn.freezeEvents = function() {
    return this.each(function(){
        $.event.freezeEvents(this);
    });
};

$.fn.unFreezeEvents = function() {
    return this.each(function(){
        $.event.unFreezeEvents(this);
    });
};
})(jQuery);

var current_timeouts = [];
var openPaneStep3Listener;

function clearTimeouts() {
  jQuery.each(current_timeouts, function(i, t) {
    clearTimeout(t);
    delete current_timeouts[i];
  });
}

if(!window.__panel && location.hash.length > 1 && location.hash.indexOf('#step') == 0) {
  presentation_start(function() {
    initPresentaion();
    jQuery('.presentation-step:visible').trigger('pageshow');
  });
}

/*if(!window.__panel) {
  jQuery(document).on('pageshow', '.presentation-step', function() {
    if(!window.$) window.$ = jQuery;
    presentation_start(function() {
      __panel.ready(function() {
        setTimeout(function() {
          jQuery('.presentation-step:visible').trigger('pageshow');
        }, 1000);
      });
    });
  });
}*/

function initPresentaion() {
  if(!window.$) window.$ = jQuery;

  jQuery(document).on('pageshow', '#step1', function() {
    __panel.setOptions(window.panelSettingsCollection.default);
  })
  .on('pageshow', '#step2', function() {
    clearTimeouts();
    jQuery('.pane-bubble').each(function(i) {
      var $that = jQuery(this);
      current_timeouts.push(setTimeout(function() {
        jQuery('.pointing').removeClass('pointing pointing-left pointing-right pointing-top pointing-bottom');
        if(i < 4) {
          if(i < 2) {
            $that.addClass('pointing pointing-left');
          } else {
            $that.addClass('pointing pointing-right');
          }
        } else {
          $that.addClass('pointing pointing-bottom');
        }
        $that.show();
      }, 1500 * i));
    });
    current_timeouts.push(setTimeout(function() {
      jQuery('.pointing').removeClass('pointing pointing-left pointing-right pointing-top pointing-bottom');
    }, jQuery('.pane-bubble').length * 1500));
  })
  .on('pagehide', '#step2', function() {
    clearTimeouts();
    jQuery('.pointing').removeClass('pointing pointing-left pointing-right pointing-top pointing-bottom');
    jQuery('.pane-bubble:not(#pane-bubble-0)').hide();
    jQuery('.settings-hint').remove();
  })
  .on('pageshow', '#step3', function() {
    waitFor(function() {
      return jQuery('.pane:visible').length > 0;
    }, function() {
      var paneID = jQuery('.pane:visible').attr('id').split('-')[1];
      jQuery('#gesture-well-done').show();
      jQuery('<div id="close-pane-hint">Для закрытия окна, кликните на любом пустом месте</div>')
      .appendTo('#pane-' + paneID)
      .css({
        position: 'absolute',
        bottom: 15,
        left: 15
      });
      jQuery('#step3 .first-message').hide();
      jQuery('.pane-bubble:hidden').show();
      jQuery('#step3 .ui-disabled + .description').remove();
      jQuery('#step3 .ui-disabled').removeClass('ui-disabled');

    });
  })
  .on('pagehide', '#step3', function() {
    jQuery('#close-pane-hint').remove();
    jQuery('.pane-bubble:not(#pane-bubble-0)').hide();
    jQuery('.settings-hint').remove();
  }).on('pageshow', '#step5', function() {
    waitFor(function() {
      return jQuery('#panel-settings-editor:visible').length > 0;
    }, function() {
      //jQuery('.close-settings, div.ui-navbar a').off('click');
      jQuery('.close-settings, div.ui-navbar a').freezeEvents();
      setTimeout(function() {
        jQuery('<div class="settings-hint">')
          .html('В этом разделе можно добавить кнопки')
          .css({
            left: '20%',
            top: '15%'
          }).hide()
          .appendTo('#panel-settings-editor').fadeIn();
      }, 1000);

      setTimeout(function() {
        jQuery('<div class="settings-hint">')
          .html('В этом разделе можно добавить виджеты')
          .css({
            right: '20%',
            top: '15%'
          }).hide()
          .appendTo('#panel-settings-editor').fadeIn();
      }, 3000);

      setTimeout(function() {
        jQuery('<div class="settings-hint">')
          .html('В этом разделе производится отключение/включение различных функций')
          .css({
            left: '20%',
            bottom: '15%'
          }).hide()
          .appendTo('#panel-settings-editor').fadeIn();
      }, 5000);

      setTimeout(function() {
        jQuery('<div class="settings-hint">')
          .html('В этом разделе находится всё остальное')
          .css({
            right: '20%',
            bottom: '15%'
          }).hide()
          .appendTo('#panel-settings-editor').fadeIn();
      }, 7000);

      setTimeout(function() {
        jQuery('<a id="next-step" href="#step6" class="ui-btn ui-btn-inline ui-btn-icon-left ui-icon-carat-r">Следующий шаг</a>')
          .css({
            position: 'absolute',
            bottom: '0px',
            left: '45%'
          }).hide()
          .appendTo('#panel-settings-editor').fadeIn();

          jQuery('#step5 .ui-disabled').removeClass('ui-disabled');
      }, 9000);
    });
  }).on('pagehide', '#step5', function() {
    jQuery('.settings-hint, #next-step').remove();
    jQuery('.close-settings, div.ui-navbar a').unFreezeEvents();
    jQuery('.settings-hint').remove();
  }).on('pageshow', '#step6', function() {
    var current_options = __panel.getOptions();
    for(var i = 1; i < 7; i++) {
      current_options.panes[i].buttons = [];
    }
    __panel.setOptions(current_options);
    waitFor(function() {
      return jQuery('#panel-settings-editor:visible').length > 0;
    }, function() {
      jQuery('.close-settings, div.ui-navbar a:not([href=#edit-buttons-wrapper])').freezeEvents();
      jQuery('<div class="settings-hint">')
        .html('Перейдите в раздел "Кнопки"')
        .css({
          left: '20%',
          top: '15%'
        })
        .appendTo('#panel-settings-editor');
    });
    waitFor(function() {
      return jQuery('#panel-settings-editor:visible').length > 0 && jQuery('#panel-settings-editor #edit-buttons-wrapper:visible').length > 0;
    }, function() {
      jQuery('.settings-hint').remove();
      jQuery('.button:not(#button_panel_link)').freezeEvents().find('a').freezeEvents();
      jQuery('#button_panel_link').addClass('pointing pointing-top');
      jQuery('<div class="settings-hint">')
        .html('Кликните на кнопку типа "Ссылка"')
        .css({
          left: '30px',
          top: '350px'
        })
        .appendTo('#panel-settings-editor');
      waitFor(function() {
        return jQuery('#settings-form-popup-popup:not(.ui-popup-hidden):visible').length > 0 && jQuery('#param-title').length > 0;
      }, function() {

        jQuery('.settings-hint').remove();
        jQuery('.pointing, .pointing-top').removeClass('pointing pointing-top');

        jQuery('a:contains(Отменить), .ui-popup-screen').freezeEvents();

        var left = jQuery('#settings-form-popup').offset().left + jQuery('#settings-form-popup').width() - 100;
        current_timeouts.push(setTimeout(function() {
          var h = jQuery('<div class="settings-hint">')
            .html('Введите название, например "тест"')
            .hide()
            .css({
              position: 'fixed',
              left: left,
              top: jQuery('#param-title').offset().top - 20
            })
            .appendTo(document.body).fadeIn();
          jQuery('#param-title').focus(function() {
            h.fadeOut();
          });
        }, 1000));

        current_timeouts.push(setTimeout(function() {
          var h = jQuery('<div class="settings-hint">')
            .html('Введите какую-нибудь ссылку')
            .hide()
            .css({
              position: 'fixed',
              left: left,
              top: jQuery('#param-panel_link-link').offset().top
            })
            .appendTo(document.body).fadeIn();
          jQuery('#param-panel_link-link').focus(function() {
            h.fadeOut();
          });
        }, 2000));

        current_timeouts.push(setTimeout(function() {
          var h = jQuery('<div class="settings-hint">')
            .html('Укажите любое окно')
            .hide()
            .css({
              position: 'fixed',
              left: left,
              top: jQuery('input[name=displace]:first').offset().top,
            })
            .appendTo(document.body).fadeIn();
          jQuery('input[name=displace]').click(function() {
            h.fadeOut();
          });
        }, 3000));

        jQuery('.widget-save').click(function() {
          jQuery('.close-settings').unFreezeEvents();
          setTimeout(function() {
            if(!jQuery('.panel-flash.error:visible, .panel-flash.warning:visible').length) {
              jQuery('.settings-hint').remove();
              jQuery('.close-settings').click();
              jQuery('.pane').remove();
              jQuery('#step6 .first-message').hide();
              jQuery('#step6 .ui-disabled + .description').remove();
              jQuery('#step6 .ui-disabled').removeClass('ui-disabled');
              jQuery('#step6 .description:hidden').show();
            }
          }, 500);
          return true;
        });
      });
    });
  }).on('pagehide', '#step6', function() {
    jQuery('.settings-hint, #next-step').remove();
    jQuery('.close-settings, div.ui-navbar a').unFreezeEvents();
    jQuery('.button').unFreezeEvents().find('a').unFreezeEvents();
    jQuery('.pane').remove();
    jQuery('.settings-hint').remove();
    clearTimeouts();
  }).on('pageshow', '#step7', function() {
    var current_options = __panel.getOptions();
    for(var i = 1; i < 7; i++) {
      current_options.panes[i].widgets = [];
    }
    __panel.setOptions(current_options);
    jQuery('body > .pane').remove();

    waitFor(function() {
      return jQuery('#panel-settings-editor:visible').length > 0;
    }, function() {
      jQuery('.close-settings, div.ui-navbar a:not([href=#edit-widgets-wrapper])').freezeEvents();
      jQuery('<div class="settings-hint">')
        .html('Перейдите в раздел "Виджеты"')
        .css({
          right: '20%',
          top: '15%'
        })
        .appendTo('#panel-settings-editor');
      jQuery('a[href=#edit-widgets-wrapper]').click(function() {
        jQuery('.settings-hint').remove();
        jQuery('<div class="settings-hint">')
          .html('Кликните на кнопку "Добавить" под любым виджетом')
          .css({
            left: '50%',
            transform: 'translateX(-50%)',
            top: '80px'
          })
          .appendTo('#panel-settings-editor');
      });
    });
    waitFor(function() {
      return jQuery('#settings-form-popup-popup:not(.ui-popup-hidden):visible').length > 0 && jQuery('a:contains(Отменить), .ui-popup-screen').length > 0;
    }, function() {

      jQuery('.settings-hint').remove();

      jQuery('#select-pane-float').attr('disabled', 'disabled').parent()
      .addClass('ui-disabled').end().checkboxradio('refresh');
      jQuery('.ui-radio-on, .ui-btn-active').removeClass('ui-radio-on ui-btn-active');
      jQuery('input[name=displace]:not([disabled=disabled])')
      .attr('checked', 'checked').checkboxradio('refresh');
      jQuery('a:contains(Отменить), .ui-popup-screen').freezeEvents();

      current_timeouts.push(setTimeout(function() {
        var h = jQuery('<div class="settings-hint">')
          .html('Обратите внимание, что не все окна активны. Поместить виджет можно только туда, где для него есть свободное место.')
          .hide()
          .css({
            position: 'fixed',
            left: jQuery('#settings-form-popup').offset().left,
            width: jQuery('#settings-form-popup').width(),
            'max-width': jQuery('#settings-form-popup').width(),
            top: jQuery('#settings-form-popup').height() + jQuery('#settings-form-popup').offset().top - 10,
          })
          .appendTo(document.body).fadeIn();
        jQuery('input[name=displace]').click(function() {
          h.fadeOut();
        });
      }, 1000));
      jQuery('.widget-save').click(function() {
        current_timeouts.push(setTimeout(function() {
          if(!jQuery('.panel-flash.error:visible, .panel-flash.warning:visible').length) {
            jQuery('.settings-hint').remove();
            jQuery('.close-settings').unFreezeEvents().click();
            jQuery('.pane').remove();
            jQuery('#step7 .first-message').hide();
            jQuery('#step7 .ui-disabled + .description').remove();
            jQuery('#step7 .ui-disabled').removeClass('ui-disabled');
            jQuery('#step7 .description:hidden').show();
          }
        }, 500));
        return true;
      });
    });
  }).on('pagehide', '#step7', function() {
    jQuery('.close-settings, div.ui-navbar a').unFreezeEvents();
    jQuery('.button').unFreezeEvents().find('a').unFreezeEvents();
    jQuery('.pane').remove();
    jQuery('.settings-hint').remove();
    clearTimeouts();
  }).on('pageshow', '#step8', function() {
    var current_options = __panel.getOptions();
    current_options.widgets = [];
    __panel.setOptions(current_options);
    jQuery('body > .pane, body > .float-widget').remove();

    waitFor(function() {
      return jQuery('#panel-settings-editor:visible').length > 0;
    }, function() {
      jQuery('.close-settings, div.ui-navbar a:not([href=#edit-widgets-wrapper])').freezeEvents();
      jQuery('<div class="settings-hint">')
        .html('Перейдите в раздел "Виджеты"')
        .css({
          right: '20%',
          top: '15%'
        })
        .appendTo('#panel-settings-editor');
      jQuery('a:[href=#edit-widgets-wrapper]').click(function() {
        jQuery('.settings-hint').remove();
        jQuery('<div class="settings-hint">')
          .html('Кликните на кнопку "Добавить" под любым виджетом')
          .css({
            left: '50%',
            transform: 'translateX(-50%)',
            top: '80px'
          })
          .appendTo('#panel-settings-editor');
      });
    });
    waitFor(function() {
      return jQuery('#settings-form-popup-popup:not(.ui-popup-hidden):visible').length > 0;
    }, function() {

      jQuery('.settings-hint').remove();
      jQuery('a:contains(Отменить), .ui-popup-screen').freezeEvents();

      jQuery('#select-pane-0, #select-pane-1, #select-pane-2, #select-pane-3, #select-pane-4, #select-pane-5, #select-pane-6').attr('disabled', 'disabled').parent()
      .addClass('ui-disabled').end().checkboxradio('refresh');
      jQuery('.ui-radio-on, .ui-btn-active').removeClass('ui-radio-on ui-btn-active');
      jQuery('input[name=displace]:not([disabled=disabled])')
      .attr('checked', 'checked').checkboxradio('refresh');

      jQuery('.widget-save').click(function() {
        setTimeout(function() {
          if(!jQuery('.panel-flash.error:visible, .panel-flash.warning:visible').length) {
            jQuery('.settings-hint').remove();
            jQuery('.close-settings').unFreezeEvents().click();
            jQuery('#step8 .ui-disabled + .description:visible').remove();
            jQuery('#step8 .ui-disabled + .description:hidden').show();
            jQuery('#step8 .first-message').hide();
            jQuery('#step8 .second-message').show();
            jQuery('body > .float-widget').css({top: 300});

            waitFor(function() {
              return jQuery('#settings-form-popup-popup:not(.ui-popup-hidden):visible').length > 0 
                     && jQuery('#settings-form-popup').length > 0
                     && jQuery('a:contains("Настройки видимости")').length > 0;
            }, function() {
              jQuery('#step8 .ui-disabled').removeClass('ui-disabled');
              setTimeout(function() {
                var h = jQuery('<div class="settings-hint">')
                  .html('Раскройте "Настройки видимости"')
                  .hide()
                  .css({
                    position: 'fixed',
                    left: jQuery('#settings-form-popup').offset().left + 5,
                    width: jQuery('#settings-form-popup').width(),
                    'max-width': jQuery('#settings-form-popup').width(),
                    top: jQuery('#settings-form-popup').height() + jQuery('#settings-form-popup').offset().top - 50,
                  })
                  .appendTo(document.body).fadeIn();
                jQuery('a:contains("Настройки видимости")').click(function() {
                  h.fadeOut();
                });
              }, 1000);

              jQuery('.widget-save').click(function() {
                jQuery('.settings-hint').remove();
                jQuery('#step8 .ui-disabled + .description').remove();
              });
            });
          }
        }, 500);
        return true;
      });
    });
  }).on('pagehide', '#step8', function() {
    jQuery('.close-settings, div.ui-navbar a').unFreezeEvents();
    jQuery('.button').unFreezeEvents().find('a').unFreezeEvents();
    jQuery('.pane').remove();
    jQuery('.settings-hint').remove();
  }).on('pageshow', '#step9', function() {
    waitFor(function() {
      return jQuery('#panel-settings-editor:visible').length > 0;
    }, function() {
      jQuery('.close-settings, div.ui-navbar a:not([href=#edit-modules-wrapper])').freezeEvents();

      jQuery('<div class="settings-hint">')
        .html('Перейдите в раздел "Модули"')
        .css({
          left: '20%',
          bottom: '15%'
        })
        .appendTo('#panel-settings-editor');

      jQuery('a[href=#edit-modules-wrapper]').click(function() {
        jQuery('.settings-hint').remove();

        setTimeout(function() {
          var h = jQuery('<div class="settings-hint">')
            .html('Вы можете отсеять модули если введёте текст')
            .css({
              right: '10%',
              top: jQuery('input[data-type=search]').offset().top - 10,
              'whit-space': 'nowrap',
              'max-width': 500,
              'width': 'auto'
            })
            .appendTo('#panel-settings-editor');
          jQuery('input[data-type=search]').focus(function() {
            h.fadeOut();
          });
        }, 1000);

        var open_hint;
        setTimeout(function() {
          open_hint = jQuery('<div class="settings-hint">')
            .html('Раскройте любой раздел')
            .css({
              right: '10%',
              top: '50%',
              'max-width': 100,
              'width': 'auto'
            })
            .appendTo('#panel-settings-editor');
          jQuery('input[data-type=search]').focus(function() {
            open_hint.fadeOut();
          });
        }, 2000);

        jQuery('#edit-modules-wrapper .ui-collapsible-heading-toggle').click(function() {
          open_hint.fadeOut();
          jQuery('#step9 .ui-disabled + .description').remove();
          jQuery('#step9 .ui-disabled').removeClass('ui-disabled');

          open_hint = jQuery('<div class="settings-hint">')
            .html('Отожмите галочку чтобы отключить модуль и поставьте чтобы включить')
            .css({
              left: '50%',
              top: jQuery(this).offset().top + 20
            })
            .appendTo('#panel-settings-editor');
        });
        jQuery('#edit-modules-wrapper input[type=checkbox]').change(function() {
          jQuery('<a id="next-step" href="#step10" class="ui-btn ui-btn-inline ui-btn-icon-left ui-icon-carat-r">Следующий шаг</a>')
            .css({
              position: 'absolute',
              bottom: '0px',
              left: '45%'
            }).appendTo('#panel-settings-editor').click(function() {
              jQuery('.close-settings').unFreezeEvents().click();
            });
          jQuery('#step9 .ui-disabled').removeClass('ui-disabled');
        });
      });
    });
  }).on('pagehide', '#step9', function() {
    jQuery('.settings-hint').remove();
  }).on('pageshow', '#step10', function() {
    waitFor(function() {
      return jQuery('#panel-settings-editor:visible').length > 0;
    }, function() {
      jQuery('.close-settings, div.ui-navbar a:not([href=#edit-other-wrapper])').freezeEvents();

      jQuery('<div class="settings-hint">')
        .html('Перейдите в раздел "Другое"')
        .css({
          right: '20%',
          bottom: '15%'
        })
        .appendTo('#panel-settings-editor');
      jQuery('a[href=#edit-other-wrapper]').click(function() {
        jQuery('.settings-hint').remove();

        var h1, h2;
        setTimeout(function() {
          h1 = jQuery('<div class="settings-hint">')
            .html('Здесь вы можете создать свой вариант настроек и переключаться между ними')
            .css({
              right: '20px',
              top: jQuery('.options-variants').offset().top - 20,
              'max-width': 300,
              'width': 'auto'
            })
            .appendTo('#panel-settings-editor');
          jQuery('input[data-type=search]').focus(function() {
            h.fadeOut();
          });
        }, 1000);

        setTimeout(function() {
          h2 = jQuery('<div class="settings-hint">')
            .html('Раскройте спойлер, чтобы добавить новый вариант')
            .css({
              right: '20px',
              top: jQuery('.options-variants').offset().top + 90,
              'max-width': 300,
              'width': 'auto'
            })
            .appendTo('#panel-settings-editor');
        }, 2000);

        jQuery('#edit-other-wrapper .ui-collapsible-heading-toggle').click(function() {
          h1.fadeOut();
          h2.fadeOut();
          jQuery('<a id="next-step" href="#step11" class="ui-btn ui-btn-inline ui-btn-icon-left ui-icon-carat-r">Следующий шаг</a>')
            .css({
              position: 'absolute',
              bottom: '0px',
              left: '45%'
            }).appendTo('#panel-settings-editor').click(function() {
              jQuery('.close-settings').unFreezeEvents().click();
            });        
        });
      });
    });
  });
}