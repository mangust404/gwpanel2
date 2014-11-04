(function(panel, $) {
jQuery.extend(panel, {
  notepad_sticker: function(options) {
    panel.loadCSS('notepad/notepad.css');
    $widget = this;
    $('<div class="title">').text(options.title || '').appendTo($widget)
      .mousedown(function(e) {
        /// Отменяем дефолтное событие при клике на виджет
        /// должна быть возможность выделять текст
        e.stopPropagation();
        return true;
      })
      .dblclick(function() {
        var $this = $(this);
        var saveFunc = function() {
          var title = $(this).val();
          options.title = title;
          options.save();
          $this.text(title).show();
          $(this).hide();
        }
        if(!this.$input) {
          this.$input = $('<input>', {class: 'title', type: 'text', value: options.title || ''})
            .blur(saveFunc).keypress(function(e) {
              if(e.keyCode == 13) saveFunc.apply(this);
            }).mousedown(function(e) {
              e.stopPropagation();
              return true;
            });
          $this.after(this.$input);
        }
        $this.hide();
        this.$input.show().focus()
        return false;
      });
    var t_overflow;
    var $t = $('<div class="text">').text(options.text || '')
      .appendTo($widget)
      .mousedown(function(e) {
        /// Отменяем дефолтное событие при клике на виджет
        /// должна быть возможность выделять текст
        e.stopPropagation();
        return true;
      })
      .dblclick(function() {
        var $that = $(this);
        var saveFunc = function() {
          var text = $(this).val();
          options.text = text;
          options.save();
          $that.text(text).show();
          if(t_overflow) {
            $that.attr('title', text);
          }
          $(this).hide();
        }
        if(!this.$textarea) {
          this.$textarea = $('<textarea>', {class: 'text'}).val(options.text || '')
            .blur(saveFunc).mousedown(function(e) {
              e.stopPropagation();
              return true;
            });
          $that.after(this.$textarea);
        }
        $that.hide();
        this.$textarea.show().focus()
        return false;
      });
    $('<div class="hint">настройки</div>').appendTo($widget).click(function() {
      $widget.dblclick();
    });
    setTimeout(function() {
      if($t.height() > $widget.height()) {
        t_overflow = true;
        $t.attr('title', options.text || '');
      }
    }, 100);
  },
  /// Быстрое создание стикеров
  notepad_sticker_create: function(options) {
    var currentOptions = panel.getOptions();

    var widgetData = {
      arguments: {
        title: 'Новый стикер',
        text: 'Введите текст',
        height: 2,
        width: 3
      },
      height: 2,
      width: 3,
      index: currentOptions.widgets.length,
      left: 200,
      top: 300,
      type: 'notepad_notepad_sticker',
      module: 'notepad',
      float: true,
      fixed: true
    }

    if(location.search.length > 0) {
      widgetData.only_page = location.pathname + location.search;
    } else {
      widgetData.only_page_class = location.pathname;
    }
    /// нам нужно удостовериться в уникальности ID
    var max_id = 0;
    for(var i = 0; i < currentOptions.widgets.length; i++) {
      if(currentOptions.widgets[i].type == widgetData.type) {
        var ar = currentOptions.widgets[i].id.split('_');
        var __id = parseInt(ar[ar.length - 1]);
        if(__id > max_id) max_id = __id;
      }
    }

    widgetData.id = 'notepad_notepad_sticker_' + (max_id + 1);
    
    currentOptions.widgets.push(widgetData);
    panel.setOptions(currentOptions);

    panel.redrawFloatWidgets();
    panel.hideAllPanes();
  }
});
})(window.__panel, jQuery);