/**
 * Copyright 2013 Freak Enterprises
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
 *  Module Dependencies
 * 	- SunCalc (https://github.com/mourner/suncalc)
 *  - Moment (http://momentjs.com/)
 **/
var SunEvents = require('../lib/sunevents');
var moment = require('moment');
var util = require('util');

var d = moment(); // Using moment just so to make manipulating dates simpler in tests

console.log("Testing with %s", d.toDate()); // Passing an actual date to SunCalc
var events = new SunEvents(51.865522, -1.371732, {debug: true, test: true});

// Adding a custom event to SunCalc
events.suncalc.addTime(0.1, "breakfast", "sundowner");

// Hopefully every event received should be within a few seconds of the current time,
// when we are not running in 'test' mode.
events.on("sunevent", function(e, dt) {
	console.log("* Event: %s is %s, out by %s", e, moment(dt).calendar(), moment(dt).fromNow(true));
});

events.on("debug", function(msg) {
	console.log(msg);
});

events.start();

console.log("%s events ready to fire", events.timers.length );
//console.log("Cron will fire", events.cronjob.nextDates().toJSON())

setTimeout(function() { 
             events.stop();
             console.log("%s events ready to fire", events.timers.length );
             }, 30000);

