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
 *  This module provides a thin event emitting wrapper around the excellent SunCalc Module. 
 *
 *  Module Dependencies
 *  - node-red (https://nodered.org/)
 * 	- SunCalc (https://github.com/mourner/suncalc)
 *  - Luxon (http://moment.github.io./luxon)
 *  - uuid (https://www.npmjs.com/package/uuid)
 *  - debug (https://www.npmjs.com/package/debug)
 **/
const helper = require("node-red-node-test-helper")
const SunEventsNode = require("../lib/sun-events-node.js")

const test_lat = 37.53
const test_lng =  -122.26
const events = ['sunrise', 'sunriseEnd', 'goldenHourEnd', 'solarNoon', 'goldenHour', 'sunsetStart', 'sunset', 'dusk', 'nauticalDusk', 'night', 'nightEnd', 'nauticalDawn', 'dawn', 'nadir']

describe('sun-events Node', function () {
    beforeEach(function (done) {
        jasmine.clock().install()
        helper.startServer(done);
    });

    afterEach(function (done) {
        jasmine.clock().uninstall()
        helper.unload()
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        let flow = [{ id: "n1", type: "sun-events", name: "test name" }]
        helper.load(SunEventsNode, flow, function () {
            try {
                var n1 = helper.getNode("n1")
                expect(n1).toEqual(jasmine.objectContaining({ name: 'test name' }))
                done()
            } catch (err) {
                done(err)
            }
        });
    });

    it('should initialise a set of sun events', function (done) {
        var flow = [{ id: "n1", type: "sun-events", name: "test name", wires: [["n2"]] },
        { id: "n2", type: "helper" }];
        helper.load(SunEventsNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            n2.on("input", function (msg) {
                try {
                    expect(msg.payload.lat).toEqual(test_lat)
                    expect(msg.payload.lng).toEqual(test_lng)
                    expect(events.includes(msg.payload.sunevent)).toBeTrue()
                    done();    
                } catch(err) {
                    done(err)
                }
            });
            n1.receive({ payload: {lat: test_lat, lng: test_lng }});
            jasmine.clock().tick(1000 * 60 * 60 * 24)
        });
    });

    it('should initialise a set of sun events with lat and lng as strings', function (done) {
        let test_lat_str = "51.501364"
        let test_lng_str = "-0.1440787"
        var flow = [{ id: "n1", type: "sun-events", name: "test name", wires: [["n2"]] },
        { id: "n2", type: "helper" }];
        helper.load(SunEventsNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            n2.on("input", function (msg) {
                try {
                    expect(msg.payload.lat).toEqual(test_lat_str)
                    expect(msg.payload.lng).toEqual(test_lng_str)
                    expect(events.includes(msg.payload.sunevent)).toBeTrue()
                    done();    
                } catch(err) {
                    done(err)
                }
            });
            n1.receive({ payload: {lat: test_lat_str, lng: test_lng_str }});
            jasmine.clock().tick(1000 * 60 * 60 * 24)
        });
    });

});