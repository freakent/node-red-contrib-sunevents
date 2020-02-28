const timezone_mock = require('timezone-mock');
const suncalc = require('suncalc')
const moment = require('moment')

var assert = require('assert');

describe('suncalc', function() {
  describe('times with timezones', function() {
    it('should return dawn and dusk at the correct time', function() {
      timezone_mock.register('US/Pacific')
      date = new Date('2020-02-28T06:00:00-08:00')
      times = suncalc.getTimes(date, 37.53, -122.26)
      dawn = moment(times.dawn)
      dusk = moment(times.dusk)
      console.log(moment(date).format(), "Dawn:", dawn.format(), dawn.calendar(), "Dusk:", dusk.format(), dusk.calendar())
      assert.equal(dawn.calendar(), 'Today at 6:17 AM')
      assert.equal(dusk.calendar(), 'Today at 6:28 PM')
      timezone_mock.unregister()
    });

    it('should return dawn and dusk for each hour Today', function() {
        timezone_mock.register('US/Pacific')
        let startdate = new Date('2020-02-28T00:30:00-08:00')
        for (let i = 0; i < 24; i++) {
            let date = moment(startdate).add(i, 'hour')
            let times = suncalc.getTimes(date, 37.53, -122.26)
            let dawn = moment(times.dawn)
            let dusk = moment(times.dusk)
            console.log("hour", i, date.format(), "Dawn:", dawn.format(), dawn.calendar(), "Dusk:", dusk.format(), dusk.calendar())
            assert.equal(dawn.calendar(), 'Today at 6:17 AM', date.format())
        }
        timezone_mock.unregister()

    });

    it('should return dawn and dusk based on mid day for each hour Today', function() {
        timezone_mock.register('US/Pacific')
        let startdate = new Date('2020-02-28T00:30:00-08:00')
        for (let i = 0; i < 24; i++) {
            let date = moment(startdate).add(i, 'hour')
            let midday = date.startOf('day').add(12, 'hours')
            let times = suncalc.getTimes(midday, 37.53, -122.26)
            let dawn = moment(times.dawn)
            let dusk = moment(times.dusk)
            console.log("hour", i, date.format(), midday.format(), "Dawn:", dawn.format(), dawn.calendar(), "Dusk:", dusk.format(), dusk.calendar())
            assert.equal(dawn.calendar(), 'Today at 6:17 AM', date.format())
        }
        timezone_mock.unregister()

    });

  });
});