/* Magic Mirror
 * Node Helper: MMM-Lynheter
 *
 * By Jan Christian Alvestad
 */

 
const NodeHelper = require("node_helper");
var request = require("request");

module.exports = NodeHelper.create({

	start: function() {
		var self = this;
		this.started = false;
		this.config = null;
	},

	getData: function() {
		var self = this;
        var hostUrl = this.config.httpRequestURL;
        var lat = this.config.lat;
        var lon = this.config.lon;
        var distance = this.config.distance;
        var requestURL = hostUrl + '/events/events?lat=' + lat + '&long=' + lon + '&d=' + distance + '&from=0&to=0';
        
            request({
                url: requestURL,
            }, function (error, response, body) {

            if (error) {
                console.log('Error fetching data - ' + error);
            }

			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA", body);
			}
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