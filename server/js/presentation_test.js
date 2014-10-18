QUnit.module('gwpanel_presentation');

QUnit.asyncTest('Запуск и проход презентации', function(assert) {
  assert.equal(jQuery.type(presentation_start), 'function', 
    'функция presentation_start существует');
  assert.equal(jQuery.type(waitFor), 'function', 
    'функция waitFor существует');
  var frame = jQuery('<iframe src="http://new.gwpanel.org/">').appendTo('#qunit-fixture')
  .css({height: 500, width: 1000})
  .get(0);
  jQuery('#qunit-fixture').css({position: 'static'}).show();

  waitFor(function() {
    return frame.contentWindow && frame.contentWindow.jQuery &&
      frame.contentWindow.jQuery('a[href=#step1]:visible').length > 0;
  }, function() {
    var __window = frame.contentWindow;
    var $ = frame.contentWindow.jQuery;
    assert.ok($('a[href=#step1]').length > 0, 'Есть кнопка запуска презентации');

    setTimeout(function() {
      $('a[href=#step1]').click();
    }, 500);

    waitFor(function() {
      return $('#step1:visible').length > 0 && __window.__panel && 
        $('a[href=#step2]').length > 0;
    }, function() {
      assert.ok(true, 'Первый шаг открылся');
      assert.equal($.type(__window.__panel), 'object', 'Панель видна');

      step2(assert, $, __window);
      //QUnit.start();
    });
  });
});

function step2(assert, $, __window) {
  $(__window.document).on('pageshow', '#step2', function() {
    assert.ok(true, 'Шаг №2 открылся');
    step3(assert, $, __window);
  });
  setTimeout(function() {
    $('a:contains(Далее):not(.ui-disabled):visible').trigger('click');
  }, 500);
}

function step3(assert, $, __window) {
  $(__window.document).on('pageshow', '#step3', function() {
    assert.ok(true, 'Шаг №3 открылся');
    $('.pane-bubble:visible').click();
    waitFor(function() {
      return $('a:contains(Далее):not(.ui-disabled):visible').length > 0;
    }, function() {
      step4(assert, $, __window);
    });
  });
  $('a:contains(Далее):not(.ui-disabled):visible').trigger('click');
}

function step4(assert, $, __window) {
  $(__window.document).on('pageshow', '#step4', function() {
    assert.ok(true, 'Шаг №4 открылся');
    step5(assert, $, __window);
  });
  $('a:contains(Далее):not(.ui-disabled):visible').trigger('click');
}

function step5(assert, $, __window) {
  $(__window.document).on('pageshow', '#step5', function() {
    assert.ok(true, 'Шаг №5 открылся');
    $('.button.panel_settings:visible').click();
    waitFor(function() {
      return $('a:contains(Далее):not(.ui-disabled):visible').length > 0;
    }, function() {
      assert.equal($('.settings-hint:visible').length, 4, 'Видны 4 подсказки');
      step6(assert, $, __window);
    });
    //step6(assert, $, __window);
    //QUnit.start();
  });
  $('a:contains(Далее):not(.ui-disabled):visible').trigger('click');
}

function step6(assert, $, __window) {
  $(__window.document).on('pageshow', '#step6', function() {
    assert.ok(true, 'Шаг №6 открылся');
    assert.equal($('.settings-hint:visible').length, 1, 'Видна 1 подсказка');

    $('a[href=#edit-buttons-wrapper]').click();

    setTimeout(function() {
      assert.equal($('.settings-hint:contains(Кликните на кнопку типа)').length, 1, 
        'следующая подсказка видна');
      $('#button_panel_link a').click();
      waitFor(function() {
        return $('#param-title').length > 0;
      }, function() {
        $('#param-title').focus().val('ссылка');
        $('#param-panel_link-link').focus().val('http://test.com');
        $('#select-pane-0').click();
        setTimeout(function() {
          $('.widget-save:visible').click();
          waitFor(function() {
            return $('a[href=#step7]:not(.ui-disabled):visible').length > 0
              && $('#panel-settings-editor:visible').length == 0;
          }, function() {
            assert.equal($('.panel-flash:visible').length, 1, 'Сообщение видно');
            step7(assert, $, __window);
          });
        }, 500);
      });
    }, 200);
  });
  $('a:contains(Далее):not(.ui-disabled):visible').trigger('click');
}

