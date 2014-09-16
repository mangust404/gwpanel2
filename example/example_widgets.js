(function(panel) {

  /**
  * Приватная функция
  * она нигде больше не видна кроме текущей зоны видимости и дочерних
  */
  function example_private_func() {
    ///
  }
  
jQuery.extend(panel, {
  example_widget: function(options) {
    /// в этой функции this указывает на jQuery-объект созданного виджета
    /// здесь вы должны осуществить прорисовку виджета
    /// CSS для виджета должен храниться в теме, в соответствующей папке
    panel.loadCSS('example/widget.css');
    /// чтобы передать this в низлежащие области видимости, можно сделать вот так:
    var that = this;
    jQuery.each(options, function(key, value)) {
      that.append('<p>' + key + '=' + value + '</p>');
    });
  }
});
})(window.__panel);