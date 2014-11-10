(function(panel, $) {

  var xhr;

  var prevScrollTop;

  var loaderTO;

  function ajaxGoto(href, callback, refresh) {
    if(loaderTO > 0) clearTimeout(loaderTO);
    /// показываем крутилку если запрос длится больше 300 миллисекунд
    loaderTO = panel.setTimeout(function() {
      $(document.body).addClass('ajax-loading');
    }, 300);

    panel.tearDown();
    var i;
    var count = 0;
    var goto_href = href + (href.indexOf('?') > -1? '&ajax': '?ajax');

    prevScrollTop = $(window).scrollTop();
    $.ajax(goto_href, {
      success: function(data) {
        var final_url = xhr.responseURL || href;
        final_url = final_url.replace('&ajax', '').replace('?ajax', '');
        panel.ajaxUpdateContent(data, final_url, false, refresh);
        if(callback) callback();
      },
      error: function() {
        window.location = href;
      }
    });
  }

  var originalData, originalTitle;

  function ajaxifyLinks($links) {
    function ajaxClickFunc(e) {
      if(e.isDefaultPrevented() && e.isPropagationStopped()) {
        return false;
      }
      if(e.ctrlKey || e.altKey || e.button != 0) return true;
      var href = $(this).attr('href');
      if(href.indexOf('/battle.php') > -1 || 
         href.indexOf('logout.php') > -1) return true;
      if(document.location.toString().indexOf(href) > -1) return true;
      ajaxGoto(href);
      return false;
    }

    $links.addClass('ajax')
      .click(ajaxClickFunc)
      .mousedown(function() {
        /// утаскиваем местный обработчик click в конец массива событий
        $._data(this, 'events').click.sort(function(a, b) {
            if(a.handler == ajaxClickFunc) return 1;
        });
      });
  }

  function ajaxifyContent() {
    var selector = 'a[href*="http://' + document.domain + '"]:visible:not(.ajax):not([onclick]):not([target]), a[href*="/"]:visible:not(.ajax):not([onclick]):not([target])';
    ajaxifyLinks($(selector));
    $('*[onclick*="location="]').each(function() {
      var onclick = $(this).attr('onclick');
      var match = onclick.match(/(document|window)\.location=["\']+([^"']+)["\']+/);
      if(match) {
        $(this).attr('onclick', onclick.replace(match[0], '__panel.gotoHref("' + match[2] + '")'));
      }
    });
    $('.broken-form:not(.processed)').each(function() {
      var form_id = $(this).attr('form-id');
      var $form = $(this);

      $('input.form-' + form_id + '[type=submit], ' + 
        'input.form-' + form_id + '[type=image]').click(function() {
        if($(this).attr('onclick')) return true;

        var s_data = $('input.form-' + form_id + ', textarea.form-' + form_id + ', select.form-' + form_id).serializeArray();
        var params = [];
        $.each(s_data, function() {
            params.push(this.name + '=' + __panel.encodeURIComponent(this.value || options.data[this.name]));
        });

        function regularSend() {
          /// функция-обход для отправки через браузер если произошла ошибка
          var $new_form = $('<form>', {
            method: 'POST',
            action: $form.attr('action') || location.href
          }).appendTo(document.body);
          $.each(s_data, function(i, item) {
            $('<input>', {
              type: 'hidden',
              name: item.name,
              value: item.value
            }).appendTo($new_form);
          });
          $new_form.submit();
        }

        var href = $form.attr('action') || location.href;
        var options = {
          type: String($form.attr('method') || 'post').toLowerCase(),
          success: function(data) {
            if(href == 'object-hdo.php') {
              href = location.href;
            }
            panel.ajaxUpdateContent(data, xhr.responseURL || href);
          },
          error: function() {
            regularSend();
          }
        };

        options.data = params.join('&');

        /// форма отплытия
        if(location.hostname == 'quest.ganjawars.ru' && options.data.indexOf('sectorout') > -1) {
          regularSend();
          return false;
        }

        $.ajax(href, options);

        return false;
      });

    }).addClass('processed');

  }

  var invokedOnReady = false;

  $.extend(panel, {
    /**
    * Обработчик для аяксифицирования ссылок
    */
    panel_ajaxify: function() {
      if($('#gw-content').length > 0) return;
      if(!history.pushState) return;
      if(document.domain.indexOf('gwpanel.org') > -1) return;
      var $elem;
      if($('table.topill').length > 0) {
        ///новое оформление
        $elem = $('table.topill').next();
        try {
          $('.gw-footer').remove();
        } catch(e) {
          /// почему то в хроме выдаёт ошибку в этом месте из-за конфликта с Prototype
        }
      } else {
        ///старое оформление
        var $elem = $('body > table[bgcolor="#f5fff5"]');
        if(!$elem.length) {
          $elem = $('body > table[bgcolor="#d0eed0"]').next('center');
        }
      }
      // У нас есть структура форм в document.forms, которую браузер почему-то
      // создаёт нормально, и есть .innerHTML в корявом виде.
      // Задача: привести формы из корявого innerHTML в нужный вид, используя
      // document.forms в качестве структуры
      var forms_copy = [];
      $(document.forms).each(function(i) {
        /// Если количество элементов на форме сопадает с целевым, то форма рабочая, менять ничего не нужно
        if(this.elements.length == $('form').eq(i).find('input, select, textarea').length) return;
        forms_copy[i] = [];
        $(this).addClass('form-' + i + ' broken-form').attr('form-id', i);
        $(this.elements).addClass('form-' + i);
      });
      if($elem.length > 0) {
        var $all_elements = $elem.nextAll().find('script').remove().end().wrapAll('<div id="gw-content"></div>');
      } else if(!invokedOnReady) {
        /// страница не готова, пытаемся аяксифицировать на document ready
        invokedOnReady = true;
        $(panel.panel_ajaxify);
        return;
      } else {
        /// страница не поддаётся аяксификации
        return;
      }
      var $content = $('#gw-content');

      /// вырезаем все оставшиеся текстовые ноды и добавляем к содержимому
      var __break = false;
      var textNodes = $content.parent().contents().filter(function() {
        if(this.id == 'gw-content') __break = true;
        return this.nodeType === 3 && !__break && this.data.length > 1;
      });
      textNodes.remove().prependTo($content);
      $content.after('<!--/#gw-content-->');
      if($all_elements.length > 0 && $content.length > 0) {
        originalTitle = document.title;

        history.replaceState({
          data: $('#gw-content').html(), 
          title: document.title
        }, document.title, location.href);

        $(ajaxifyContent);
        //console.log('setting window.onpopstate');

        $(window).bind('popstate', function(event) {
          //console.log(event.originalEvent.state);
          if(event.originalEvent.state && event.originalEvent.state.data && 
             event.originalEvent.state.title) {
            /*var $div = $('<div>').hide().html(event.state.data).appendTo(document.body);
            if($div.find('#gw-content').length > 0) {
              var content = $div.find('#gw-content').html();
            }*/
            //console.log('pop data: ', event.originalEvent.state.data.substr(0, 15), ', length: ', event.originalEvent.state.data.length, event.originalEvent.state);
            try {
              panel.ajaxUpdateContent(event.originalEvent.state.data, null, true);
            } catch(e) {}

            prevScrollTop = event.originalEvent.state.scrollTop;

            /*document.title = event.state.title;
            __initFunc();
            ajaxifyContent();
            tearDownFloatWidgets();
            initFloatWidgets();*/
          }
        });
      }
      panel.gotoHref = function(href, callback, refresh) {
        if(href.indexOf('http://') == 0 && href.indexOf('http://' + document.domain + '/') == -1) {
          window.location = href;
          return;
        }
        return ajaxGoto(href, callback, refresh);
      }

      if(!panel.getCookies().gwp2_n && document.domain.indexOf('gwpanel.org') == -1) {
        panel.loadScript('panel/panel_detect.js', function() {
          if($.browser.firefox){
            panel.panel_detect_greasemonkey(panel.panel_extension_notify);
          }
          if($.browser.chrome) {
            panel.panel_detect_tampermonkey(panel.panel_extension_notify);
          }
        });
      }
    },

    ajaxUpdateContent: function(data, href, noHistory, refresh) {
      if(href && href.indexOf('bid=') !== -1 && href.indexOf('/b0/') > -1) {
        location.href = href;
      }
      if(window.hptimer_header > 0) {
        clearTimeout(window.hptimer_header);
        window.hptimer_header = 0;
      }
      if(window.hptimer > 0) {
        clearTimeout(window.hptimer);
        window.hptimer = 0;
      }
      var pathname, search;
      try {
        if(href) {
          var ar = href.split(document.domain)[1].split('?');
          pathname = ar[0];
          search = '?' + ar[1];
        }
      } catch(e) {}

      var smoothScrollTop, smoothScrollBottom;

      if(pathname == location.pathname) {
        if(search.indexOf('page_id') > -1) {
          // проверяем page_id у предыдущего урла и у следующего, плавно
          // пролистываем только если переход на следующую страницу
          var prev_page, next_page;
          if(location.search.search(/page_id=([0-9]+)/)) {
            prev_page = parseInt(RegExp.$1);
          }
          if(search.search(/page_id=([0-9]+)/)) {
            next_page = parseInt(RegExp.$1);
          }

          if((prev_page < next_page || (!prev_page && next_page > 0)) &&
              $(window).scrollTop() > $(window).height() / 2) {
            /// делаем плавный скролл
            smoothScrollTop = true;
          } else if((prev_page > next_page && next_page > 0) && 
             $(window).scrollTop() < $(window).height() / 2) {
            smoothScrollBottom = true;
          }
        }
      } else if(!noHistory) {
        $(window).scrollTop(0);
      }
      panel.ajaxTearDown();
      
      $(document.body).addClass('ajax-processed');
      if(href && href.indexOf('/sms.php') > -1) $('img[src$="sms.gif"]').closest('a').remove();
      var jqs = false;
      var __title;
      if(data.indexOf('JQS loaded.') == 0) {
        data = data.substr(11);
        jqs = true;
        var first_hr = data.indexOf('<hr>');
        if(first_hr < 300) {
          data = data.substr(0, first_hr) + data.substr(first_hr + 4);
        }
      } else {
        var start = data.indexOf('<body');
        if(start > -1) {
          var body_end = data.indexOf('>', start);
          var body_close = data.indexOf('</body>', start);
          var title_open = data.indexOf('<title>');
          var title_close = data.indexOf('</title>', title_open);
          __title = data.substr(title_open + 7, title_close - title_open - 7);
          data = data.substr(body_end + 1, body_close - body_end - 1);
        } else {
          jqs = true;
        }
      }
      //data = data.replace(/<script.*src=".*\/prototype.js">.*?<\/script>/g, '');
      //data = panel.fixForms(data);
      var $content = $('#gw-content').html(data);
      if(jqs) {
        document.title = ($content.find('#doc-title').text() || 'Онлайн игра')
                          + ' GanjaWars.Ru :: Ганджубасовые войны';
      } else {
        document.title = __title;
      }
      //if(title) document.title = title + ' :: Ganjawars.ru :: Ганджубасовые войны';
      $(document.body).removeClass(window.location.pathname.replace(/\./g, '-').replace(/\//g, '_').substr(1));
      if(noHistory && !refresh) {
        //console.log('noHistory, using prevScrollTop', prevScrollTop);
        $(window).scrollTop(prevScrollTop);
      } else {
        if(smoothScrollTop) {
          $('html,body').animate({
            scrollTop: $('a[href$="' + pathname + search + '"]:first').offset().top - 40
          }, 1000);
        } else if(smoothScrollBottom) {
          $('html,body').animate({
            scrollTop: $('a[href$="' + pathname + search + '"]:last').offset().top - $(window).height() + 100
          }, 1000);
        }
        //console.log('pushing data: ', data.substr(0, 20), ', length: ', data.length);
        history.pushState({
          data: data, 
          title: document.title,
          scrollTop: prevScrollTop
        }, document.title, href);
      }
      $(document.body).addClass(window.location.pathname.replace(/\./g, '-').replace(/\//g, '_').substr(1));
      clearTimeout(loaderTO);
      loaderTO = 0;
      $(document.body).removeClass('ajax-loading');

      ajaxifyContent();
      panel.ajaxRefresh(refresh);
    },

    /**
    * Функция возвращает responseURL последнего AJAX-запроса.
    * её реализовали совсем недавно, см. http://stackoverflow.com/questions/8056277/how-to-get-response-url-in-xmlhttprequest
    */
    responseURL: function() {
      if(xhr) {
        return xhr.responseURL;
      } else {
        return location.href;
      }
    }

  });

  var _orgAjax = jQuery.ajaxSettings.xhr;
  jQuery.ajaxSettings.xhr = function () {
    xhr = _orgAjax();
    var origonreadystatechange = xhr.onreadystatechange;
    xhr.onreadystatechange = function() {
      if(origonreadystatechange) origonreadystatechange();
    }
    return xhr;
  };

  /**
  * Функция для ajax-отправки формы
  * @param options - массив опций, передаётся в функцию jQuery.ajax
  */
  $.fn.sendForm = function(options) {
    this.each(function() {
      var $form = $(this);
      options = $.extend({
        type: String($form.attr('method') || 'post').toLowerCase()
      }, options || {});

      if(options.data && $.type(options.data) == 'array' && options.data[0].name) {
        var s_data = options.data;
      } else {
        var s_data = $form.serializeArray();
      }

      //__panel.setTimeout(function() {
      $(document.body).addClass('ajax-loading');
      //}, 300);
  
      var action = $form.attr('action') || location.href;
      if(action.indexOf('http:') == -1 && action.charAt(0) != '/') {
        action = '/' + action;
      }
      /// функция-обход для отправки через браузер
      function regularSend() {
        var $new_form = $('<form>', {
          method: 'POST',
          action: action
        }).appendTo(document.body);
        $.each(s_data, function(i, item) {
          $('<input>', {
            type: 'hidden',
            name: item.name,
            value: item.value
          }).appendTo($new_form);
        });
        $new_form.submit();
      }
      /// Обходим функцию jQuery.param, чтобы данные не кодировались повторно
      var params = [];
      jQuery.each(s_data, function() {
        params.push(this.name + '=' + __panel.encodeURIComponent(this.value || options.data[this.name] || ''));
      });
      /// отдаём в data строку
      options.data = params.join('&');

      /// на ауте не работает форма отплытия если она отправляется сперва аяксом 
      /// а потом обычным способом, надо сразу отправлять обычным
      if(location.hostname == 'quest.ganjawars.ru' && options.data.indexOf('sectorout') > -1) {
        regularSend();
        return false;
      }

      if(!$form.attr('method') || ($form.attr('method') && $form.attr('method').toLowerCase() == 'get')) {
        var href = action;
        if(href.indexOf('javascript:') == 0) {
          return;
        }
        if(href.indexOf('http:') == -1) {
          href = location.protocol + '//' + location.hostname + href;
        }
        __panel.gotoHref(href + '?' + options.data)
        return;
      }

      options.error = function(t) {
        /// В случае ошибки, скорее всего это редирект, 
        /// отправляем форму средствами браузера
        regularSend();
      }

      options.complete = function() {
        $(document.body).removeClass('ajax-loading');
      }

      $.ajax(action, options);
    });
    return this;
  }

/**
* Функция-враппер над стандартным методом .html
* её смысл заключается в том, чтобы предварительно определить какие элементы
* должны быть на форме, пометить их и затем при отправке формы связать их
* с самой формой не смотря на то, помещены они вовнутрь формы или нет.
* функция должна исправлять абсолютно все формы в игре.
*/
var origHtml = jQuery.fn.html;
/// глобальный счётчик форм, каждая форма уникальная.
var form_index = 0;

function parseParams(params) {
  var param_ex = /(\b\w+\b)\s*(=\s*("[^"]+"|'[^']+'|[^"'<>\s]+))?\s*/g
  //console.log('params to parse: ', params);

  var params_ar = [];

  while(m_p = param_ex.exec(params)) {
    //console.log(m_p);
    var name = m_p[1];
    var value = m_p[3];
    if(!value) {
      if(name == 'checked') {
        params_ar.push({name: name, value: name});
      } else {
        params_ar.push({name: name});
      }
      continue;
    }

    if(value.charAt(0) == '\'' && value.charAt(value.length - 1) == '\'') {
      value = value.substr(1, value.length - 2);
    }
    if(value.charAt(0) == '"' && value.charAt(value.length - 1) == '"') {
      value = value.substr(1, value.length - 2);
    }

    params_ar.push({name: name, value: value});
  }

  return params_ar;
}

function convertParams(params_ar, className) {
  var has_class = false;

  $.each(params_ar, function(i, item) {
    if(item.name == 'class') {
      has_class = true;
      item.value += ' ' + className;
    }
  });

  if(!has_class) {
    params_ar.push({name: 'class', value: className});
  }

  //console.log('params: ', params, 'new params: ', params_ar);
  return $.map(params_ar, function(item) {
    if(item.value) {
      return item.name + '="' + item.value.replace('"', '&quot;') + '"';
    } else {
      return item.name;
    }
  }).join(' ');
}

$.fn.html = function(html) {
  var forms_fixed = false;
  if(html && $.type(html) == 'string') {
    html = html.replace(/'([>]+)'/g, function(str, p1) {
      return str.replace(/>/g, '&gt;');
    });
    //console.log('preparing html');
    /// вытаскиваем все формы
    var form_ex = /<form ([^>]+)>([.\s\S]*?)<\/form>/ig
    var input_ex = /<input[ ]?([^>]+)[\/]?>/ig
    var other_ex = /<(button|textarea|select)([^>]*)>([.\s\S]*?)<\/(button|textarea|select)>/ig
//console.log(html);
    var form_start = html.indexOf('<form');

    while(m_f = form_ex.exec(html)) {
      if(m_f[1].indexOf('gwp-form') > -1 || html.substr(m_f.index - 20, 20).indexOf('innerHTML') > -1) {
        continue;
      }

      var form_contents = m_f[2];
      //console.log('form_contents', form_contents);
      var formParams = parseParams(m_f[1]);

      var formID = null;
      var formName = null;
      var _formID = formParams.filter(function(item) { return item.name == 'id'})[0];
      var _formName = formParams.filter(function(item) { return item.name == 'name'})[0];

      //console.log('formParams: ', JSON.stringify(formParams));
      //console.log('_formID: ', _formID, '_formName: ', _formName);
      //console.log('formID: ', formID, 'formName: ', formName);
      /// делаем виртуальную форму
      var $form_element = null;

      if(_formID) {
        // Если форма имеет ID, то мы подменяем его на другой и создаём
        // пустой объект в document.forms.ID_Формы. 
        // Это нужно для того чтобы инлайновые скрипты, которые будут выполнены ниже 
        // при установке html() заполняли этот пустой объект, а затем мы переименуем
        // эту форму и подставим все значения которые выставляли инлайновые скрипты.
        formID = _formID.value;
        _formID.value = 'fake-' + formID;
        $form_element = $('<form id="' + formID + '">').appendTo(document.body);
      }
      if(_formName) {
        // то же самое с именованными формами
        formName = _formName.value;
        _formName.value = 'fake-' + formName;
        if($form_element) {
          /// если форма уже создана
          $form_element.attr('name', formName);
        } else {
          $form_element = $('<form name="' + formName + '">').appendTo(document.body);
        }
      }
      //console.log('form: ', formID, formName);

      while(m_i = input_ex.exec(form_contents)) {
        var params = parseParams(m_i[1]);
        var item_html = '<input ' + 
        convertParams(params, 'gwp-form-' + form_index + '-item') + '/>';
        //console.log(m_i[0], item_html);

        var _name = params.filter(function(item) { return item.name == 'name'})[0];
        var _id = params.filter(function(item) { return item.name == 'id'})[0];
        if(_name || _id) {
          var $item = $(item_html).appendTo($form_element);
        }
        form_contents = form_contents.substr(0, m_i.index) + item_html + 
        form_contents.substr(m_i.index + m_i[0].length);
      }

      while(m_o = other_ex.exec(form_contents)) {
        //console.log(m_o);
        var params = parseParams(m_o[2]);

        var item_html = '<' + m_o[1] + ' ' + 
          convertParams(params, 'gwp-form-' + form_index + '-item') + '>' + m_o[3] + 
          '</' + m_o[4] + '>';

        var _name = params.filter(function(item) { return item.name == 'name'})[0];
        var _id = params.filter(function(item) { return item.name == 'id'})[0];
        if(_name || _id) {
          var $item = $(item_html).appendTo($form_element);
        }
        form_contents = form_contents.substr(0, m_o.index) + item_html + 
                        form_contents.substr(m_o.index + m_o[0].length);
      }

      //console.log('new form_params: ', convertParams(formParams, 'gwp-fixed-form gwp-form-' + form_index));
      //console.log('new form_contents: ', form_contents);
      /// изменяем html формы
      html = html.substr(0, m_f.index) + '<form index="' + form_index + '" ' + 
        convertParams(formParams, 'gwp-fixed-form gwp-form-' + form_index) + '>' + form_contents + 
        '</form>' + html.substr(m_f.index + m_f[0].length);

      //console.log('new html: ', html);
      form_index++;
      forms_fixed = true;
    }
/*    var ar = html.match() || [];
    $.each(ar, function(index, form) {
      /// вытаскиваем все инпуты
      var inputs = form.match(/<input[^>]+[\/]?>/g) || [];


      /// вытаскиваем все баттоны, textarea
    });*/
    /*if(__panel.responseURL().indexOf('quest.ganjawars.ru') != -1) {
      html = html.replace('document.forms.chatform.newline.focus()', 'jQuery("#newline").focus();');
    }*/
  }

  var result = origHtml.apply(this, [html]);

  if(forms_fixed) {
    if(!forms_fixed) return;
    result.find('.gwp-fixed-form').submit(function() {
      /// Перед сабмитом собираем все элементы
      var $this = $(this);
      var index = $this.attr('index');
      //console.log($('.gwp-form-' + index + '-item').serializeArray());
      var action = $this.attr('action');
      if(action.indexOf('javascript:') > -1) {
        /// Добавляем в форму все элементы, которые были из неё удалены
        try {
          eval(action);
        } catch(e) {
          if(window.console) console.log(e);
        }
        return false;
      }

      $(this).sendForm({
        data: $('.gwp-form-' + index + '-item:not([type=submit]):not([type=image])').serializeArray(),
        success: function(data) {
          __panel.ajaxUpdateContent(data, __panel.responseURL() || $this.attr('action'));
          if(location.href.indexOf('messages.php') == -1) {
            $(window).scrollTop(0);
          }
        }
      });
      return false;
    }).each(function() {
      var index = $(this).attr('index');

      function submitClickHandler(event) {
        if(event.isDefaultPrevented() && event.isPropagationStopped()) {
          return false;
        }
        if(this.onclick) {
          var result;
          eval('function anon() { ' + this.onclick.replace('javascript:', '') + '}; result = anon();');
          if(result === false) return result;
        }
        var $form = $('.gwp-form-' + index);
        /// мы должны добавить на форму скрытый элемент с именем и значением нажатого сабмита
        if(this.name) {
          $('<input type="hidden" name="' + this.name + '" value="' + this.value +
            '" class="gwp-form-' + index + '-item">').appendTo($form);
        }
        if(!$(this.form).closest('form').hasClass('.gwp-form-' + index)) {
          /// Если сабмит "выпал"" из родной формы, то сабмитим родную форму
          /// а не то где он сейчас находится
          $form.eq(0).submit();
          return false;
        }
      }
      /// находим все сабмиты для этой формы и привязываем по клику отправку формы
      $('.gwp-form-' + index + '-item[type=submit], ' + 
        '.gwp-form-' + index + '-item[type=image]')
        .click(submitClickHandler)
        .mousedown(function() {
          /// утаскиваем местный обработчик click в конец массива событий
          $._data(this, 'events').click.sort(function(a, b) {
            if(a.handler == submitClickHandler) return 1;
          });
        });

      // Если форма именованная, то мы должны убрать из её ID префикс "fake-"
      // и заполнить её всеми инпутами и значениями которые были установлены
      // в "подставной"" объект
      var formID = $(this).attr('id');
      var formName = $(this).attr('name');
      var className = 'gwp-form-' + index + '-item';
      //console.log('processing form, ', 'formID: ', formID, ', formName: ', formName);
      if(formID) {
        formID = formID.split('fake-')[1];
        // получаем "подложный" объект
        var fakeForm = document.forms[formID];
        if(fakeForm) {
          //console.log(fakeForm);
          $(fakeForm).attr('id', 'old-' + formID);
          /// Меняем айди формы на правильный
          $(this).attr('id', formID);
          // заполняем правильную форму значениями из предыдущей
          $.each(fakeForm.elements, function(i, item) {
            var identity = this.name;
            if(!identity && this.id) identity = this.id;
            if(!identity) return;

            var element = document.forms[formID][identity];
            if(!element) {
              /// Элемент не прописался в форму, добавляем его принудительно
              if(this.name) {
                element = $('.gwp-form-' + index + '-item[name="' + this.name + '"]').get(0);
              } else {
                element = $('#' + this.id + '.gwp-form-' + index + '-item').get(0);
              }
              if(this.type == 'radio') {
                document.forms[formID][this.name] = document.forms[formID][this.name] || [];
                document.forms[formID][this.name].push(element);
                document.forms[formID]['elements'][this.name] = document.forms[formID][this.name];
              } else {
                document.forms[formID][identity] = element;
                document.forms[formID]['elements'] = document.forms[formID]['elements'] || [];
                document.forms[formID]['elements'][identity] = element;
                //document.forms[formID]['elements'][document.forms[formID]['elements'].length] = element;
              }
            }

            if($.type(element) != 'object') return;

            if(!$(element).hasClass(className)) {
              $(element).addClass(className)
            }

            $(element).val(this.value);
            if(this.type == 'checkbox' || this.type == 'radio') {
              if(this.checked) {
                $(element).attr('checked', 'checked');
              } else {
                $(element).removeAttr('checked');
              }
            }
          });
          $(fakeForm).remove();
        }
      } else if(formName) {
        /// То же самое с именем
        formName = formName.split('fake-')[1];
        //console.log('real name: ', formName);
        // получаем "подложный" объект
        var fakeForm = document.forms[formName];
        //console.log('fake form: ', fakeForm);
        if(fakeForm) {
          $(fakeForm).attr('name', 'old-' + formName);
          /// Меняем айди формы на правильный
          $(this).attr('name', formName);
          // заполняем правильную форму значениями из предыдущей
          $.each(fakeForm.elements, function(i, item) {
            var identity = this.name;
            if(!identity && this.id) identity = this.id;
            if(!identity) return;

            var element = document.forms[formName][identity];
            if(!document.forms[formName][identity] || !document.forms[formName]['elements'][identity]) {
              /// Элемент не прописался в форму, добавляем его принудительно
              if(this.name) {
                element = $('.gwp-form-' + index + '-item[name="' + this.name + '"]').get(0);
              } else {
                element = $('#' + this.id + '.gwp-form-' + index + '-item').get(0);
              }
              if(this.type == 'radio') {
                document.forms[formName][this.name] = document.forms[formName][this.name] || [];
                document.forms[formName][this.name].push(element);
                document.forms[formName]['elements'][this.name] = document.forms[formName][this.name];
              } else {
                document.forms[formName][identity] = element;
                document.forms[formName]['elements'] = document.forms[formName]['elements'] || [];
                document.forms[formName]['elements'][identity] = element;
                //document.forms[formName]['elements'][document.forms[formName]['elements'].length ] = element;
              }
            }

            if($.type(element) != 'object') return;

            if(!$(element).hasClass(className)) {
              $(element).addClass(className)
            }
            $(element).val(this.value);
            if(this.type == 'checkbox' || this.type == 'radio') {
              if(this.checked) {
                $(element).attr('checked', 'checked');
              } else {
                $(element).removeAttr('checked');
              }
            }
          });

          $(fakeForm).remove();
        }
      }

      /// Переопределяем стандартную функцию сабмита в аяксовую
      var origSubmit = this.submit;
      var that = this;
      this.submit = function() {
        try {
          var action = $(that).attr('action');
          if(action.indexOf('javascript:') > -1) {
            if(eval(action.split('javascript:')[1]) === false) {
              return false;
            }
          }
          $(that).submit();
        } catch(e) {
          origSubmit();
        }
      }
    });
  }
  return result;
}

})(__panel, jQuery);
