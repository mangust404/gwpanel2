<?php

include('functions.php');

if(isset($_GET['auth_key'])) {
  $gwuid = get_uid($_GET['auth_key']);
  if(!$gwuid) {
    header('Content-type: text/html; charset=utf-8');
    print '__panel.showFlash("К сожалению у вас нет доступа, возможно сессия истекла")';
    exit;
  }
  if(isset($_POST['variants']) && is_array($_POST['variants']) && count($_POST['variants']) > 0) {
    $dbconn = pg_connect("host=pgpool-alfa.neolabs.net port=5432 dbname=gwpanel-org");
    $success = TRUE;
    $success = $success && pg_query($dbconn, "BEGIN");
    $r = pg_query($dbconn, sprintf("SELECT * FROM players_variants WHERE gwuid = %d", $gwuid));
    while($ar = pg_fetch_array($r)) {
      if(isset($_POST['variants'][$ar['variant_alias']])) {
        $success = $success && pg_query($dbconn, sprintf("UPDATE players_variants SET variant_name = '%s', variant_data = '%s', version = %d WHERE vid = %d",
          pg_escape_string($dbconn, $_POST['variants'][$ar['variant_alias']]['name']),
          pg_escape_string($dbconn, $_POST['variants'][$ar['variant_alias']]['options']),
          $_POST['variants'][$ar['variant_alias']]['version'],
          $ar['vid']
        ));
        unset($_POST['variants'][$ar['variant_alias']]);
      }
    }
    foreach($_POST['variants'] as $variant_alias => $data) {
      $success = $success && pg_query($dbconn, sprintf("INSERT INTO players_variants (gwuid, variant_alias, variant_name, variant_data, version) VALUES (%d, '%s', '%s', '%s', %d)",
        $gwuid,
        pg_escape_string($dbconn, $variant_alias),
        pg_escape_string($dbconn, $data['name']),
        pg_escape_string($dbconn, $data['options']),
        $data['version']
      ));
    }
    $success = $success && pg_query('COMMIT');
    if($success) {
      print 'OK';
    } else {
      print 'ERROR';
    }
    pg_close($dbconn);
  } elseif(isset($_GET['download'])) {
    $dbconn = pg_connect("host=pgpool-alfa.neolabs.net port=5432 dbname=gwpanel-org");
    $r = pg_query($dbconn, sprintf("SELECT * FROM players_variants WHERE gwuid = %d", $gwuid));
    $variants = array();
    while($ar = pg_fetch_array($r)) {
      $variants[$ar['variant_alias']] = array(
        'name' => $ar['variant_name'],
        'options' => $ar['variant_data']
      );
    }
    if(count($variants) > 0) {
      print json_encode($variants);
    } else {
      print 'ERROR';
    }
    pg_close($dbconn);
  } else if(isset($_GET['notepad_save'])) {
    $dbconn = pg_connect("host=pgpool-alfa.neolabs.net port=5432 dbname=gwpanel-org");
    $success = TRUE;
    $success = $success && pg_query($dbconn, "BEGIN");
    $r = pg_query($dbconn, sprintf("SELECT * FROM notepad WHERE gwuid = %d AND vid = 0", $gwuid));
    if($r && ($ar = pg_fetch_assoc($r))) {
      $success = $success && pg_query($dbconn, sprintf("UPDATE notepad SET content = '%s' WHERE gwuid = %d AND vid = %d",
        pg_escape_string($dbconn, $_POST['content']),
        $gwuid,
        0
      ));
    } else {
      $success = $success && pg_query($dbconn, sprintf("INSERT INTO notepad (gwuid, vid, name, content) VALUES (%d, %d, '%s', '%s')",
        $gwuid,
        0,
        'default',
        pg_escape_string($dbconn, $_POST['content'])
      ));
    }
    $success = $success && pg_query('COMMIT');
    if($success) {
      print 'OK';
    } else {
      print 'ERROR';
    }
    pg_close($dbconn);

  } else if(isset($_GET['notepad_load'])) {
    $dbconn = pg_connect("host=pgpool-alfa.neolabs.net port=5432 dbname=gwpanel-org");
    $r = pg_query($dbconn, sprintf("SELECT * FROM notepad WHERE gwuid = %d AND vid = 0", $gwuid));
    if($r) {
      $ar = pg_fetch_assoc($r);
      if($ar['content']) {
        print $ar['content'];
      }
    }
    pg_close($dbconn);
  }
} else if(isset($_SESSION['gwuid'])) {
  print '__panel.setAuthKey("' . auth_key($_SESSION['gwuid']) . '")';
} else {
  header('Content-type: text/html; charset=utf-8');
  print '__panel.showFlash("К сожалению у вас нет доступа к этим функциям. Если вы только что вступили в синдикат #5787, то вам надо немножко подождать пока обновится список игроков на сервере. Это не должно занимать больше 20-30 минут.")';
  exit;
}

?>