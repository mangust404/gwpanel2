(function(panel) {
jQuery.extend(panel, {
  player_family: function(options){
    var $family;
    var family, i, length;

    $family = jQuery('b:contains("Семья")');
    if($family.length){
      family = jQuery($family.get(0).nextSibling).text();
      if(family.search(', ') != -1){
        family = family.split(',');
      } else {
        family = [family];
      }

      for(i = 0, length = family.length; i < length; i++){
        if(family[i].match(/ \((.+)\)/)){
          family[i] = family[i].replace(/ (.+) \((.+)\)/, ' <a href="http://www.ganjawars.ru/search.php?key=$1">$1</a> ($2)');
        } else {
          family[i] = family[i].replace(/ (.+)/, ' <a href="http://www.ganjawars.ru/search.php?key=$1">$1</a>');
        }
      }
      family = family.join(',');

      jQuery($family.get(0).nextSibling).replaceWith(family);
    }
  }
});
})(window.__panel);