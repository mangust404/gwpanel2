<?php

/// откуда будут загружаться файлы, менять не нужно
$src = 'http://gwpanel.org/panel2';

/// куда они будут загружаться, например http://images.ganjawars.ru/gwpanel
$dst = 'http://f.ganjafile.ru/gwpanel';

$current_dir = dirname(__FILE__);

$package = explode("\n", gzdecode(file_get_contents($src . '/package.gz')));

if(!count($package)) {
  die('No files in package');
}
foreach($package as $file) {
  $file = trim($file);
  if(!$file) continue;
  /// убираем . из начала файла
  $file = substr($file, 1);

  $curl = curl_init($src . $file);
  curl_setopt($curl, CURLOPT_NOBODY, true);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($curl, CURLOPT_FILETIME, true);
  $result = curl_exec($curl);
  if ($result === false) {
    die (curl_error($curl)); 
  }
  $timestamp = curl_getinfo($curl, CURLINFO_FILETIME);

  if(($new = !file_exists($current_dir . $file)) || 
      filemtime($current_dir . $file) != $timestamp) {
    $data = file_get_contents($src . $file);
    if($data === FALSE) {
      die('Cannot read from ' . $src . $file . "\n");
    }
    $__dir = dirname($current_dir . $file);
    if(!is_dir($__dir)) {
      mkdir($__dir, 0777, TRUE);
    }
    $ar = explode('.', $file);
    $ext = $ar[count($ar) - 1];

    $basename = basename($file);

    if(preg_match('/[0-9]+\.package\.js/', $basename)) {
      // Распаковываем файл пакета и производим операции по подмене путей:
      //  - вытаскиваем все CSS файлы и меняем в них url
      $package = json_decode(substr($data, strlen('window.__package=')), TRUE);
      
      foreach($package as $filename => $filedata) {
        $ar = explode('.', $filename);
        $__ext = $ar[count($ar) - 1];
        if($__ext == 'css') {
          if(preg_match_all('/url\(([^\)]+)\)/i', $filedata, $matches)) {
            $package[$filename] = str_replace($src, $dst, $filedata);
          }
        }
      }
      /// собираем пакет обратно
      $data = 'window.__package=' . json_encode($package);
    } else if($basename == 'bootstrap.js') {
      //  - в файле bootstrap.js меняем panelURL на новый
      $data = str_replace($src, $dst, $data);
    }

    if(file_put_contents($current_dir . $file, $data) === FALSE) {
      die('Cannot write to ' . $current_dir . $file . "\n");
    }

    if($ext == 'js' || $ext == 'css') {
      if(file_put_contents($current_dir . $file . '.gz', gzencode($data, 9)) === FALSE) {
        die('Cannot write to ' . $current_dir . $file . '.gz' . "\n");
      }
    }

    if($new) {
      print "New file: {$current_dir}{$file}\n";
    } else {
      print "Update file: {$current_dir}{$file}\n";
    }

    touch($current_dir . $file, $timestamp);
  }
}

?>
