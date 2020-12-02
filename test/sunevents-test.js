const timezone_mock = require('timezone-mock');
const SunEvents = require('../lib/sunevents');
const util = require('util');
const moment = require('moment')

var assert = require('assert');

describe('sunevents', function() {
  describe('times with timezones', function() {
    it('should return nadir for Today', function() {
      timezone_mock.register('US/Pacific')
      date = new Date('2020-11-30T06:00:00-08:00')
      sunevent = new SunEvents(37.53, -122.26, {"debug": true, "testMode": true})
      times = sunevent.getTimes(date, date)
      nadir = moment(times.nadir)
      assert.equal(nadir.calendar(date), 'Today at 11:59 PM')
      timezone_mock.unregister()
    });
  });
});
