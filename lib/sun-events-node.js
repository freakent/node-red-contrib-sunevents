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
 * node-red-contrib-sunevents
 * A node for node-red that generates events based on the location of the Sun 
 * at the appropriate time of day. 
 *
 * **/
const SunEvents = require('./sun-events');

module.exports = function(RED) {

	// The main node definition - most things happen in here
	function SunEventsNode(config) {

    	// Create a RED node
    	RED.nodes.createNode(this, config);

		let node = this;

    	// Store local copies of the node configuration (as defined in the .html)
    	node.testmode = config.testmode || false
		node.enable_debug =  config.verbose || false
    	node.name = config.name
    	node.topic = config.topic

		node.sunevents = new SunEvents(this, config)

		node.on('input', function(msg) {

			node.context().set("msg", msg)

			let lat = msg.payload["lat"] || msg.payload["latitude"] || (node.credentials ? node.credentials.latitude : null)
			let lng = msg.payload["lng"] || msg.payload["longitude"] || (node.credentials ? node.credentials.longitude : null)

			if ( !(lat && lng) ) {
				node.error("No latitude & longitude in payload, please refer to documentation.")
				node.status({ fill: 'red', shape: 'dot', text: "no latitude & longitude"})
				return
			}
			node.warn(`calculating sunevents for lat ${lat} and lng ${lng}`)
			node.sunevents.refresh(lat, lng)			
			node.update_status()
		})
		
		node.sunevent = function(event_name, datetime) {
			//node.log(util.format("[sunevents] Firing event %s for %s", event_name, datetime));

			let msg = Object.assign({ payload: null}, node.context().get("msg"))
			
			if (node.topic) {
				msg.topic = node.topic 
			}

			//console.log("Event data", msg.payload, event_name, datetime)

			if (typeof msg.payload != 'object') { 
				let payload = msg.payload
				msg.payload = { value: payload }
			}

			msg.payload.sunevent = event_name
			msg.sunevent = { name: event_name, datetime: datetime }

			node.update_status()

			node.send(msg)
		}
    	
    
		// Called when the node is shutdown - eg on redeploy.
		// Allows ports to be closed, connections dropped etc.
		// eg: this.client.disconnect();
		node.on("close", function() {
			node.sunevents.clear_all()
		})


		node.update_status = function() {
			if (node.sunevents.next_event) {
				node.status({ fill: 'green', shape: 'dot', text: `next: ${node.sunevents.next_event.event_name}`})
			} else {
				node.status({ fill: 'red', shape: 'dot', text: `no events scheduled`})
			}
	
		}

		// Initialise the status (after we have actually defined the function!)
		node.update_status()


	}

	// Register the node by name. This must be called before overriding any of the
	// Node functions.
	
	RED.nodes.registerType("sun events", SunEventsNode, {
		credentials: { 
			latitude: { type: "text" },
			longitude: { type: "text" }
		}
	});

} 