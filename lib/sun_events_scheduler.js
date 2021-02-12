/**
 * Copyright 2013-2020 Freak Enterprises
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

const cronjob = require('cron').CronJob;
const SunEvents = require('./sun_events');

class SunEventsScheduler {

    constructor(modes) {
        this.cronjob = null;
        this.sunevents = new SunEvents(modes)
    }

    start() {
        this.debug("Calculate today's remaining sunevents");
        this.sunevents.setTimers(new Date(), lst, lng);

        this.cronjob = new cronjob({
            context: this,
            cronTime: "00 00 00 * * *",
            onTick: function () {
                this.setTimers(new moment())
            },
            start: true
        });
        this.cronjob.start();
        this.debug("Started job to calculate sunevents for tomorrow onwards", this.cronjob.nextDates().toJSON());
    }

    setTimers(date, lat, lng, ) {
        let now = new moment()
        let midDay = moment(date).startOf('day').add(12, 'hours')
        //this.timers = []
        
        if (this.testMode) {
            this.debug('****** Test Mode ******')
        }
        this.debug("Calculating times for %s", midDay)
        
        let times = SunCalc.getTimes(midDay, this.lat, this.lng)                

        this.debug("Times are", util.inspect(times))

        let self = this

        for (let [event, datetime] of Object.entries(times)
            .map( ([k,v]) => [k, moment(v)]) // wrap each datetime value in moment
            .sort( (a, b) => a[1].diff(b[1]) ) // Sort the sunevents into time order to make debugging easier
            ) {
            let millis = datetime.diff(now)
            let hrs = datetime.diff(now, "hours") // Just used in ignore debug message

            if(datetime.isAfter(now)) {
                this.debug("Emitting %s, %s %s in %d hours", datetime.format(), event, datetime.calendar(), hrs);
                let timeout = setTimeout((function (e, dt) {
                    return function () {
                        //console.log("Firing %s in a closure", event);
                        self.emit("sunevent", e, dt);
                        self.emit(e, dt);
                    }
                })(event, datetime), (this.testMode ? millis / (60 * 60) : millis));
                this.timers.push(timeout);
            } else {
                this.debug("Ignoring %s, %s was %s, %d hours ago", datetime.format(), event, datetime.calendar(), hrs);
            }
        }
    }

    stop() {
        this.debug("Cancelling job to calculate sunevents and " + this.timers.length + " timeouts.");
        this.cronjob.stop();
        this.timers.forEach( (t) => clearTimeout(t) )
        this.timers = [];
    }


    debug() {
        let args = Array.prototype.slice.call(arguments);
        if (this.debugMode) {
            var str = "[sunevents] " + util.format.apply(this, arguments);
            this.emit("debug", str);
        }
    }




}



module.exports = SunEvents