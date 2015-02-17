A node for node-red that generates events based on the location of the Sun at the appropriate time of day. 
Outputs an object called <b>msg</b> containing the event name in <b>msg.topic</b> and
the event date & time in the <b>msg.payload</b>. msg.payload is a String.

Calculations are performed using the excellent SunCalc module (https://github.com/mourner/suncalc) 
and the following sun events are output from this node:
* sunrise: sunrise (top edge of the sun appears on the horizon)</li>
* sunriseEnd: sunrise ends (bottom edge of the sun touches the horizon)</li>
* goldenHourEnd: morning golden hour (soft light, best time for photography) ends</li>
* solarNoon: solar noon (sun is in the highest position)</li>
* goldenHour: evening golden hour starts</li>
* sunsetStart: sunset starts (bottom edge of the sun touches the horizon)</li>
* sunset: sunset (sun disappears below the horizon, evening civil twilight starts)</li>
* dusk: dusk (evening nautical twilight starts)</li>
* nauticalDusk: nautical dusk (evening astronomical twilight starts)</li>
* night: night starts (dark enough for astronomical observations)</li>
* nightEnd: night ends (morning astronomical twilight starts)</li>
* nauticalDawn: nautical dawn (morning nautical twilight starts)</li>
* dawn: dawn (morning nautical twilight ends, morning civil twilight starts)</li>
* nadir: nadir (darkest moment of the night, sun is in the lowest position)</li>
