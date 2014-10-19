(function(panel, $) {
$.extend(panel, {
  /**
  * Функция, возвращающая массив значений для вывода опций
  */
  example_get_options: function() {
    /// Данные могут быть как в виде массива, так и хеша
    return ['example1', 'example2', 'example3'];
  },

  example_assoc_radio_options: {
    /// Если данные предоставлены в виде хеша, то в опции будет попадать значения
    /// из ключей, а на форме выводиться варианты из значений
    'example1': 'Пример 1',
    'example2': 'Пример 2',
    'example3': 'Пример 3',
    'example4': 'Пример 4'
  }
});
})(window.__panel, jQuery);