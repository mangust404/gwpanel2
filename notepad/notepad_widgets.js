(function(panel, $) {
jQuery.extend(panel, {
  notepad_sticker: function(options) {
    panel.loadCSS('notepad/notepad.css');
    this.off('dblclick');
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
    setTimeout(function() {
      if($t.height() > $widget.height()) {
        t_overflow = true;
        $t.attr('title', options.text || '');
      }
    }, 100);
  }
});
})(window.__panel, jQuery);