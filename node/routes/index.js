/**
 *
 * Created by kc on 07.02.16.
 */

var express = require('express');
var router = express.Router();
var settings = require('../settings');
var fs = require('fs');
var path = require('path');
var jade = require('jade');
var logger = require('../lib/logger').getLogger('routes:index');

/* GET home page. */
router.get('/', function (req, res) {

  res.render('index', {
    title: 'Qwesta'
  });
});

module.exports = router;
