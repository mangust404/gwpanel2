(function(panel, $) {
$.extend(panel, {
  ferma_action_parser: function(callback, $data) {
    function parse($d) {
      var result = {};

      $td = $d.find('td:contains("Ближайшее действие"):last');

      if($td.length > 0) {
        var $a = $td.find('a');
        result.text = $a.text();
        result.href = $a.attr('href');

        var ar = $td.text().match(/(уже пора|через ([0-9]+) мин)/);
        if(ar) {
          if(parseInt(ar[2]) > 0) {
            result.time = parseInt(ar[2]) * 60;
          } else {
            result.time = 0;
          }
        }
        if($data && $data.length > 0) {
          result.exact = true;
        }

        result.start = (new Date).getTime();
      }

      callback(result);
    }

    if($data && $data.length > 0) {
      parse($data);
    } else {
      $.ajax('/ferma.php', {
        success: function(data) {
          parse($(data));
        },
        error: function() {
          callback(result);
        }
      });
    }
  }
});
})(window.__panel, jQuery);