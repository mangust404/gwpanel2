gwpanel2
========

GWPanel v2



Режимы работы:

production - панель подключается к игре напрямую в HEAD, все скрипты в LS, берутся из соответствующего файла на серваке http://gwpanel.org/panel2/panel/production/2/3/23.package.js

deploy - панель подключается к игре напрямую в HEAD, все скрипты берутся с сервера gwpanel.org/panel2/panel/panel.js?23, gwpanel.org/panel2/panel/panel_tests.js?23 и т.д.

developement - панель подключается через юзерскрипт, все скрипты подключаются с file:/// анапрямую с диска

testing - особый режим, панель подключается так, как указывает текущий режим (production, deploy, developement), скрипты также подрубаются как на то указывает текущий режим (из LocalStorage, с сервера, из файлов с диска)