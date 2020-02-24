# node-red-contrib-sunevent 
A node for node-red that generates events based on the location of the Sun at the appropriate time of day. 

Outputs an object called <b>msg</b> containing the event name in <b>msg.payload</b> and
the event date & time in <b>msg.datetime</b>. The <b>msg.topic</b> can be set in the node's configuration 
or it will default to the node name or "sun events".

Calculations are performed using the excellent SunCalc module (https://github.com/mourner/suncalc) 
and the following sun events are output from this node:
* sunrise: sunrise (top edge of the sun appears on the horizon)
* sunriseEnd: sunrise ends (bottom edge of the sun touches the horizon)
* goldenHourEnd: morning golden hour (soft light, best time for photography) ends
* solarNoon: solar noon (sun is in the highest position)
* goldenHour: evening golden hour starts
* sunsetStart: sunset starts (bottom edge of the sun touches the horizon)
* sunset: sunset (sun disappears below the horizon, evening civil twilight starts)
* dusk: dusk (evening nautical twilight starts)
* nauticalDusk: nautical dusk (evening astronomical twilight starts)
* night: night starts (dark enough for astronomical observations)
* nightEnd: night ends (morning astronomical twilight starts)
* nauticalDawn: nautical dawn (morning nautical twilight starts)
* dawn: dawn (morning nautical twilight ends, morning civil twilight starts)
* nadir: nadir (darkest moment of the night, sun is in the lowest position)

## History
Version|Date|Description
-------|----|-----------
2.0.0|24/02/2020|Updated to run on node-red 1.0.3 and node.js 12.11
0.5  |2/3/2015|Original released version


