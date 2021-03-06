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
namespace qwesta;
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once("configuration.php");

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Sat, 24 May 1997 23:00:00 GMT');
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
// Read params
extract($_REQUEST);
$arr = get_defined_vars();
$params = new \stdClass(); // avoids PHP warning
$params->view = "none";

if (is_array($arr)) {
  foreach ($arr as $pkey => $post) {
    $params->$pkey = $post;
  }
}

if ($params->view == "multi") {
  // Get the data of a range
  echo json_encode(getData($params));
} else if ($params->view == "current") {
  // get the current data
  echo json_encode(getCurrentDataSet());
} else if ($params->view == "basics") {
  // Return basics information about qwesta (earliest entry, latest entry, and so on)
  echo json_encode(getBasics());
} else if ($params->view == "diagnostics") {
  // Return diagnostic data
  echo json_encode(getDiagnostics($params));
} else if ($params->view == "extreme") {
  // Return extreme data
  echo json_encode(getExtremeValues());
} else if ($params->view == "24h") {
  // Return last 24 hours
  echo json_encode(getLastHours(24));
} else {
  // don't know what to do
  $result = new \stdClass();
  $result->message = "don't know what to do";
  $result->success = false;
  echo json_encode($result);
}
/***********************************************************************************/
/**
 * Get the data of a specific time range
 * PHP parameters needed: day, month and year
 * @param $params
 * @return string
 */
function getData($params)
{
  if (!isset($params->day) || !isset($params->month) || !isset($params->year)) {
    return createError("Invalid parameters (day/month/year)");
  }
  if (!isset($params->range)) {
    return createError("No range defined");
  }

  $query = "";
  if (isset($params->temperature)) {
    $query .= "AVG(temperature) AS temperatureAvg, MAX(temperature) AS temperatureMax, MIN(temperature) AS temperatureMin";
  }
  if (isset($params->humidity)) {
    if (strlen($query) > 0) {
      $query .= ", ";
    }
    $query .= "AVG(humidity) AS humidityAvg, MAX(humidity) AS humidityMax, MIN(humidity) AS humidityMin";
  }
  if (isset($params->wind)) {
    if (strlen($query) > 0) {
      $query .= ", ";
    }
    $query .= "AVG(wind) AS windAvg, MAX(wind) AS windMax, MIN(wind) AS windMin";
  }
  if (isset($params->rain)) {
    if (strlen($query) > 0) {
      $query .= ", ";
    }
    $query .= "israining, rain, SUM(raindifference) as rainDiff";
  }

  if (strlen($query) == 0) {
    $query = "ts";
  }
  $config = Configuration::get();
  $utcOffset = Configuration::getUtcOffset($params->year, $params->month, $params->day);

  $range = "";
  $group = "";

  if ($params->range == "day") {
    $range = sprintf("DATE(CONVERT_TZ(ts, '+00:00', '%s')) = '%u-%u-%u'",
      $utcOffset,
      $params->year,
      $params->month,
      $params->day);

    $group = "GROUP BY HOUR(tsLocal)";
  } else if ($params->range == "week") {
    $range = sprintf("DATE(CONVERT_TZ(ts, '+00:00', '%s')) >= '%u-%u-%u' AND
    DATE(CONVERT_TZ(ts, '+00:00', '%s')) < DATE_ADD('%02d-%02d-%02d 00:00:00', INTERVAL 1 WEEK) ",
      $utcOffset,
      $params->year,
      $params->month,
      $params->day,
      $utcOffset,
      $params->year,
      $params->month,
      $params->day);
    $group = "GROUP BY DAY(tsLocal), HOUR(tsLocal)";
  } else if ($params->range == "month") {
    $range = sprintf("DATE(CONVERT_TZ(ts, '+00:00', '%s')) >= '%u-%u-%u' AND
    DATE(CONVERT_TZ(ts, '+00:00', '%s')) < DATE_ADD('%02d-%02d-%02d 00:00:00', INTERVAL 32 DAY) ",
      $utcOffset,
      $params->year,
      $params->month,
      $params->day,
      $utcOffset,
      $params->year,
      $params->month,
      $params->day);
    $group = "GROUP BY DAY(tsLocal)";
  } else if ($params->range == "year") {
    $range = sprintf("DATE(CONVERT_TZ(ts, '+00:00', '%s')) >= '%u-%u-%u' AND
    DATE(CONVERT_TZ(ts, '+00:00', '%s')) < DATE_ADD('%02d-%02d-%02d 00:00:00', INTERVAL 1 YEAR) ",
      $utcOffset,
      $params->year,
      $params->month,
      $params->day,
      $utcOffset,
      $params->year,
      $params->month,
      $params->day);
    $group = "GROUP BY WEEKOFYEAR(tsLocal)";
  } else {
    $range = 'noRange';
    $group = 'noGroup';
  }

  $sql = sprintf("SELECT CONVERT_TZ(ts, '+00:00', '%s') as tsLocal, COUNT(*) AS nbRows, ts, " . $query . " FROM %s WHERE
                  %s %s ORDER BY ts ASC",
    $utcOffset,
    $config->mysqlTableWeather,
    $range,
    $group
  );

  return runSqlQuery($sql);
}

