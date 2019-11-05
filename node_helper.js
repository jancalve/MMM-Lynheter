/* Magic Mirror
 * Node Helper: MMM-Avinor
 *
 * By
 * MIT Licensed.
 */

 
const NodeHelper = require("node_helper");
var request = require("request");
var https = require("https");

const axios = require('axios');



module.exports = NodeHelper.create({

	start: function() {
		var self = this;
		console.log("Starting node helper for: " + this.name);
		this.started = false;
		this.config = null;
	},

	getData: function() {
		var self = this;
        var myUrl = this.config.httpRequestURL;
        var lat = this.config.lat;
        var lon = this.config.lon;
        var newsWithin = this.config.newsWithin;

        	// https://lynheter.no:8443/events/events?lat=59.826022&long=10.813373499999999&d=20&from=1572903815338&to=1572990215338

        var requestURL = myUrl + '/events/events?lat=' + lat + "&long=" + lon + "&d=7" + "&from=1572820137354&to=1572992845726";
        console.log('Fetching data with request url ' + requestURL);
		//return new Promise(function (resolve, reject) {
            var options = {
                host: "lynheter.no",
                path: '',
 
                //               path: '/events/events?lat=' + lat + "&long=" + lon + "&d=7" + "&from=1572820137354&to=1572992845726",
                port: 443,
                method: "GET"
            };
        
            axios.get('https://lynheter.no:8443/events/events?lat=59.826022&long=10.81337&d=20&from=1572903815338&to=1572990215338')
            .then(response => {
              console.log(response.data.url);
              console.log(response.data.explanation);
            })
            .catch(error => {
              console.log('omfg ' + error);
            });


            https.request(options, function (error, response, body) {
            console.log('Got response from WS');

            if (error) {
                console.log('Error fetching data - ' + error);
            }

			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA", body);
			}
		//	});
		});
		setTimeout(function() { self.getData(); }, this.config.refreshInterval);
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === "CONFIG" && self.started == false) {
			self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.getData();
			self.started = true;
		}
	}
});