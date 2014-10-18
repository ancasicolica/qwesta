<?php
/*
 File:    push.php
 Purpose: Saves the weather data in the DB
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 30.9.14
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
require_once("configuration.php");
// Read params
extract($_REQUEST);
$arr = get_defined_vars();
$params = new stdClass(); // avoids PHP warning
if(is_array($arr)) {
  foreach($arr as $pkey => $post) {
    $params->$pkey = $post;
  }
}

$config = Configuration::get();

// Verify hash
$hash = sha1($config->communicationHashSeed.$params->q);
$result = new stdClass();
if (strcmp($hash, $params->h) != 0) {
  $result->status = "error";
  $result->message = "Hash error";
  die(json_encode($result));
}

$record = json_decode(base64_decode($params->q), true);
$result->status = "ok";

$mysqli = new mysqli($config->mysqlServer, $config->mysqlUser,
$config->mysqlPass, $config->mysqlDb);

if ($mysqli->connect_errno) {
  $result->status = "error";
  $result->message = "Connect failed: ".$mysqli->connect_error;
  die(json_encode($result));
}

$sql = sprintf("INSERT INTO $config->mysqlTableWeather
                ( ts,
                  temperature,
                  humidity,
                  wind,
                  rain,
                  israining,
                  raindifference)
                VALUES
                ( '%s',
                  %f,
                  %u,
                  %f,
                  %u,
                  %u,
                  %u)",
                $record['timestamp'],
                $record['temperature'],
                $record['humidity'],
                $record['wind'],
                $record['rain'],
                $record['isRaining'],
                $record['rainDifference']);

if ($record['simulation'] == 'true') {
  $result->sql = $sql;
}
else {
  if (!$mysqli->query($sql)) {
    $result->status = "error";
    $result->message = "Query Error:".$mysqli->error;
    $result->query = $sql;
    die(json_encode($result));
  }
}
$mysqli->close();
echo json_encode($result);
?>