/**
 * Returns some diagnostics data (how many measurements per day)
 * @param $params
 * @return \object
 */
function getDiagnostics($params)
{
  $config = Configuration::get();
  if (!isset($params->year)) {
    $params->year = 2015;
  }
  $utcOffset = Configuration::getUtcOffset($params->year, $params->month, 1);

  $sql = sprintf("SELECT COUNT(*) AS nbrows, CONVERT_TZ(ts, '+00:00', '%s') AS tsLocal FROM %s
                  WHERE MONTH(ts) = %u && YEAR(ts) = %u GROUP BY DAY(tslocal)",
    $utcOffset,
    $config->mysqlTableWeather,
    $params->month,
    $params->year);
  return runSqlQuery($sql);
}

/**
 * Returns the extreme values
 */
function getExtremeValues()
{
  $config = Configuration::get();
  $info = new \stdClass();
  $sql = sprintf("SELECT COUNT(*) AS entryNb,  MIN(ts) AS oldestEntryTs, MAX(ts) AS newestEntryTs FROM %s WHERE 1",
    $config->mysqlTableWeather);
  $info->info = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, SUM(raindifference) AS val FROM %s WHERE 1  GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val DESC LIMIT 5",
    $config->mysqlTableWeather);
  $info->rMax = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, MAX(temperature) AS val FROM %s WHERE 1  GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val DESC LIMIT 5",
    $config->mysqlTableWeather);
  $info->tMax = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, AVG(temperature) AS val FROM %s WHERE 1  GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val DESC LIMIT 5",
    $config->mysqlTableWeather);
  $info->tAvgMax = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, MIN(temperature) AS val FROM %s WHERE 1  GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val ASC LIMIT 5",
    $config->mysqlTableWeather);
  $info->tMin = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, AVG(temperature) AS val FROM %s WHERE 1  GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val ASC LIMIT 5",
    $config->mysqlTableWeather);
  $info->tAvgMin = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, temperature, MAX(humidity) AS val FROM %s WHERE 1 GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val DESC LIMIT 5",
    $config->mysqlTableWeather);
  $info->hMax = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, temperature, MIN(humidity) AS val FROM %s WHERE 1 GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val ASC LIMIT 5",
    $config->mysqlTableWeather);
  $info->hMin = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, MAX(wind) AS val FROM %s WHERE 1  GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val DESC LIMIT 5",
    $config->mysqlTableWeather);
  $info->wMax = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, (MAX(temperature) *SIGN(MAX(temperature)) - MIN(temperature) * SIGN(MIN(temperature))) AS val FROM %s WHERE 1  GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val DESC LIMIT 5",
    $config->mysqlTableWeather);
  $info->tDiffMax = runSqlQuery($sql);

  $sql = sprintf("SELECT ts, (MAX(temperature) *SIGN(MAX(temperature)) - MIN(temperature) * SIGN(MIN(temperature))) AS val FROM %s WHERE 1  GROUP BY YEAR(ts), MONTH(ts), DAY(ts) ORDER BY val ASC LIMIT 5",
    $config->mysqlTableWeather);
  $info->tDiffMin = runSqlQuery($sql);

  return $info;
}

