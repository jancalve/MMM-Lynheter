/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-Lynheter",{
	data: [],
	loaded: false,

	defaults: {
		text: "Hello World!",
		refreshInterval: 10000,
		lat: 59.826022,
		lon: 10.813373,
		httpRequestURL: 'https://lynheter.no:8443',
		newsWithin: 60 * 60 * 24 * 1000
	},

	getTemplate: function () {
		return "MMM-Lynheter.njk";
	},

	getStyles: function () {
        return ['lynheter.css'];
	},
	
	start: function() {
		Log.info("Starting module: " + this.name);

		this.loaded = false;

		//Log.log("Sending CONFIG to node_helper.js in " + this.name);
		//Log.log("Payload: " + this.config);
		this.sendSocketNotification("CONFIG", this.config);
	},

	// Override dom generator.
	getDom: function() {
		console.log('getDOM()');
		var wrapper = document.createElement("div");
		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			Log.log("#LOADING");
			return wrapper;
		}
		if (!this.data) {
			wrapper.innerHTML = "No data";
			Log.log("#NODATA");
			return wrapper;
		}

		if (!this.data) {
			wrapper.innerHTML = "Showing data";
			Log.log("#SHOWDATA");
			return wrapper;
		}


	},

	// unload the results from uber services
	processData: function(data) {
		console.log('processData()');
		if (!data) {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			Log.log("#No data");
			return;
		}

		this.data = data;
		//Log.log("#Payload: " + data.getElementsByTagName("flight_id")[0].childNodes[0].nodeValue);
		this.loaded = true;
		this.updateDom();
	},

	getTemplateData: function () {
		return this.config;
	},
	socketNotificationReceived: function(notification, payload) {
		var parser, xmlDoc;

		if (notification === "STARTED") {
			this.updateDom();
			Log.log("#STARTED");
			console.log('Node helper started')
		}
		else if (notification === "DATA") {
			console.log('Got DATA');
			this.loaded = true;
			parser = new DOMParser();
			xmlDoc = parser.parseFromString(payload,"text/xml");
			//Log.log("#DATA " + xmlDoc.getElementsByTagName("flight_id")[0].childNodes[0].nodeValue);
			this.processData(xmlDoc);
			this.updateDom();
		}
	}

});
