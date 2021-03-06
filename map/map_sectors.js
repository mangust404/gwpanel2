(function(panel, $) {

$.extend(panel, {
  map_names: {
    '150x149': '[Z] Crystal Sector', 
    '150x150': '[Z] Cyborg Capital', 
    '152x148': '[Z] Cygnus Base', 
    '151x150': '[Z] Energy One', 
    '152x151': '[Z] Firecloud', 
    '151x152': '[Z] Freedom End', 
    '149x152': '[Z] Grand Port', 
    '149x150': '[Z] Katenian', 
    '152x149': '[Z] Kintull', 
    '151x149': '[Z] Mind\'s Eye', 
    '149x149': '[Z] Power Lost', 
    '149x151': '[Z] Surfear', 
    '151x151': '[Z] Tyranny land', 
    '150x151': '[Z] Victoria', 
    '152x152': '[Z] Waterping',
    '51x49': '[G] 13th District',
    '48x53': '[G] 47th street',
    '53x51': '[G] Alice heart',
    '53x53': '[G] Black Brooklyn',
    '53x52': '[G] Black point',
    '51x48': '[G] Bronhs',
    '48x48': '[G] Burton Riders',
    '47x50': '[G] Cheaters nest',
    '51x51': '[G] China-Town',
    '50x53': '[G] Death avenue',
    '52x51': '[G] Extrim Hills',
    '49x53': '[G] Failure of perl',
    '52x47': '[G] Freestylers',
    '50x50': '[G] Ganja City Downtown',
    '48x52': '[G] Ganjabase Southwest',
    '52x50': '[G] Green Parks',
    '48x47': '[G] Greenwitch Village',
    '52x52': '[G] Hammerside',
    '48x50': '[G] Heavy Fuel',
    '53x48': '[G] Igel\'s Fort',
    '50x49': '[G] Katamza Hills',
    '53x47': '[G] Killerloop hills',
    '50x52': '[G] Klamath',
    '47x53': '[G] Lexus base',
    '47x51': '[G] Local park',
    '51x53': '[G] Lost name',
    '47x48': '[G] Love\'s pity',
    '49x49': '[G] Middlemud',
    '51x50': '[G] N.Y City',
    '48x49': '[G] Old Dublin',
    '52x49': '[G] Rastaman\'s Quarters',
    '47x52': '[G] Red point',
    '53x49': '[G] Respect Hill',
    '48x51': '[G] Riverside North',
    '52x48': '[G] Rollers Point',
    '50x47': '[G] Seaside walleys',
    '50x48': '[G] Shametown',
    '47x49': '[G] Sheever place',
    '53x50': '[G] Shipping Bay',
    '49x51': '[G] Shoreside Vale',
    '51x47': '[G] Spaceweed Drift',
    '49x52': '[G] The Wall Streets',
    '50x51': '[G] Tishka & Тихая Valley',
    '51x52': '[G] Vault 15',
    '49x50': '[G] West Side City',
    '47x47': '[G] West Village',
    '52x53': '[G] White Brooklyn',
    '49x47': '[G] Xenon name',
    '49x48': '[G] Yanks',
    '102x101': '[S] Cannabian Peack',
    '100x99': '[S] Death Land',
    '99x100': '[S] Dolphin Port',
    '100x101': '[S] Ice Coast One',
    '101x101': '[S] Ice Coast Two',
    '101x100': '[S] North Road',
    '99x99': '[S] Pola\'s Cottage',
    '100x100': '[S] Prison Camp',
    '123x76': '[P] Coconut Village',
    '122x78': '[P] Crab Beach',
    '122x77': '[P] Curumba Village',
    '123x78': '[P] Ganjamaica',
    '125x76': '[P] Ganjumeira',
    '124x76': '[P] Marley Beach',
    '125x75': '[P] Palm Airport',
    '121x79': '[P] Palm Village',
    '123x77': '[P] Pool\'s Garden',
    '124x77': '[P] Sky Hotel',
    '125x77': '[P] Surf Beach',
    '122x76': '[P] Turtle Beach',
    '124x78': '[P] White Sands'
  },
  map_ports: {
    '149x149': {name: '[Z] Power Lost', sector: 7, id: 68977}, 
    '152x148': {name: '[Z] Cygnus Base', sector: 8, id: 68978}, 
    '151x152': {name: '[Z] Freedom End', sector: 9, id: 12083}, 
    '151x150': {name: '[Z] Energy One', sector: 10, id: 22137}, 
    '149x152': {name: '[Z] Grand Port', sector: 11, id: 55915}, 
    '52x50': {name: '[G] Green Parks', sector: 0, id: 11712}, 
    '49x53': {name: '[G] Failure of perl', sector: 1, id: 11718}, 
    '50x47': {name: '[G] Seaside walleys', sector: 2, id: 11739}, 
    '47x49': {name: '[G] Sheever place', sector: 3, id: 68982}, 
    '47x52': {name: '[G] Red point', sector: 4, id: 68981}, 
    '53x53': {name: '[G] Black Brooklyn', sector: 5, id: 68983}, 
    '99x100': {name: '[S] Dolphin Port', sector: 6, id: 11717}, 
    '125x75': {name: '[P] Palm Airport', sector: 13, id: 69403}
  },

  map_get_sectors: function(island) {
    var result = {};
    if(island) {
      island = island.toUpperCase();
      $.each(panel.map_names, function(sector, name) {
        if(name.indexOf('[' + island + ']') > -1) {
          result[sector] = name;
        }
      });
      return result;
    } else {
      return panel.map_names;
    }
  },

  map_get_ports_names: function(island) {
    var result = {};
    if(island) {
      island = island.toUpperCase();
      $.each(panel.map_ports, function(coords) {
        if(this.name.indexOf('[' + island + ']') > -1) {
          result[coords] = this.name;
        }
      });
    } else {
      $.each(panel.map_ports, function(coords) {
        result[coords] = this.name;
      });
    }
    return result;
  },

  map_get_ports_ids: function() {
    var result = {};
    $.each(panel.map_ports, function(coords) {
      result[this.sector] = this.name;
    });
    return result;
  }
});

})(__panel, jQuery);