/**
 * Get the results of the last n hours
 * @param $hours
 * @return \result
 */
function getLastHours($hours) {
  $config = Configuration::get();
  $utcOffset = Configuration::getUtcOffset(date('Y'), date('m'), date('G'));

  $sql = sprintf("SELECT CONVERT_TZ(ts, '+00:00', '%s') as tsLocal, COUNT(*) AS nbRows, ts, AVG(temperature) AS temperatureAvg, MAX(temperature) AS temperatureMax, MIN(temperature) AS temperatureMin FROM %s WHERE ts > DATE_SUB(NOW(), INTERVAL %d HOUR) GROUP BY DAY(ts), HOUR(ts) ORDER BY ts ASC",
    $utcOffset,
    $config->mysqlTableWeather,
    $hours
    );
  return runSqlQuery($sql);
}
/**
 * Returns the last data set recorded
 * @return \object
 */
function getCurrentDataSet()
{
  $config = Configuration::get();
  $sql = sprintf("SELECT * FROM %s ORDER BY ts DESC LIMIT 1", $config->mysqlTableWeather);
  $result = runSqlQuery($sql);

  $date = getdate();
  $config = Configuration::get();
  $utcOffset = Configuration::getUtcOffset($date['year'], $date['mon'], $date['mday']);
  $timestamp = time();

  $range = sprintf("DATE(CONVERT_TZ(ts, '+00:00', '%s')) > DATE_SUB('%02d-%02d-%02d %02d:%02d:%02d', INTERVAL 10 HOUR) ",
    $utcOffset,
    $date['year'],
    $date['mon'],
    $date['mday'],
    $date['hours'],
    $date['minutes'],
    $date['seconds']
  );


  // For the rain, get the sum of the last few entries
  $sql = sprintf("SELECT SUM(raindifference) AS rd FROM %s WHERE TIMESTAMPDIFF(HOUR,ts,NOW()) < 2 ORDER BY ts DESC LIMIT 10",
    $config->mysqlTableWeather);

  $rain = runSqlQuery($sql);

  $result->data[0]->raindifference = $rain->data[0]->rd;

  return $result;

}

/**
 * Returns the basic information about the weather station
 * @return \object
 */
function getBasics()
{
  $config = Configuration::get();
  $result = new \stdClass();
  $result->success = true;

  $sql = sprintf("SELECT ts FROM %s ORDER BY ts DESC LIMIT 1", $config->mysqlTableWeather);
  $latest = runSqlQuery($sql);
  $result->latest = $latest->data[0]->ts;

  $sql = sprintf("SELECT ts FROM %s ORDER BY ts ASC LIMIT 1", $config->mysqlTableWeather);
  $oldest = runSqlQuery($sql);
  $result->oldest = $oldest->data[0]->ts;

  return $result;
}

/**
 * Creates an error object
 * @message string with the message of the error
 * @return stdClass
 */
function createError($message)
{
  $result = new \stdClass();
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
  $result = new \stdClass();

  $mysqli = new \mysqli($config->mysqlServer, $config->mysqlUser,
    $config->mysqlPass, $config->mysqlDb);

  if ($mysqli->connect_errno) {
    return createError("Connect failed: " . $mysqli->connect_error);
  }

  $res = $mysqli->query($sql);
  if (!$res) {
    return createError("Query Error: " . $mysqli->error . "<br>Complete SQL String:" . $sql);
  }

  $result->success = true;
  $result->data = [];
  $i = 0;
  while ($row = $res->fetch_object()) {
    $result->data[$i] = $row;
    $i++;
  }
  // DEBUG ONLY: $result->sql = $sql;
  $mysqli->close();
  return $result;
}

?>
