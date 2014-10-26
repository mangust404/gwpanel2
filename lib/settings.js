/// Коллекция настроек для различных типов устройств
window.panelSettingsCollection = {
  default: {
    'title': 'Базовые настройки, основное меню слева)',
    "system": {
      "theme":"base",
      "btnwidth":70,
      "btnheight":85,
    },

    "panes":[{
      "width":8,
      "height":4,
      "buttons":[{
        "type":"map_goport",
        "arguments": {},
        "left":1,
        "top":0,
        "id":"map_goport_0",
        "paneID":"0",
        "title":"",
        "img":"anchor.png"
      }, {
        "type":"map_gohome",
        "title":"",
        "img":"home.png",
        "left":0,
        "top":0,
        "id":"map_gohome_0",
        "paneID":"0"
      }, {
        "type":"panel_link",
        "title":"Форум",
        "img":"link.png",
        "arguments": {
          "link":"http://www.ganjawars.ru/forum.php",
          "blank":0
        },
        "left":7,
        "top":0,
        "id":"button_panel_link_0",
        "paneID":"0"
      }, {
        "type":"notepad_notepad_sticker_create",
        "arguments":{},
        "id":"notepad_notepad_sticker_create_0",
        "title":"","img":"sticker.png",
        "top":3,
        "left":0,
        "paneID":"0"
      }, {
        "type":"map_gooverlord",
        "arguments":{},
        "id":"map_gooverlord_0",
        "title":"",
        "img":"overlord.png",
        "top":0,
        "left":4,
        "paneID":"0"
      }, {
        "type":"notepad_notepad_button",
        "arguments":{},
        "id":"notepad_notepad_button_0",
        "title":"",
        "img":"notepad.png",
        "top":3,
        "left":1,
        "paneID":"0"
      }, {
        "type":"panel_settings",
        "left":4,
        "top":3,
        "id":"button_panel_settings_0"
      }, {
        "type":"map_goout",
        "arguments":{},
        "id":"map_goout_0",
        "title":"",
        "img":"outland.png",
        "top":0,"left":3,
        "paneID":"0"
      }, {
        "type":"panel_settings_page",
        "arguments":{},
        "id":"panel_settings_page_0",
        "title":"",
        "img":"settings.png",
        "top":3,"left":5
      }, {
        "type":"panel_exit",
        "arguments":{},
        "id":"panel_exit_0",
        "title":"",
        "img":"exit.png",
        "top":3,
        "left":7,
        "paneID":"0"
      }],
      "widgets":[{
        "type":"npc_npc_z",
        "arguments":{
          "friends":[],
          "enemies":[],
          "undress":true
        },
        "id":"npc_npc_z",
        "top":1,
        "left":0,
        "height":2,
        "width":6,
        "index":0,
        "paneID":"0"
      }]
    }, {
      "width":5,"height":4,"buttons":[],"widgets":[]
    }, {
      "width":6,"height":3,"buttons":[],"widgets":[]
    }, {
      "width":5,"height":4,"buttons":[],"widgets":[]
    }, {
      "width":8,"height":6,"buttons":[],"widgets":[]
    }, {
      "width":10,"height":6,"buttons":[],"widgets":[]
    }, {
      "width":13,"height":6,"buttons":[],"widgets":[]
    }],
    "widgets":[{
      "type":"home_health_widget",
      "arguments":{
        "timers":true,
        "autohide":true,
        "size":"1",
        "type":1
      },
      "left":564,
      "top":2,
      "id":"home_health_widget_0",
      "height":1,
      "width":2,
      "index":0,
      "float":true,
      "module":"home",
      "no_opacity":true
    }],
    "settings":{
      "outland": {
        "outland_init":{
          "autos":true,
          "fightas":true,
          "takeas":true
        },
        "outland_check_set": {},
        "outland_auto_sail": {
          "port":"10"
        },
        "outland_auto_close": {},
        "outland_auto_pick": {},
        "outland_highlight":{},
        "outland_hotkeys":{}
      },
      "example": {
        "example_func2": {},
        "example_func1": {},
        "example_highlight_players":{}
      },
      "home": {
        "home_health":{},
        "home_durability":{}
      },
      "battle": {
        "battle_fix":{},
        "battle_init":{}
      },
      "map": {
        "map_mmupdate": {},
        "map_sector": {},
        "map_links":{}
      },
      "panel": {
        "panel_homepage":{},
        "panel_ajaxify":{}
      },
      "stat": {
        "stat_check_update_achievements":{},
        "stat_update_personal":{},
        "stat_draw_main_counters":{},
        "stat_update_info_personal":{},
        "stat_draw_info_counters":{}
      },
      "player": {
        "player_casino":{},
        "player_family":{},
        "player_carma":{}
      },
      "forum":{
        "forum_hide":{
          "main_forums":[]
        }
      },
      "common": {
        "common_players_tooltip": {}
      },
      "npc": {
        "npc_updStatus":{},
        "ncp_warlogCheck":{}
      },
      "ferma": {
        "ferma_hotkeys":{}
      },
      "items": {
        "items_sets":{}
      }
    },
    "blacklist":[],
    "whitelist":[]
  },

  default_bottom: {
    'title': 'Базовые настройки (основное меню в нижнем левом углу)',
    "system":{
      "theme":"base",
      "btnwidth":70,
      "btnheight":85,
    },

    "panes":[{
      "width":8, "height":4, "buttons":[], "widgets": []
    }, {
      "width":5,"height":4,"buttons":[],"widgets":[]
    }, {
      "width":6,"height":3,"buttons":[],"widgets":[]
    }, {
       "width":5,"height":4,"buttons":[],"widgets":[]
    }, {
      "width":8,"height":6,
      "buttons":[{
        "type":"map_goport",
        "arguments": {},
        "left":1,
        "top":0,
        "id":"map_goport_0",
        "paneID":"0",
        "title":"",
        "img":"anchor.png"
      }, {
        "type":"map_gohome",
        "title":"",
        "img":"home.png",
        "left":0,
        "top":0,
        "id":"map_gohome_0",
        "paneID":"0"
      }, {
        "type":"panel_link",
        "title":"Форум",
        "img":"link.png",
        "arguments": {
          "link":"http://www.ganjawars.ru/forum.php",
          "blank":0
        },
        "left":7,
        "top":0,
        "id":"button_panel_link_0",
        "paneID":"0"
      }, {
        "type":"notepad_notepad_sticker_create",
        "arguments":{},
        "id":"notepad_notepad_sticker_create_0",
        "title":"","img":"sticker.png",
        "top":3,
        "left":0,
        "paneID":"0"
      }, {
        "type":"map_gooverlord",
        "arguments":{},
        "id":"map_gooverlord_0",
        "title":"",
        "img":"overlord.png",
        "top":0,
        "left":4,
        "paneID":"0"
      }, {
        "type":"notepad_notepad_button",
        "arguments":{},
        "id":"notepad_notepad_button_0",
        "title":"",
        "img":"notepad.png",
        "top":3,
        "left":1,
        "paneID":"0"
      }, {
        "type":"panel_settings",
        "left":4,
        "top":3,
        "id":"button_panel_settings_0"
      }, {
        "type":"map_goout",
        "arguments":{},
        "id":"map_goout_0",
        "title":"",
        "img":"outland.png",
        "top":0,"left":3,
        "paneID":"0"
      }, {
        "type":"panel_settings_page",
        "arguments":{},
        "id":"panel_settings_page_0",
        "title":"",
        "img":"settings.png",
        "top":3,"left":5
      }, {
        "type":"panel_exit",
        "arguments":{},
        "id":"panel_exit_0",
        "title":"",
        "img":"exit.png",
        "top":3,
        "left":7,
        "paneID":"0"
      }],
      "widgets":[{
        "type":"npc_npc_z",
        "arguments":{
          "friends":[],
          "enemies":[],
          "undress":true
        },
        "id":"npc_npc_z",
        "top":1,
        "left":0,
        "height":2,
        "width":6,
        "index":0,
        "paneID":"0"
      }]
    }, {
      "width":10,"height":6,"buttons":[],"widgets":[]
    }, {
      "width":13,"height":6,"buttons":[],"widgets":[]
    }],
    "widgets":[{
      "type":"home_health_widget",
      "arguments":{
        "timers":true,
        "autohide":true,
        "size":"1",
        "type":1
      },
      "left":564,
      "top":2,
      "id":"home_health_widget_0",
      "height":1,
      "width":2,
      "index":0,
      "float":true,
      "module":"home",
      "no_opacity":true
    }],
    "settings":{
      "outland": {
        "outland_init":{
          "autos":true,
          "fightas":true,
          "takeas":true
        },
        "outland_check_set": {},
        "outland_auto_sail": {
          "port":"10"
        },
        "outland_auto_close": {},
        "outland_auto_pick": {},
        "outland_highlight":{},
        "outland_hotkeys":{}
      },
      "example": {
        "example_func2": {},
        "example_func1": {},
        "example_highlight_players":{}
      },
      "home": {
        "home_health":{},
        "home_durability":{}
      },
      "battle": {
        "battle_fix":{},
        "battle_init":{}
      },
      "map": {
        "map_mmupdate": {},
        "map_sector": {},
        "map_links":{}
      },
      "panel": {
        "panel_homepage":{},
        "panel_ajaxify":{}
      },
      "stat": {
        "stat_check_update_achievements":{},
        "stat_update_personal":{},
        "stat_draw_main_counters":{},
        "stat_update_info_personal":{},
        "stat_draw_info_counters":{}
      },
      "player": {
        "player_casino":{},
        "player_family":{},
        "player_carma":{}
      },
      "forum":{
        "forum_hide":{
          "main_forums":[]
        }
      },
      "common": {
        "common_players_tooltip": {}
      },
      "npc": {
        "npc_updStatus":{},
        "ncp_warlogCheck":{}
      },
      "ferma": {
        "ferma_hotkeys":{}
      },
      "items": {
        "items_sets":{}
      }
    },
    "blacklist":[],
    "whitelist":[]
  }
}