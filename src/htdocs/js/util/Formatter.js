'use strict';

var _iso8601;


_iso8601 = function (date) {
  var day,
      hour,
      minute,
      month,
      second,
      year;

  year = date.getUTCFullYear();
  month = date.getUTCMonth();
  day = date.getUTCDate();

  hour = date.getUTCHours();
  minute = date.getUTCMinutes();
  second = date.getUTCSeconds();

  month += 1; // months are zero-indexed

  if (month < 10) {
    month = '0' + month;
  }

  if (day < 10) {
    day = '0' + day;
  }

  if (hour < 10) {
    hour = '0' + hour;
  }

  if (minute < 10) {
    minute = '0' + minute;
  }

  if (second < 10) {
    second = '0' + second;
  }

  return year + '-' + month + '-' + day + 'T' +
      hour + ':' + minute + ':' + second + 'Z';
};


module.exports = {
  iso8601: _iso8601
};
