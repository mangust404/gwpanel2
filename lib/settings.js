/// Коллекция настроек для различных типов устройств
window.panelSettingsCollection = {
	default: {
    'title': 'Базовые настройки',
    'system': {
      'version_cmp_to': '300000',
      'theme': 'base',
      'btnwidth':70,'btnheight':85,
    },
    'panes': [
      {
        'width':6,
        'height':4,
        'buttons': 
        [
          {
            'type': 'map_gohome',
            'title': 'Домой',
            'img': 'home.png',
            'arguments': {
              'sector': '151x149'
            },
            'left': 0,
            'top': 0
          },
          {
            'type': 'panel_link',
            'title': 'Форум',
            'img': 'http://images.ganjawars.ru/img/forum/f27.gif',
            'arguments': {
              'link': 'http://www.ganjawars.ru/forum.php',
              'blank': 0
            },
            'left': 1,
            'top': 0
          },
          {
            'type': 'panel_settings',
            'left':2,'top': 0
          },
          {
            'type': 'map_goport',
            'arguments': {
              'port': '151x150'
            },
            'left':3,
            'top': 0
          },
          {
            'type': 'map_gooverlord',
            'title': 'Overlord',
            'arguments': {
              'port': '10'
            },
            'left': 4,
            'img': 'pokemon.png',
            'top': 0
          },
          {
            'type': 'panel_exit',
            'left': 5,
            'top': 3
          }
        ],
        'widgets': [
          {
            'type': 'npc_npc_z',
            'arguments': {
              'friends': [5,11],
              'enemies': [1,4,7,9],
              'undress':1
            },
            'left': 0,
            'top': 1
          }
        ]
      },
      {
        'width':4,
        'height':4
      },
      {
        'width':6,
        'height':4
      },
      {
        'width':4,
        'height':4
      },
      /// нижние окна
      {
        'width':8,
        'height':6
      },
      {
        'width':8,
        'height':6
      },
      {
        'width':8,
        'height':6
      }
    ],
    'widgets': [
      {
        'type': 'home_health_widget',
        'left': 510,
        'top': 0,
        'arguments': {
          'type': 0,
          'autohide': 1,
          'size': 2
        },
        'float': true,
        'index': 0,
        'module': 'home'
      }
    ]
  }
}