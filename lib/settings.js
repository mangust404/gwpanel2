/// Коллекция настроек для различных типов устройств
window.panelSettingsCollection = {
	default: {
    'system': {
      'noframe':1,
      'debug':1,
      'version_cmp_to': '300000',
      'theme': 'base',
      'theme_m': '',
      'btnwidth':70,'btnheight':85,
      'plugins':['battle', 'battleimg', 'outland']
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
            'img': 'icons/home.png',
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
            'img': 'icons/pokemon.png',
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
        }
      }
    ],
    'home': {
      'nodura': 1
    },
    'stat': {

    },
    'map': {
      
    }
    /*'notify': {
      'nohht': 0,
      'updateInterval': 0.25,
      '80': '1',
      '80_sound': '11',
      '80_nomsg': '1',
      '100': 0,'100_sound': 0,'100_nomsg': 0,'singlewar': '1',
      'arrival': '1',
      'arrival_sound': '8',
      'a_nosingleisland': '1',
      'workend': '1',
      'workend_sound': 'generic',
      'singlewar_sound': '14',
      'singlewar_nomsg': '1',
      'battle_begin': '1',
      'battle_begin_sound': '14',
      'battle_begin_nomsg': 0,'mail_watch': '1',
      'mail_watch_sound': 'voicemail',
      'mail_watch_nomsg': '1',
      'parcel_watch': '1',
      'parcel_watch_sound': 'send',
      'parcel_watch_nomsg': '1',
      'arrival_nomsg': '1',
      'workend_msg': '1',
      'workend_nomsg': '1',
      'synd_war': '1',
      'synd_war_sound': 'uquestion',
      'synd_war_nomsg': '1',
      'npcattck_sound': 0,'npcattck_nomsg': 0,'gwar': '1',
      'gwar_sound': '25',
      'gwar_nomsg': 0,'quest_to_sound': '4',
      'quest_to_nomsg': 0,'quest_ansto_sound': 'ring',
      'quest_ansto_nomsg': 0,'quest_doto_sound': 'generic',
      'quest_doto_nomsg': 0,'quest_doto_5_sound': 0,'quest_doto_5_nomsg': 0},'home':{'nohht': 0,'nodura': 0},'battle':{'wartime_s': '10',
      'battle_moves': '1',
      'indexes': '1',
      'nobchat_m': 0,'genuniq': '1',
      'autogen':1,'nobgen': 0,'autoredo': 0,'noplinfo': 0,'noblines': 0,'nobopacity': 0,'nobdc': 0,'nobfresize': 0,'advSelect': '1',
      'nobattlepm': 0,
      'bwords': '\u043a\u0443|\u043f\u0440\u0438\u0432\u0435\u0442|\u043f\u0440\u0438\u0432\u0435\u0442 \u0431\u0430\u043d\u0434\u0438\u0442\u044b)|\u0445\u043b\u0430\u0431\u044b\u0441\u044c|\u0431\u0430\u0431\u0430\u0445|\u043f\u044b\u0449\u0449\u0449\u044c\u044c\u044c|Hello World!'
    },
    'outland':{
      'sectorin': '10',
      'autos': '1',
      'check_set': '',
      'fightas': 0,'takeas': '1',
      'highlight': '1'
    },
    'forum': {
      'expand_quotes': 0,
      'from_time': 0
    },
    'other': {
      'npcshow': '2',
      'date_len': '3',
      'island': '1',
      'hideKarma': 0,
      'homesector': '151x149',
      'homeport': '151x150',
      'nouse': 0,'masssell': '1',
      'blevel': '40',
      'gwzoneruSelected': 'uran',
      'eun_price': '65000'
    },*/
  }
}