function step7(assert, $, __window) {
  $(__window.document).on('pageshow', '#step7', function() {
    assert.ok(true, 'Шаг №7 открылся');
    $('#pane-bubble-0').click();
    
    waitFor(function() {
      return $('.button.panel_settings:visible').length > 0;
    }, function() {
      $('.button.panel_settings a').click();
      waitFor(function() {
        return $('#panel-settings-editor:visible').length > 0 && 
          $('.settings-hint:visible').length > 0;
      }, function() {
        assert.equal($('.settings-hint:visible').length, 1, 'Видна 1 подсказка');
        $('a[href=#edit-widgets-wrapper]').click();
        setTimeout(function() {
          assert.equal($('.settings-hint:contains(под любым виджетом)').length, 1, 
            'следующая подсказка видна');
          $('#add-widget-npc_npc_g').click();
          waitFor(function() {
            return $('.widget-save').length > 0;
          }, function() {
            $('#select-pane-5').click();
            setTimeout(function() {
              $('.widget-save:visible').click();
              waitFor(function() {
                return $('a[href=#step8]:not(.ui-disabled):visible').length > 0
                  && $('#panel-settings-editor:visible').length == 0;
              }, function() {
                assert.equal($('.panel-flash:visible:contains(Виджет)').length, 1, 'Сообщение видно');
                step8(assert, $, __window);
              });
            }, 500);
          });
        }, 200);
      });
    });
  });
  $('a[href=#step7]:not(.ui-disabled):visible').trigger('click');
}

function step8(assert, $, __window) {
  $(__window.document).on('pageshow', '#step8', function() {
    assert.ok(true, 'Шаг №8 открылся');
    $('#pane-bubble-0').click();
    waitFor(function() {
      return $('.button.panel_settings:visible').length > 0;
    }, function() {
      $('.button.panel_settings a').click();
      waitFor(function() {
        return $('#panel-settings-editor:visible').length > 0 && 
          $('.settings-hint:visible').length > 0;
      }, function() {
        assert.equal($('.settings-hint:visible').length, 1, 'Видна 1 подсказка');
        $('a[href=#edit-widgets-wrapper]').click();
        setTimeout(function() {
          assert.equal($('.settings-hint:contains(под любым виджетом)').length, 1, 
            'следующая подсказка видна');
          $('#add-widget-npc_npc_g').click();
          waitFor(function() {
            return $('.widget-save').length > 0;
          }, function() {
            setTimeout(function() {
              $('.widget-save:visible').click();
              setTimeout(function() {
                $('.float-widget:visible').dblclick();
                waitFor(function() {
                  return $('#settings-form-popup:visible').length > 0 && 
                    $('.widget-save:visible').length > 0 &&
                    $('a:contains("Настройки видимости")').length > 0;
                }, function() {
                  $('a:contains("Настройки видимости")').click();
                  setTimeout(function() {
                    $('.widget-save:visible').click();
                    waitFor(function() {
                      return $('a[href=#step9]:not(.ui-disabled):visible').length > 0
                        && $('#panel-settings-editor:visible').length == 0;
                    }, function() {
                      assert.equal($('.panel-flash:visible:contains(Виджет сохранён)').length, 1, 'Сообщение "виджет сохранён" видно');
                      step9(assert, $, __window);
                    });
                  }, 2000);
                });
              }, 1500);
            }, 500);
          });
        }, 200);
      });
    });
  });
  $('a[href=#step8]:not(.ui-disabled):visible').trigger('click');
}

function step9(assert, $, __window) {
  $(__window.document).on('pageshow', '#step9', function() {
    assert.ok(true, 'Шаг №9 открылся');
    $('#pane-bubble-0').click();
    waitFor(function() {
      return $('.button.panel_settings:visible').length > 0;
    }, function() {
      $('.button.panel_settings a').click();
      waitFor(function() {
        return $('#panel-settings-editor:visible').length > 0 && 
          $('.settings-hint:visible').length > 0;
      }, function() {
        assert.equal($('.settings-hint:visible').length, 1, 'Видна 1 подсказка');
        $('a[href=#edit-modules-wrapper]').click();
        waitFor(function() {
          return $('.settings-hint:contains(Раскройте любой раздел)').length > 0;
        }, function() {
          assert.equal($('.settings-hint:contains(Раскройте любой раздел)').length, 1, 
            'следующая подсказка видна');
          $('a.ui-collapsible-heading-toggle').click();
          $('.ui-checkbox:visible label').click();
          waitFor(function() {
            return $('a[href=#step10]:not(.ui-disabled):visible').length > 0;
          }, function() {
            step10(assert, $, __window);
          });

        });
      });
    });
  });

  $('a[href=#step9]:not(.ui-disabled):visible').trigger('click');
}

function step10(assert, $, __window) {
  $(__window.document).on('pageshow', '#step10', function() {
    assert.ok(true, 'Шаг №10 открылся');
    $('a[href=#step11]:not(.ui-disabled):visible').trigger('click');
    waitFor(function() {
      return $('a:contains(На главную):not(.ui-disabled):visible').length > 0;
    }, function() {
      assert.ok(true, 'Тест завершён');
      QUnit.start();
    });
  });
  $('a[href=#step10]:not(.ui-disabled):visible').trigger('click');
}