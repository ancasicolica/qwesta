<?
/*
 File:    configuration.template.php
 Purpose: Configuration of the webserver PHP scripts. THIS IS A TEMPLATE ONLY!
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 22.9.14
 Github:  https://github.com/ancasicolica/qwesta

 Instructions: change all the settings of this file as needed by your system and
 then rename this file to configuration.php.

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
namespace qwesta;

class Configuration
{
  // Gets the configuration object
  public static function get()
  {
    $config = new \stdClass();

    $config->debug = false; // Enables debug functions when needed

    // Database settings
    $config->mysqlServer = "your.db.server.com";
    $config->mysqlUser = "dbUserName";
    $config->mysqlPass = "yourPassword";
    $config->mysqlDb = "theDbTouse";
    $config->mysqlTableWeather = "qwesta";

    // This is the same hash seed as in the node part. The scripts
    // on the webserver only accepts data signed with the same seed.
    $config->communicationHashSeed =
      "2b3623d31f0e5b6018124bafec1a5b8cdac854a4";
    return $config;
  }

  /**
   * Returns the offset from UTC for a given day
   * @param $day  integer
   * @param $month integer
   * @return string
   */
  public static function getUtcOffset($day, $month)
  {
    // Todo: Add DST Rule
    return '+02:00';
  }
}
?>