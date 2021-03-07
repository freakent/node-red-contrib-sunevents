/**
 * Copyright 2013-2021 Freak Enterprises
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

const { DateTime } = require('luxon')
const SunEvents = require('../lib/sun-events')

const test_lat = 37.53
const test_lng =  -122.26
const test_date = new Date('2020-02-28T06:00:00-08:00')
const test_event_date = new Date(test_date).setMinutes(test_date.getMinutes() + 30)

describe("Sun Events", function() {

    beforeEach(function() {
        jasmine.clock().install()

        this.proxy = {
            sunevent: jasmine.createSpy('mock') // each tests needs it's own copy of the proxy in order to count the calls correctly
        }
    })

    afterEach(function() {
        jasmine.clock().uninstall()
    })

    it('builds a list of sun event times on a specific date with timeouts for the next 2 days', function() {
        
        let sunevents = new SunEvents(this.proxy)

        //console.log('sunevents', sunevents)
        expect(sunevents._proxy).toBe(this.proxy)

        sunevents.add(DateTime.fromJSDate(test_date), "TEST", DateTime.fromJSDate(test_date).plus({hours: 6}) ) // add a dummy event, refresh should clear this down

        expect(sunevents._events.length).toBe(1)

        sunevents.refresh(test_lat, test_lng, test_date)

        //console.log("events", sunevents._events)

        expect(sunevents._events.length).toBe(25)

        //console.log("Summary", sunevents._events.map( e => { return { name: e.event_name, datetime: e.datetime.toISO(), timer: e.timer/1000} } ))

        expect(sunevents._events.map( e => e.event_name).join(", ")).toBe('dawn, sunrise, sunriseEnd, goldenHourEnd, solarNoon, goldenHour, sunsetStart, sunset, dusk, nauticalDusk, night, nadir, nightEnd, nauticalDawn, dawn, sunrise, sunriseEnd, goldenHourEnd, solarNoon, goldenHour, sunsetStart, sunset, dusk, nauticalDusk, night') 

        jasmine.clock().tick(1000 * 60 * 60 * 24) // Fast forward 24 hrs
        expect(this.proxy.sunevent).toHaveBeenCalledTimes(14) // 14 of the events should have fired
        expect(sunevents._events.length).toBe(11) // Should only have 11 of the 25 left

    })

    
    it('builds a list of sun event times from now with timeouts for the next 2 days', function() {
        
        let sunevents = new SunEvents(this.proxy)

        //console.log('sunevents', sunevents)
        expect(sunevents._proxy).toBe(this.proxy)

        expect(sunevents._events.length).toBe(0)

        sunevents.refresh(test_lat, test_lng)

        //console.log("Events", sunevents._events.map( e => { return { name: e.event_name, datetime: e.datetime.toISO(), timer: e.timer/1000} } ))

        expect(sunevents._events.length).toBeGreaterThan(10)

        jasmine.clock().tick(1000 * 60 * 60 * 48) // Fast forward 48 hrs
        expect(this.proxy.sunevent).toHaveBeenCalled() // 14 of the events should have fired
        expect(sunevents._events.length).toBe(0) // Should only have 11 of the 25 left

    })

    it("removes an event from it's list once it is fired", function() {
        
        let test_start_date = DateTime.local()
        let test_event_date = DateTime.local().plus({ hours: 5})

        let sunevents = new SunEvents(this.proxy)

        //console.log('sunevents', sunevents)

        sunevents.add(test_start_date, "TEST", test_event_date )

        expect(sunevents._events.length).toBe(1)

        jasmine.clock().tick(1000 * 60 * 60 * 6)

        expect(this.proxy.sunevent).toHaveBeenCalledWith( "TEST", test_event_date.toJSDate() )
        expect(sunevents._events.length).toBe(0)

    })

    it("returns the next event due to fire", function() {

        let test_start_date = DateTime.local()
        let test_event_date = DateTime.local().plus({ minutes: 30})

        let sunevents = new SunEvents(this.proxy)

        expect(sunevents.next_event).toBeNull()
        sunevents.add(test_start_date, "TEST", test_event_date)

        expect(sunevents.next_event).toEqual({ event_name: "TEST", datetime: test_event_date.toISO()})

    })

})