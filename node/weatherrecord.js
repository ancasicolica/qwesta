/**
 * Created by Christian on 22.09.2014.
 */
// Format: $1;1;;;;;;;;;;;;;;;;;;21,1;50;0,0;10;0;0
module.exports = {
  newRecord: function(record) {
    try {
      var rec = record.toString();
      var wr =  new WeatherRecord(rec);
      console.log("New record!");
      currentRecord = wr;
      return wr;
    }
    catch (e) {
      console.error("newRecord exception: " + e);
      return null;
    }
  },

  getCurrentRecord: function() {
    return JSON.stringify(currentRecord);
  }
};

var currentRecord = null;


function WeatherRecord(record)
{
  var elements = record.split(";");
  if ((elements[0] != "$1") || (elements.length != 25)) {
    throw "Malformed record:" + record;
  }
  this.timestamp = new Date();
  this.temperature = elements[19];
  this.humitity = elements[20];
  this.wind = elements[21];
  this.rain = elements[22];  // 1 tick is approx 295 ml/m2
  this.isRaining = (elements[23] == "1");
}

WeatherRecord.prototype.toString = function () {
  return this.timestamp + " T:" + this.temperature + " H:" + this.humitity + "% W:"
    + this.wind + " R:" + this.rain + " iR:" + this.isRaining;
}
/*
 var d = new WeatherRecord("$1;1;;;;;;;;;;;;;;;;;;21,1;50;0,0;10;0;0");
 console.log(d.toString());
 */
