# node-red-contrib-sunevents
A node for node-red that generates events based on the location of the Sun at the appropriate time of day. 

Outputs an object called <b>msg</b> containing the event name in <b>msg.payload</b> and
the event date & time in <b>msg.datetime</b>. The <b>msg.topic</b> can be set in the node's configuration 
or it will default to the node name or "sun events". You will need to configure this node with the latitude and longitude of the location you want the events to operate in. 

Calculations are performed using the excellent SunCalc module (https://github.com/mourner/suncalc) 
and the resulting sun events are output from this node at the appropriate time:
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

This node can be used to make something happen based on a particular period of the day, for example switching on your lights at home at dusk every day.

## How does it work
When you first deploy the node (or start your node-red), this node calculates when each sun event will happen that day and schedules timer events for each sun event that has not already passed.  It then schedules a job to repeat the same calculations for the next day at midnight and so on.  The suncalc library this node depends on calculates all the sun events for the current day, so this node has to be triggered every day at midnight to set up the timers for the following day.  If you enable the "Log event calculations?", you will be able to see all these calculations taking place each day. 

## History
Version|Date|Description
-------|----|-----------
2.0.2|2020-02-28|More debugging and closer attention to anywhere where timezones could cause an issue
2.0.1|2020-02-27|Improved unit testing, example flow
2.0.0|2020-02-24|Updated to run on node-red 1.0.3 and node.js 12.11
0.5  |2015-03-02|Original released version


