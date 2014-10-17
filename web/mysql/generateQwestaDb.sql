-- phpMyAdmin SQL Dump
-- version 4.2.3
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 17. Okt 2014 um 21:18
-- Server Version: 5.5.39
-- PHP-Version: 5.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `usr_web200_6`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `qwesta`
--

CREATE TABLE IF NOT EXISTS `qwesta` (
`pkey` int(11) NOT NULL COMMENT 'Primary Key',
  `ts` datetime NOT NULL,
  `temperature` decimal(3,1) NOT NULL,
  `humidity` tinyint(3) unsigned NOT NULL,
  `wind` decimal(4,1) NOT NULL,
  `rain` smallint(6) NOT NULL,
  `israining` tinyint(1) NOT NULL,
  `raindifference` tinyint(1) NOT NULL
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Qwesta weather data' AUTO_INCREMENT=8021 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `qwesta`
--
ALTER TABLE `qwesta`
 ADD PRIMARY KEY (`pkey`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `qwesta`
--
ALTER TABLE `qwesta`
MODIFY `pkey` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',AUTO_INCREMENT=8021;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
