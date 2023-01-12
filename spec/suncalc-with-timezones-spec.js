/**
 * Copyright 2013-2023 Freak Enterprises
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * node-red-contrib-sunevents 
 * This module provides a thin event emitting wrapper around the excellent SunCalc Module. 
 **/

const timezone_mock = require('timezone-mock');
const suncalc = require('suncalc')
const {DateTime} = require('luxon')

var assert = require('assert');

describe('suncalc', function () {
  describe('times with timezones', function () {
    it('should return dawn and dusk at the correct time', function () {
      timezone_mock.register('US/Pacific')
      date = DateTime.fromISO('2020-02-28T10:00:00-08:00')
      times = suncalc.getTimes(date.toJSDate(), 37.53, -122.26) // San Francisco
      expect(times["dawn"]).toBeDefined()
      expect(times["dusk"]).toBeDefined()
      //console.log(date.toISO(), "Dawn:", times.dawn.toISOString(), "Dusk:", times.dusk.toISOString())
      expect(times.dawn.toISOString()).withContext(`Dawn for ${date.toISO()}`).toEqual('2020-02-28T14:17:33.015Z')
      expect(times.dusk.toISOString()).withContext(`Dusk for ${date.toISO()}`).toEqual('2020-02-29T02:28:42.628Z')
      timezone_mock.unregister()
    });

   it('should return dawn and dusk for each hour Today', function () {
      timezone_mock.register('US/Pacific')
      let startdate = DateTime.fromISO('2020-02-28T00:30:00-08:00')
      for (let i = 0; i < 24; i++) {
        let date = startdate.plus({hours: i})
        let times = suncalc.getTimes(date.toJSDate(), 37.53, -122.26)
        //console.log("hour", i, date.format(), "Dawn:", dawn.format(), dawn.calendar(), "Dusk:", dusk.format(), dusk.calendar())
        //console.log(date.toISO(), "Dawn:", times.dawn.toISOString(), "Dusk:", times.dusk.toISOString())
        expect(times.dawn.toISOString()).toEqual('2020-02-28T14:17:33.015Z')
      }
      timezone_mock.unregister()

    });

    it('should return dawn and dusk based on mid day for each hour Today', function () {
      timezone_mock.register('US/Pacific')
      let startdate = DateTime.fromISO('2020-02-28T00:30:00-08:00')
      for (let i = 0; i < 24; i++) {
        let date = startdate.plus({hours: i})
        let midday = startdate.set({hour:12, minute:0, second:0 })
        let times = suncalc.getTimes(midday.toJSDate(), 37.53, -122.26)
        //console.log("hour", i, date.format(), midday.format(), "Dawn:", dawn.format(), dawn.calendar(), "Dusk:", dusk.format(), dusk.calendar())
        expect(times.dawn.toISOString()).toEqual('2020-02-28T14:17:33.015Z')
      }
      timezone_mock.unregister()

    });

  });
});