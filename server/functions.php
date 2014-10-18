<?php

$m = new Memcached();
$m->addServer('localhost', 11211);

function new_auth_key($gwuid) {
  global $m;
  $key = md5($gwuid . rand());
  while($m->get('auth_' . $key)) {
  	$key = md5($gwuid . rand());
  }
  $m->set('auth_' . $key, $gwuid);
  $m->set('auth_key_' . $gwuid, $key);
  return $key;
}

function auth_key($gwuid) {
  global $m;
  return $m->get('auth_key_' . $gwuid);
}

function get_uid($key) {
  global $m;
  return $m->get('auth_' . $key);
}

ini_set('session.save_handler', 'memcached');
ini_set('session.save_path', 'localhost:11211');

session_set_cookie_params(86400, '/', 'new.gwpanel.org');

session_start();

header('Access-Control-Allow-Origin: http://www.ganjawars.ru');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

?>