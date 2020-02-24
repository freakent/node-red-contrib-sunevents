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
 *  This module provides a thin event emitting wrapper around the excellent SunCalc Module. 
 *
 *  Module Dependencies
 * 	- SunCalc (https://github.com/mourner/suncalc)
 *  - Moment (http://momentjs.com/)
 *  - Cron 
 **/

var SunCalc = require('suncalc');
var moment = require('moment');
var	util = require('util');
var	EventEmitter = require('events').EventEmitter;
var cronjob = require('cron').CronJob;

function SunEvents(lat, lng, modes) {

	var self = this;
	
	this.suncalc = SunCalc;
	this.lat = lat;
	this.lng = lng;
	this.modes = modes || {};
	
	this.debug = modes.debug || false;
	this.test = modes.test || false;
  
  	this.job = null;
  	this.timers = [];
  
	EventEmitter.call(this);
	
  	this.init = function() {

		debug("Initialising job to calculate sunevents");

    	this.job = new cronjob({
    		cronTime: "00 00 00 * * *", 
    		onTick: function() {  
				setTimers(new Date()) 
			},
    		start: true 
    	});
    
    	this.job.start();
    
		setTimers(new Date());

	}

	function setTimers(date) {
		var now = new Date()
		var endOfDay = moment(date).endOf('day')
		self.timers = []
		if (self.test) {
			debug('****** Test Mode ******')
		}
		debug("Calculating times for %s", endOfDay)
		var times = SunCalc.getTimes(endOfDay, lat, lng)
		
		Object.keys(times).forEach(function(event) {
			var eventMoment = moment(times[event]);
			var millis = eventMoment.diff(now);
			var hrs = eventMoment.diff(now, 'hours');
			if (eventMoment.isAfter(now)) {
				debug("Emitting %s %s in %d hours", event, eventMoment.calendar(), hrs);
				var timeout = setTimeout((function(event, date){
					return function() {
						//console.log("Firing %s in a closure", event);
						self.emit("sunevent", event, date);
						self.emit(event, date);
					}
				})(event, times[event]), (self.test ? millis/60 : millis));
				self.timers.push(timeout);
			} else {
				debug("Ignoring %s, was %s, %d hours ago", event, eventMoment.calendar(), hrs);
			}
		})
		
	}
	
	this.stop = function() {
	  debug("Cancelling job to calculate sunevents and " + self.timers.length + " timeouts.");
	  this.job.stop();
	  Object.keys(self.timers).forEach(function(event) {
		  clearTimeout(self.timers[event])
	  })
	  this.timers = [];
	}
	
	
	function debug() {
	  var args = Array.prototype.slice.call(arguments);
	  if (self.modes.debug) {
		  var str = "[sunevents] " + util.format.apply(this, arguments);
		  self.emit("debug", str);
	  }
	}
					
}


util.inherits(SunEvents, EventEmitter);
module.exports = SunEvents;

/** 



// format sunrise time from the Date object
var sunriseStr = times.sunrise.getHours() + ':' + times.sunrise.getMinutes();

// get position of the sun (azimuth and altitude) at today's sunrise
var sunrisePos = SunCalc.getPosition(times.sunrise, 51.5, -0.1);

// get sunrise azimuth in degrees
var sunriseAzimuth = sunrisePos.azimuth * 180 / Math.PI;
*/