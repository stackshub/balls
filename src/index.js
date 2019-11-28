/* global window */
(function() {
  'use strict';
  var Container = require('./game/Container');
  var Stage = require('./balls/Stage');
  new Container(window, new Stage());
})();
