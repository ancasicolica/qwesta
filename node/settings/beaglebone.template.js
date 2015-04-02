/***********************************************************************************/
/*
 File:    beaglebone.template.js
 Purpose: Contains the parts of the configuration of qwesta which should not be in
 GIT, so this is the template for your purpose
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 2.10.14
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

module.exports = function (settings) {

  settings.webserver = {
    hostname: 'www.yourserver.ch',
    url: '/qwesta/push.php'
  };
  // This is for the message signing, must be the same value as in the PHP file
  settings.communicationHashSeed = '11445566eeff44224560db23ee19c8adef3d22de';

  settings.serialComPort = '/dev/ttyUSB0';  // Linux
  settings.simulator = false; // set to true when simulating
  settings.localServerPort = 8888; // set to your port
  settings.htmlRootPath = '/home/kc/sd/qwesta/html'; // set to the place where your html is

  return settings;
};