<?php

function make_schema($plugins, $gwpanel_path) {
  $schema_pages = $schema_events = $schema_listeners = $schema_methods = array();

  $tests = array();
  $widget_classes = $button_classes = $module_info = array();

  foreach($plugins as $plugin_name => $plugin) {
    if(is_array($plugin['pages'])) {
      foreach($plugin['pages'] as $page => $scripts) {
        if(!is_array($scripts)) continue;
        if(!isset($schema_pages[$page])) $schema_pages[$page] = array();
        $schema_pages[$page] = array_merge($schema_pages[$page], $scripts);
      }
      //$schema_scripts[$plugin_name] = $plugin['schemaScript'];
    }

    if(isset($plugin['methods']) && is_array($plugin['methods'])) {
      foreach($plugin['methods'] as $key => $val) {
        if(!isset($plugin['methods'][$key]['module'])) {
          $plugin['methods'][$key]['module'] = $plugin_name;
        }
      }
      $schema_methods= array_merge($schema_methods, $plugin['methods']);
    }  

    if(isset($plugin['events']) && is_array($plugin['events'])) {
      foreach($plugin['events'] as $event => $info) {
        $schema_events[$event] = $info;
      }
    }

    if(isset($plugin['listeners']) && is_array($plugin['listeners'])) {
      foreach($plugin['listeners'] as $event => $listeners) {
        if(!isset($schema_listeners[$event])) $schema_listeners[$event] = array();
        $schema_listeners[$event] = array_merge($schema_listeners[$event], $listeners);
      }
    }

    if(isset($plugin['buttons']) && is_array($plugin['buttons'])) {
      foreach($plugin['buttons'] as $type => $button) {
        $button['module'] = $plugin_name;
        $button['weight'] = isset($plugin['weight'])? $plugin['weight']: 0;
        $button_classes[$plugin_name . '_' . $type] = $button;
      }
    }

    if(isset($plugin['widgets']) && is_array($plugin['widgets'])) {
      foreach($plugin['widgets'] as $type => $widget) {
        $widget['module'] = $plugin_name;
        $widget['weight'] = isset($plugin['weight'])? $plugin['weight']: 0;
        $widget_classes[$plugin_name . '_' . $type] = $widget;
      }
    }

    foreach(glob(realpath(dirname(__FILE__) . '/../' . $plugin_name) . '/*_test.js') as $_file) {
      $tests[] = $plugin_name . '/' . basename($_file);
    }

    $module_info[$plugin_name] = array(
      'title' => isset($plugin['title'])? $plugin['title']: $plugin_name,
      'description' => isset($plugin['description'])? $plugin['description']: '',
      'weight' => isset($plugin['weight'])? $plugin['weight']: 0,
    );
  }

  $themes = array();
  foreach(glob($gwpanel_path . '/themes/*', GLOB_ONLYDIR) as $theme_path) {
    $theme_name = basename($theme_path);
    if($theme_name{0} == '.') continue;
    try {
      $theme = json_decode(file_get_contents($theme_path . '/theme.json'), TRUE);
      if(!$theme) continue;
      if(!isset($theme['icons'])) $theme['icons'] = array();
      foreach(glob($theme_path . '/icons/*') as $icon) {
        $icon_name = basename($icon);
        $ar = explode('.', $icon_name);
        end($ar);
        $ext = strtolower(current($ar));
        if(in_array($ext, array('png', 'gif', 'jpg', 'jpeg'))) {
          array_unshift($theme['icons'], $icon_name);
        }
      }
      $themes[$theme_name] = $theme;
    } catch(Exception $e) {
      continue;
    }
  }


  $schema = array();
  $schema['pages'] = $schema_pages;
  $schema['methods'] = $schema_methods;
  $schema['events'] = $schema_events;
  $schema['listeners'] = $schema_listeners;
  $schema['widgets'] = $widget_classes;
  $schema['buttons'] = $button_classes;
  $schema['modules'] = $module_info;
  $schema['themes'] = $themes;
  $schema['tests'] = $tests;

  return $schema;
}