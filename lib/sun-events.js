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
 *  - Luxon (http://moment.github.io./luxon)
 *  - uuid
 **/

const SunCalc = require('suncalc')
const { DateTime } = require('luxon')
const {v4: uuidv4 } = require('uuid')

class SunEvents {

    constructor(proxy) {
        //   super();
        this._events = []
        this._proxy = proxy

    }

    refresh(lat, lng, date) {

        this.clear_all()

        let start = date ? DateTime.fromJSDate(date) :  DateTime.local()

        //console.log("start", start.toISO())

        for (let x=0; x < 2; x++) {
            let times = SunCalc.getTimes(start.plus({ days: x}), lat, lng)

//            console.log('times', times)

            let arr = Object.entries(times)
              .map( ([k,v]) => [k, DateTime.fromJSDate(v)]) // wrap each event time value in DateTime
              .sort( (a, b) => a[1].diff(b[1]) ) // Sort the sunevents into time order to make debugging easier
            
            for (let [event_name, dt] of arr) { 
                // console.log('checking', event_name, dt.diff(start).as('hours'))
                if (dt > start ) { // if the event is in the future
                    this.add(start, event_name, dt)
                }
            }

        }
    }


    fireEvent(self, uuid, name, dt) {
        //console.log('proxy', self._proxy )
        let index = self._events.findIndex( e => e.uuid == uuid)
         if (index > -1) {
            self._events.splice(index, 1)
         }
         self._proxy.event(name, dt.toJSDate())
    }

    add(start, event_name, dt) {
        //console.log("Add event", event_name, dt.toISO())
        let uuid = uuidv4()
        let timer = dt.diff(start).as('milliseconds')
        let timeout = setTimeout(this.fireEvent, timer, this, uuid, event_name, dt)
        this._events.push( {uuid, event_name, datetime: dt, timer, timeout} )
    }

    clear_all() {
        this._events.forEach( e => {
            clearTimeout(e.timeout)
        })
        this._events = []
    }



}

module.exports = SunEvents