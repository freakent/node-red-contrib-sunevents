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
 *  Module Dependencies
 * 	- SunCalc (https://github.com/mourner/suncalc)
 *  - Moment (http://momentjs.com/)
 **/


module.exports = function(RED) {

	const util = require("util");
	const SunEvents = require('./lib/sunevents');
	
	// The main node definition - most things happen in here
	function SunEventsNode(config) {

    	// Create a RED node
    	RED.nodes.createNode(this, config);

		let node = this;
		
    	// Store local copies of the node configuration (as defined in the .html)
    	node.modes = {test: config.testmode, debug: config.verbose}
    	node.name = config.name
    	node.topic = config.topic
    	
    	let credentials = this.credentials
        if ((credentials) && (credentials.hasOwnProperty("latitude")) && (credentials.hasOwnProperty("longitude"))) { 
			node.latitude = credentials.latitude
			node.longitude = credentials.longitude
        } else {
            node.error("No latitude or longitude set.")
        }

    	node.log(util.format("Calculating sun event times for %s, %s.", node.latitude, node.longitude))
    	node.events = new SunEvents(this.latitude, this.longitude, this.modes)
    
    	node.events.on("sunevent", function(event, date) {
    		var msg = {}
    		msg.topic = node.topic || node.name || 'sun events'
    		msg.payload = event
    		msg.datetime = date

			node.log(util.format("Injecting event %s for %s", event, date));
    		// send out the message to the rest of the workspace.
    		node.send(msg);
    	});
    
	    if (node.modes.debug) {
    		node.events.on("debug", function(msg) {
				node.log(msg);
    		});
    	}
    
    	// Add any extra configuration to suncalc here using node.events
    	node.events.start()
    
    	node.on("close", function() {
			// Called when the node is shutdown - eg on redeploy.
			// Allows ports to be closed, connections dropped etc.
			// eg: this.client.disconnect();
			node.events.stop();
		});
	}

	// Register the node by name. This must be called before overriding any of the
	// Node functions.
	
	var credentials = {
        latitude: {type: "text"},
        longitude: {type: "text"}
    }

	RED.nodes.registerType("sun events", SunEventsNode, { credentials: credentials } );

} 