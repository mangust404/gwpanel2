// author   гном убийца
// id       433067

(function(panel) {
jQuery.extend(panel, {
  player_carma: function(options){
    var $carma;

    $carma = jQuery('b:contains("Карма")');
    if($carma.length){
      $carma.closest('table').remove();
    }
  }
});
})(window.__panel);