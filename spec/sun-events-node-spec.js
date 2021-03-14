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
 *
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
        helper.unload().then(function() {
            helper.stopServer(done);
        })
    });

    it('should be loaded', function (done) {
        let flow = [{ id: "n1", type: "sun events", name: "test name" }]
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
        var flow = [{ id: "n1", type: "sun events", name: "test name", wires: [["n2"]] }, { id: "n2", type: "helper" }];
        helper.load(SunEventsNode, flow, function () {
            var n1 = helper.getNode("n1");
            var n2 = helper.getNode("n2");
            n2.on("input", function (msg) {
                try {
                    expect(msg.payload.latitude).toEqual(test_lat)
                    expect(msg.payload.longitude).toEqual(test_lng)
                    expect(events.includes(msg.payload.sunevent)).toBeTrue()
                    done();    
                } catch(err) {
                    done(err)
                }
            });
            n1.receive({ payload: {latitude: test_lat, longitude: test_lng }});
            jasmine.clock().tick(1000 * 60 * 60 * 24)
        });
    });

    it('should initialise a set of sun events with lat and lng as strings', function (done) {
        const test_lat_str = "51.501364"
        const test_lng_str = "-0.1440787"
        const flow = [{ id: "n1", type: "sun events", name: "test name", wires: [["n2"]] }, { id: "n2", type: "helper" }];
        helper.load(SunEventsNode, flow, function () {
            let n2 = helper.getNode("n2");
            let n1 = helper.getNode("n1");
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

    it('should use lat and long from node configuration if none supplied in msg.payload, payload contains a date', function(done) {
        const test_credentials = { "n1": {'latitude': "51.501364", 'longitude': '-0.1440787' } }
        const flow = [{ id: "n1", type: "sun events", name: "test name", wires: [["n2"]] }, { id: "n2", type: "helper" }];
        helper.load(SunEventsNode, flow, test_credentials, function () {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");
            expect(n2).toEqual(jasmine.objectContaining({ type: 'helper' })) // Don't forget to pass "done" into the it function !!!
            n2.on("input", function (msg) {
                try {
                    expect(msg.payload.lat).toEqual(test_credentials.latitude, "should match latitude")
                    expect(msg.payload.lng).toEqual(test_credentials.longitude)
                    expect(events.includes(msg.payload.sunevent)).toBeTrue(`sunevent ${msg.payload.sunevent} is not known`)
                    done();    
                } catch(err) {
                    done(err)
                }
            });
            spyOn(n1, "error")
            //n1.receive({ payload: {lat: test_credentials.latitude, lng: test_credentials.longitude }});
            n1.receive({ payload: new Date() }) 
            expect(n1.error).not.toHaveBeenCalled()
            jasmine.clock().tick(1000 * 60 * 60 * 24)
        });

    })

    it('should use lat and long from node configuration if none supplied in msg.payload, payload contains a string', function(done) {
        const test_credentials = { "n1": {'latitude': "51.501364", 'longitude': '-0.1440787' } }
        const flow = [{ id: "n1", type: "sun events", name: "test name", wires: [["n2"]] }, { id: "n2", type: "helper" }];
        helper.load(SunEventsNode, flow, test_credentials, function () {
            let n1 = helper.getNode("n1");
            let n2 = helper.getNode("n2");
            expect(n2).toEqual(jasmine.objectContaining({ type: 'helper' })) // Don't forget to pass "done" into the it function !!!
            n2.on("input", function (msg) {
                try {
                    expect(msg.payload.lat).toEqual(test_credentials.latitude, "should match latitude")
                    expect(msg.payload.lng).toEqual(test_credentials.longitude, "should match longitude")
                    expect(events.includes(msg.payload.sunevent)).toBeTrue(`sunevent ${msg.payload.sunevent} is not known`)
                    done();    
                } catch(err) {
                    done(err)
                }
            });
            spyOn(n1, "error")
            //n1.receive({ payload: {lat: test_credentials.latitude, lng: test_credentials.longitude }});
            n1.receive({ payload: 'some random string' })
            expect(n1.error).not.toHaveBeenCalled()
            jasmine.clock().tick(1000 * 60 * 60 * 24)
        });

    })

});