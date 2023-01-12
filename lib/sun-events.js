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
 *  node-red-contrib-sunevents
 *  A node for node-red that generates events based on the location of the Sun 
 *  at the appropriate time of day. 
 *
 **/
const debug = require('debug')('sun-events')
const SunCalc = require('suncalc')
const { DateTime, Duration } = require('luxon')
const {v4: uuidv4 } = require('uuid')

class SunEvents {

    constructor(proxy, options = {}) {
        this._events = []
        this._proxy = proxy
        this._options = options

        debug("Options", this._options)
    }

    refresh(lat, lng, date) {
        let start = date ? DateTime.fromJSDate(date) :  DateTime.local()

        this.clear_all()

        if (this.testmode) {
            debug("*********** T E S T   M O D E *********")
        }

        debug(`Refreshing Sun Events for ${lat}, ${lng} on ${start.toISO()}`)

        //console.log("start", start.toISO())

        for (let x=-1; x < 2; x++) {   // Calculate 3 days worth of sunevents
            let times = SunCalc.getTimes(start.plus({ days: x}), lat, lng)

//            console.log('times', times)

            let arr = Object.entries(times)
              .map( ([k,v]) => [k, DateTime.fromJSDate(v)]) // wrap each event time value in DateTime
              .sort( (a, b) => a[1].diff(b[1]) ) // Sort the sunevents into time order to make debugging easier
            
            for (let [event_name, dt] of arr) { 
                //console.log('checking', event_name, dt.diff(start).as('hours'))
                if (dt > start ) { // if the event is in the future
                    this.add_future_event(start, event_name, dt)
                } else {
                    this.add_missed_event(event_name, dt)
                }
            }
        }

        this._missed_events.reverse() // Newest missed events first
        let last_event = this._missed_events[0].event_name
        let next_matching_event_index = this._missed_events.slice(1).findIndex( e => e.event_name == last_event)
        this._missed_events.splice(next_matching_event_index, Infinity)

        debug(`Initialised ${this._events.length} Sun events for ${lat}, ${lng} on ${start.toISO()}`)
        debug('Events:', this.toString())
        debug('Missed events:', this._missed_events)
    }


    _fireEvent(self, uuid, name, dt) {
        debug(`Event ${name} occurred at ${dt.toISO()}`)
        let index = self._events.findIndex( e => e.uuid == uuid)
         if (index > -1) {
            self._events.splice(index, 1)
         }
         self._proxy.sunevent(name, dt.toJSDate())
    }

    add_future_event(start, event_name, dt) {
        //console.log("Add event", event_name, dt.toISO())
        let uuid = uuidv4()
        let timer = dt.diff(start).as('milliseconds') / (this.testmode ? 60 : 1)
        let timeout = setTimeout(this._fireEvent, timer, this, uuid, event_name, dt)
        this._events.push( {uuid, event_name, datetime: dt, timer, timeout} )
    }
    
    add_missed_event(event_name, dt) {
        //console.log("Add missed event", event_name, dt.toISO())
        this._missed_events.push( {event_name, datetime: dt.toJSDate()} )
    }
    
    clear_all() {
        debug(`Clearing all ${this._events.length} Sun events`)
        this._events.forEach( e => {
            clearTimeout(e.timeout)
        })
        this._events = []
        this._missed_events = []
    }

    get next_event() {
        if ( this._events.length > 0) {
            let e = this._events[0]
            return { event_name: e.event_name, datetime: e.datetime.toISO() }
        } else {
            return null
        }
    }

    get testmode() {
        return this._options["testmode"] || false
    }

    toString() {
        return this._events.map( e => { return { id: e.uuid, name: e.event_name, datetime: e.datetime.toISO(), from_now: Duration.fromMillis(e.timer).toFormat("h 'hours', m 'mins'")} })
    }

}

module.exports = SunEvents