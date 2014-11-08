<?php

function make_bootstrap($domain, $path, $libs) {
  return '

(function() {
  if(location.pathname == "/b0/btk.php") return;

  var environment = document.cookie.match(/gwp2_e=([a-z]+)/)? RegExp.$1: null;

  if(environment == "dev") return;

  if(environment == "staging" || environment == "deploy") {
    var panelURL = "http://gwpanel.org/panel2";
  } else {
    var panelURL = "http://f.ganjafile.ru/gwpanel";
  }

  if(location.pathname == "/tmp/panel2container.html") {
    /// initialize container
    var libs = ["jquery.min.js"];
    var loadedLibs = 0;

    for(var i = 0; i < libs.length; i++) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = panelURL + "/lib/" + libs[i];
      s.addEventListener("load", function() {
        loadedLibs++;
        if(loadedLibs >= libs.length) {
          initialize();
        }
      })
      document.getElementsByTagName("head")[0].appendChild(s);
    }

    var initialize = function() {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = panelURL + "/lib/crossclient.js";
      document.getElementsByTagName("head")[0].appendChild(s);
    }
    return;
  }

  /// initialize main
  var package;
  var stage;

  var libs = ' . json_encode($libs) . ';
  var loadedLibs = 0;

  var testing = location.search.indexOf(\'gwpanel_test\') != -1 && location.search.indexOf(\'continue\') == -1;

  var $indexeddb, $websql;

  if(testing) libs.push(\'qunit-1.15.0.js\');

  for(var i = 0; i < libs.length; i++) {
    var s = document.createElement("script");
    s.type = "text/javascript";
    if((libs[i] == "jquery.min.js" || libs[i] == "jquery.js") && 
      window.jQuery) {
      libs.splice(i, 1);
      if(libs.length == 0) setTimeout(function() {
        initDB();
      }, 1);
      continue;
    }
    s.src = panelURL + "/lib/" + libs[i];
    s.addEventListener("load", function() {
      loadedLibs++;
      if(loadedLibs >= libs.length) {
        initDB();
      }
      if(testing && window.jQuery && !jQuery("#qunit-fixture").length) {
        try {
          jQuery(\'<div id="qunit-fixture"></div>\').prependTo(document.body);
          jQuery(\'<div id="qunit"></div>\').prependTo(document.body);
        } catch(e) {}
      }
    })
    document.getElementsByTagName("head")[0].appendChild(s);
  }

  var initDB = function() {
    var s = document.createElement("script");
    s.type = "text/javascript";
    if(window.indexedDB) {
      s.src = panelURL + "/lib/jquery.indexeddb" + 
        (environment == "production" && false? ".min": "") + ".js";
    } else if(window.openDatabase) {
      s.src = panelURL + "/lib/jquery.db" + 
      (environment == "production"? ".min": "") + ".js";
    } else {
      alert("' . iconv('UTF-8', 'CP1251', 'Извините, ваш браузер не поддерживается, т.к. в нём отсутствует поддержка базы данных.\nРекомендуемые браузеры: Firefox, Chrome, Opera, Safari последних версий.') . '");
    }
    s.addEventListener("load", function() {
      if(window.indexedDB) {
        $indexeddb = jQuery.indexedDB("gwp2", {
          "schema": {
            "1": function(versionTransaction){
              versionTransaction.createObjectStore("packages");
            }
          }
        });
      } else if(window.openDatabase) {
        $websql = jQuery.db("gwp2", "1.0", "GWPanel 2 database", 1024 * 1024 * 15);
        $websql.tables(function(tables) {
          if(tables.indexOf("packages") == -1) {
            $websql.createTable({
                name: "packages",
                columns: ["version INTEGER PRIMARY KEY", "value TEXT"],
                done: function () {},
                fail: function () {
                  console.log("error while creating table");
                }
            });
          }
        });
      }
      initialize();
    })
    document.getElementsByTagName("head")[0].appendChild(s);
  }

  var getDB = function(version, callback, failover) {
    if($indexeddb) {
      $indexeddb.transaction(["packages"]).then(function(result){
      }, function(){
        failover();
      }, function(t) {
        t.objectStore("packages").get(version).then(function(result) {
          if(jQuery.type(result) == "object" && 
             jQuery.type(result["panel/panel.js"]) == "string") {
            /// В хранилище есть этот пакет, ничего грузить не надо
            callback(result);
          } else {
            failover();
          }
        });
      });
    } else if($websql) {
      $websql.criteria("packages").add(jQuery.db.restriction.eq("version", version)).list(
        function (transaction, results) {
          if(results.rows.length == 1) {
            var result = JSON.parse(results.rows.item(0).value);
            if(jQuery.type(result) == "object" && 
               jQuery.type(result["panel/panel.js"]) == "string") {
              /// В хранилище есть этот пакет, ничего грузить не надо
              return callback(result);
            }
          }
          failover();
        },
        function (transaction, error) {
          failover();
        }
      );
    }
  }

  var setDB = function(version, __package, callback) {
    if($indexeddb) {
      $indexeddb.transaction(["packages"]).then(function(result){
        callback();
      }, function(){
      }, function(t) {
        t.objectStore("packages").add(package, version);
      });
    } else if($websql) {
      $websql.insert("packages", {
        data: {
          version: version,
          value: JSON.stringify(__package)
        },
        done: function () {
          callback();
        }
      });
    }
  }
  
  var delDB = function() {
    if($indexeddb) {
      $indexeddb.objectStore("packages").each(function(item) { item.delete() });
    } else if($websql) {
      $websql.dropTable({name: "packages"});
    }
  }

  var initialize = function() {
    if(!environment) {
      var myDate = new Date();
      myDate.setMonth(myDate.getMonth() + 120);
      document.cookie = "gwp2_e=production;expires=" + myDate 
                     + ";domain=.ganjawars.ru;path=/";
    }
    if(environment == "dev") {
      return;
    }
    environment = (["production", "deploy", "staging"]).indexOf(environment) == -1? "production": environment;
    var ar = document.cookie.match(/gwp2_v=([0-9]+)/);
    var panel_version = ar? parseInt(ar[1]): null;

    var ar = document.cookie.match(/gwp2_st=([0-9]+)/);
    stage = ar? parseInt(ar[1]): null;

    /// Получение пакета указанной версии с сервера или из локального хранилища
    window.__checkoutPackage = function(package_version, callback) {
      if(environment == "deploy") {
        callback(package);
        return;
      }
      if(String(typeof(package)).toLowerCase() == "object") {
        callback(package);
        return;
      }
      function download() {
        /// В хранилище нет пакета или он повреждён, грузим с сервера
        var path = panelURL + "/release";
        str_version = String(package_version);
        for(var i = 0; i < str_version.length; i++) {
          path += "/" + str_version.charAt(i);
        }
        path += "/" + str_version + ".package.js";
        if(environment == "staging") {
          path += "?" + stage;
        }
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = path;
        s.addEventListener("load", function() {
          if(!window.__package) {
            /// TODO отработать отправку ошибки и возврат на предыдущую версию
            throw("Повреждён файл пакета " + path);
          }
          package = window.__package;

          setDB(package_version, package, function() {
            sessionStorage.clear();
            callback(package);
          });
        }, false);
        document.getElementsByTagName("head")[0].appendChild(s);        
      }

      getDB(package_version, function(result) {
        package = result;
        callback(package);
      }, download);
    }

    function __checkoutVersion(callback) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = panelURL + "/release/version_" + environment + ".js?_" + (new Date).getTime();
      s.addEventListener("load", function() {
        panel_version = window.current_panel_version;
        var myDate = new Date();
        myDate.setMonth(myDate.getMonth() + 120);
        document.cookie = "gwp2_v=" + panel_version + ";expires=" + myDate 
                       + ";domain=.ganjawars.ru;path=/";
        if(environment == "staging") {
          __checkoutStage(function() {
            callback(panel_version);
          });
        } else {
          callback(panel_version);
        }
      }, false);
      document.getElementsByTagName("head")[0].appendChild(s);
    }

    function __checkoutStage(callback) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = panelURL + "/release/stage.js?_" + (new Date).getTime();
      s.addEventListener("load", function() {
        stage = window.current_panel_stage;
        var myDate = new Date();
        myDate.setMonth(myDate.getMonth() + 120);
        document.cookie = "gwp2_st=" + stage + ";expires=" + myDate 
                       + ";domain=.ganjawars.ru;path=/";
        callback(stage);
      }, false);
      document.getElementsByTagName("head")[0].appendChild(s);
    }

    window.__loadCSS = function(path, callback, failover) {
      if(String(typeof(path)).toLowerCase() == "string") {
        path = [path];
      }
      var loaded = 0;
      for(var i = 0; i < path.length; i++) {
        if(environment == "deploy") {
          /// Решение взято с http://www.yearofmoo.com/2011/03/cross-browser-stylesheet-preloading.html
          var link = document.createElement(\'link\');
          link.type = \'text/css\';
          link.rel = \'stylesheet\';
          link.id = \'css-preload-\' + path[i].replace(/[^a-z0-9]+/g, \'-\') + (new Date().getTime());
          link.href = panelURL + "/" + path[i] + "?" + panel_version;

          document.getElementsByTagName(\'head\')[0].appendChild(link);

          if(navigator.userAgent.indexOf(\'MSIE\') != -1 || 
            (window.opera && window.opera.version() > 13)) {
            link.onload = callback;
            link.onerror = failover;
          } else {
            var counter = 0;
            var check = function() {
              var target = document.getElementById(link.id);
              if(target.sheet) {
                var stylesheets = document.styleSheets;
                for(var i = 0; i < stylesheets.length; i++) {
                  var file = stylesheets[i];
                  var owner = file.ownerNode ? file.ownerNode : file.owningElement;
                  if(owner && owner.id == link.id) {
                    loaded++;
                    if(loaded >= path.length && callback) {
                      callback();
                    }
                    return;
                  }

                  if(counter++ > 10) {
                    if(failover) failover();
                    return;
                  }
                }
              }

              setTimeout(check, 10);
            }
            check();
          }
          document.getElementsByTagName(\'head\')[0].appendChild(link);
        } else {
          if(sessionStorage["gwp2_f_" + path[i]]) {
            css = sessionStorage["gwp2_f_" + path[i]];
            if(typeof(css) != undefined && css.length) {
              jQuery("<style type=\'text/css\'></style>").html(css).attr("gwpanel", true).appendTo("head");
              loaded++;
              if(callback && loaded == path.length) setTimeout(callback, 1);
            } else {
              if(failover) failover();
            }
          } else {
            __checkoutPackage(panel_version, function(package) {
              if(typeof(package[path[i]]) != undefined && package[path[i]].length) {
                sessionStorage["gwp2_f_" + path[i]] = package[path[i]];
                jQuery("<style type=\'text/css\'></style>").html(package[path[i]]).attr("gwpanel", true).appendTo("head");
                loaded++;
                if(callback && loaded == path.length) setTimeout(callback, 1);
              } else {
                if(failover) failover();
              }
            });
          }
        }
      }
    }

    window.__loadScript = function(path, callback, failover) {
      if(String(typeof(path)).toLowerCase() == "string") {
        path = [path];
      }
      var loaded = 0;
      for(var i = 0; i < path.length; i++) {
        if(environment == "deploy") {
          var s = document.createElement("script");
          s.type = "text/javascript";
          s.charset="UTF-8";
          s.src = panelURL + "/" + path[i] + "?" + panel_version;
          s.addEventListener("load", function() {
            loaded++;
            if(loaded >= path.length && callback) {
              callback();
            }
          }, false);
          var stack = (new Error).stack;
          s.addEventListener("error", failover, false);
          document.getElementsByTagName("head")[0].appendChild(s);
        } else {
          if(typeof(sessionStorage["gwp2_f_" + path[i]]) != "undefined") {
            try {
              eval.apply(window, [sessionStorage["gwp2_f_" + path[i]]]);
              loaded++;
              if(callback && loaded >= path.length) callback();
            } catch(e) {
              loaded++;
              if(failover) failover(e);
            }
          } else {
            __checkoutPackage(panel_version, function(package) {
              if(typeof(package[path[i]]) == "undefined") {
                if(failover) failover();
                return;
              }
              sessionStorage["gwp2_f_" + path[i]] = package[path[i]];
              try {
                eval.apply(window, [package[path[i]]]);
                loaded++;
                if(callback && loaded >= path.length) callback();
              } catch(e) {
                loaded++;
                if(failover) failover(e);
              }
            });
          }
        }
      }
    }

    window.__getCookies = function() {
      var cookie, i, length, keyValue;
      var __cookies = {};
      cookie = document.cookie.split('; ');
      for(i = 0, length = cookie.length; i < length; i++){
        keyValue = cookie[i].split("=");
        __cookies[keyValue[0]] = encodeURIComponent(keyValue[1]);
      }
      return __cookies;
    }

    window.__clearCache = function(domain_prefix) {
      var myDate = new Date();
      if(!domain_prefix) {
        /// если не указан префикс домена, то это глобальная очистка
        document.cookie = "gwp2_c=;expires=" + myDate 
                         + ";domain=.ganjawars.ru;path=/";
        /// очищаем остальные куки
        document.cookie = "gwp2_st=;expires=" + myDate 
                       + ";domain=.ganjawars.ru;path=/";
        document.cookie = "gwp2_v=;expires=" + myDate 
                       + ";domain=.ganjawars.ru;path=/";
      }
      /// предотвращаем заполнение sessionStorage скриптами из старого пакета
      package = false;
      /// очищаем временное хранилище для этого домена
      sessionStorage.clear();
      /// очищаем базу для этого домена
      delDB();
    }

    var panelInitFunc = function(version) {
      /// определяем, нужно ли очистить кеш для этого домена
      var domainPrefix = document.domain.split(\'.\')[0];
      var cachedDomains = (__getCookies().gwp2_c || \'\').split("-");
      if(cachedDomains.length > 0 && cachedDomains.indexOf(domainPrefix) == -1) {
        __clearCache(domainPrefix);
      }

      window.__checkoutPackage(version, function(package) {
        window.__loadScript(["lib/settings.js", 
                              "panel/panel.js", 
                              "lib/crosswindow.js", 
                              "apply.js"], function() {
          window.__panel = new window.Panel2(environment, panelURL);
          window.__panel.init();
          window.__panel.ready(function() {
            /// проверяем закеширован ли домен. Если нет, добавляем.
            /// по идее панель должна была добавить домен в список
            var cachedDomains = (__getCookies().gwp2_c || \'\').split(\'-\');
            if(cachedDomains.indexOf(domainPrefix) == -1) {
              cachedDomains.push(domainPrefix);
              var myDate = new Date();
              myDate.setMonth(myDate.getMonth() + 120);
              document.cookie = "gwp2_c=" + cachedDomains.join(\'-\') + ";expires=" + myDate + ";domain=.ganjawars.ru;path=/";
            }
          });
        }, function(e) {
          if(window.console) console.log(e);
          if(confirm("' . iconv('UTF-8', 'CP1251', 'Упс. Кажется в версии GWPanel, которая у вас сейчас сохранена, произошла какая-то ошибка.\n Скорее всего она уже исправлена, надо просто обновиться. Вы хотите попробовать это сделать?') . '")) {
            var myDate = new Date();
            document.cookie = "gwp2_v=0;expires=" + myDate
                       + ";domain=.ganjawars.ru;path=/";
 
          }
        });
      });
    }

    if(environment == "staging" && isNaN(stage)) {
      if(!isNaN(panel_version) && panel_version > 0) {
        __checkoutStage(function() {
          panelInitFunc(panel_version);
        });
      } else {
        __checkoutStage(function() {
          __checkoutVersion(panelInitFunc);
        });
      }
    } else if(!isNaN(panel_version) && panel_version > 0) {
      panelInitFunc(panel_version);
    } else {
      __checkoutVersion(panelInitFunc);
    }
  }
})();
';

}