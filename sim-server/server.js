/**
 * This is the main file for the sim-server
 *
 * The purpose of the sim server is only local testing of the weather station without real webserver
 *
 * Created by kc on 02.04.15.
 */
/***********************************************************************************/
/*
 File:    server.js
 Purpose: Test server for local testing and debugging
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 2.4.15
 Github:  https://github.com/ancasicolica/qwesta

 ----------------------------------------------------------------------------------

 This is free and unencumbered software released into the public domain.

 Anyone is free to copy, modify, publish, use, compile, sell, or
 distribute this software, either in source code form or as a compiled
 binary, for any purpose, commercial or non-commercial, and by any
 means.

 In jurisdictions that recognize copyright laws, the author or authors
 of this software dedicate any and all copyright interest in the
 software to the public domain. We make this dedication for the benefit
 of the public at large and to the detriment of our heirs and
 successors. We intend this dedication to be an overt act of
 relinquishment in perpetuity of all present and future rights to this
 software under copyright law.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.

 For more information, please refer to <http://unlicense.org/>

 */
/***********************************************************************************/

'use strict';


var http = require('http');
var url = require('url');
var path = require('path');
var settings = require('./settings');
var express = require('express');

var app = express();
/**
 * Get the file /ajax/current.html
 * This file contains the current records and is generated
 */
app.get('/push', function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end('hello');
  console.log(request.body);
});

http.createServer(app).listen(settings.testServerPort);

console.log('Weather server is running at http://localhost:' + settings.testServerPort + '/\nCTRL + C to shutdown');

