<?php
/*
 File:    qwestadata.php
 Purpose: Runs queries on the DB (for ajax calls of the web UI)
 Author:  Christian Kuster, CH-8342 Wernetshausen, www.kusti.ch, 18.10.14
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
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once("configuration.php");

// Read params
extract($_REQUEST);
$arr = get_defined_vars();
$params = new stdClass(); // avoids PHP warning
$params->view = "none";

if (is_array($arr)) {
  foreach ($arr as $pkey => $post) {
    $params->$pkey = $post;
  }
}

if ($params->view == "dataByDay") {
  echo json_encode(getDataByDay($params));
} else {
  // don't know what to do
  $result = new stdClass();
  $result->message = "don't know what to do";
  $result->success = false;
  echo json_encode($result);
}
/***********************************************************************************/
/**
 * Get the data of a specific day
 * PHP parameters needed: day, month and year
 * @param $params
 * @return string
 */
function getDataByDay($params)
{
  if (!isset($params->day) || !isset($params->month) || !isset($params->year)) {
    return createError("Invalid parameters");
  }
  $config = Configuration::get();

  $sql = sprintf("SELECT *, AVG(temperature) as temperatureAvg, MAX(temperature) as temperatureMax, MIN(temperature)
                  as temperatureMin, AVG(humidity) as humidityAfg, AVG(wind) as windAfg, MAX(wind) as windMax,
                  MIN(wind) as windmin FROM `%s` WHERE DAY(ts) = %u and MONTH(ts) = %u and YEAR(ts) = %u GROUP BY HOUR(ts)",
    $config->mysqlTableWeather,
    $params->day,
    $params->month,
    $params->year);

  return runSqlQuery($sql);
}

/**
 * Creates an error object
 * @message string with the message of the error
 * @return stdClass
 */
function createError($message)
{
  $result = new stdClass();
  $result->success = false;
  $result->message = $message;
  return $result;
}

/**
 * Runs an MySQL Query
 * @param $sql     string
 * @return \result  object
 */
function runSqlQuery($sql)
{

  $config = Configuration::get();
  $result = new stdClass();

  $mysqli = new mysqli($config->mysqlServer, $config->mysqlUser,
    $config->mysqlPass, $config->mysqlDb);

  if ($mysqli->connect_errno) {
    return createError("Connect failed: " . $mysqli->connect_error);
  }

  $res = $mysqli->query($sql);
  if (!$res) {
    return createError("Query Error: " . $mysqli->error);
  }

  $result->success = true;
  $result->data = [];
  $i = 0;
  while ($row = $res->fetch_object()) {
    $result->data[$i] = $row;
    $i++;
  }
  $mysqli->close();
  return $result;
}

?>