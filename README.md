# node-red-contrib-sunevents
A node that generates events based on the location of the Sun at the appropriate time of day. This node can be used to make something happen based on a particular period of the day, for example switching on your lights at home at dusk every day or taking a photo a the darkest time of night ("nadir").

On receiving a `msg.payload` containing latitude and longitude coordinates (in decimal), this node outputs a series of Sun event objects at the appropriate time for each. 

Calculations are performed using the excellent [SunCalc module](https://github.com/mourner/suncalc) 
and the resulting Sun events are output from this node at the appropriate time:
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

## Upgrading from v2.x
The latest version (v3.0) of this node works a little differently to previous versions and will 
require a change to your flow if you are upgrading from a previous version.

The latitude and longitude you defined in the node's configuration can be used to calculate 
Sun events if no latitude and longitude coordinates 
are passed in the <i>msg.payload</i>. You <b>must</b> still inject a payload at regular 
intervals to recalculate the next 24 hour's events, but this payload can be any value.


## Usage
Each time this node receives a new `msg.payload` to it's input, it calculates up to 2 days worth of Sun events (depending on what time of day it is invoked). To have the node output events reliably every day, you should inject a latitude and longitude payload into the node at least once every 24 hours. The easiest way to do this is with the node-red Inject node.


### Input
This node requires a latitude and longitude in decimal form to be passed to it in the `msg.payload`, either :

```javascript
msg.payload.latitude = <latitude in decimal format>
msg.payload.longitude = <longitude in decimal format>
```

or

```javascript
msg.payload.lat = <latitude in decimal format>
msg.payload.lng = <longitude in decimal format>
```

Calculations are performed using the Latitude and Longitude that are passed in via the payload. If you have a frequently changing GPS position it will update the Sun event calculations every time it receives a new latitude and longitude in the payload. 


### Output
The Sun event name is output in `msg.payload.sunevent`, preserving any other payload values set earlier in the flow. It also outputs the event name and date & time of the event in `msg.sunevent` object if you need a more complete set of Sun event data. The `msg.topic` can also be set in the node's configuration. 


### Config
- *Name*: Override the default name of this node in the flow

- *Topic*: Set the topic used in the flow from this point onwards

- Options:

  - *Make Hours seem like minutes (test mode)*: 
    Reduces the time you have to wait for an event to fire, 1 hour becomes 1 minute. Obviously the Sun events won't fire at their correct times but if you are testing your flow it means you won't have to wait for hours to see that things are working. 


## Example Flows

Unlike previous versions of this node, this node DOES NOT perform it's own daily scheduling. In keeping with the [general guidance for node-red nodes](https://nodered.org/docs/creating-nodes/#general-guidance) you must now use some other node to invoke the sun-events node at a time and frequency appropriate for your use case. The Inject node supplied with node-red is a good candidate for this and is demonstrated in the supplied example flow. Please note, I show the use of 2 inject nodes, one to invoke the flow on deployment and the other to invoke the flow at a fixed time each day. 

There are two example flows provided, one for a fixed GPS positioned injected daily and one for a stream of GPS coordinates that continually updates with your position.

Example 1: Fixed GPS position [Download](https://raw.githubusercontent.com/freakent/node-red-contrib-sunevents/main/examples/sun-events-example-flows.json)
![Example Flow](https://raw.githubusercontent.com/freakent/node-red-contrib-sunevents/main/docs/flow-diagram-1.png "Example Flow")

Example 2: Stream of GPS positions [Download](https://raw.githubusercontent.com/freakent/node-red-contrib-sunevents/main/examples/sun-events-gps-stream-example-flows.json)
![Example Flow](https://raw.githubusercontent.com/freakent/node-red-contrib-sunevents/main/docs/flow-diagram-2.png "Example Flow")


## [Say Thanks](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=R4Y63PPPD4CGG&source=url)
If you find this node useful and you want to say thanks, feel free to buy me a coffee using the link below. 

[![Say Thanks](https://raw.githubusercontent.com/freakent/node-red-contrib-sunevents/main/docs/thankyou.jpg "Say Thanks")
](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=R4Y63PPPD4CGG&source=url)


## Background
I used the original version of this node in my own set up to turn on house lights at dusk. The whole system ran on a Raspberry Pi we have [hanging on the wall](http://www.freakent.co.uk/blog/2014/02/03/pretty-as-a-pi-cture-raspberry-pi-server-in-a-frame.html). The lights were controlled by a RFXCom RFXTRX433 USB device. Sitting between the Sunevents node and the RFX node is an MQTT persistent topic to hold system state, so if the Raspberry Pi is rebooted at any point during the day the system knows exactly what state it was in before the reboot. This set up ran with very little manual intervention for over 7 years in two different homes. At Christmas time it gets extended to switch on our outdoor Christmas lights too. I have recently switched to Sonoff wifi switches and Alexa is now doing the scheduling. So I have to confess this node is kind of redundant for me at the moment, but I am maintaining it in case it is helpful to others!


## Change History
Version|Date|Description
-------|----|-----------
3.0.2|2021-03-14|Fixed issue when preserving existing  msg.payload value
3.0.1|2021-03-14|Updates to examples and documentation
3.0.0|2021-02-14|Major redesign to improve flexibility and the reliability of output. Drastically improved unit testing
2.0.3|2020-03-03|Updated Readme and docs
2.0.2|2020-02-28|More debugging and closer attention to anywhere where timezones could cause an issue
2.0.1|2020-02-27|Improved unit testing, example flow
2.0.0|2020-02-24|Updated to run on node-red 1.0.3 and node.js 12.11
0.5  |2015-03-02|Original released version



## License
Licensed under the Apache License, Version 2.0 (the "License");
http://www.apache.org/licenses/LICENSE-2.0

