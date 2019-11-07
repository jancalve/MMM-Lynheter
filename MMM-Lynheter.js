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
		refreshInterval: 10000,
		lat: 59.8260275,
		lon: 10.8133689,
		distance: 15,
		httpRequestURL: 'http://139.162.242.171:8442',
		alertDistance: 4
	},

	getStyles: function () {
        return ['lynheter.css'];
	},
	
	start: function () {
		Log.info("Starting module: " + this.name);

		this.loaded = false;
		this.sendSocketNotification("CONFIG", this.config);
	},

	// Override dom generator.
	getDom: function () {
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

		var features = this.data.features;
		//Log.log('Parsing ' + features.length + ' features');

		var nearestFeaturesWrapper = document.createElement("div");
		nearestFeaturesWrapper.className = 'features';

		for (var i = 0; i < features.length; i++) {
			var currentFeature = features[i];
			var featureProperties = currentFeature.properties;

			var featureWrapper = document.createElement("div");
			featureWrapper.className = 'feature';

			var distanceWrapper = document.createElement("div");
			var distance = featureProperties.distance;
			distanceWrapper.innerHTML = (new String(distance)).substring(0, 4) + ' km';
			if (distance < this.config.alertDistance) {
				distanceWrapper.className = 'distance-close';
			}
			else {
				distanceWrapper.className = 'distance-far';
			}

			featureWrapper.appendChild(distanceWrapper);
			
			var featureTweets = featureProperties.tweets;
			for (var j = 0; j < featureTweets.length; j++) {
				var tweetWrapper = document.createElement("div");
				tweetWrapper.className = 'tweet';

				var currentFeatureTweet = featureTweets[j];
				var tweeter = currentFeatureTweet.tweeter;
		//		var tweeterWrapper = document.createElement("div");
		//		tweeterWrapper.className = 'tweeter';
		//		tweeterWrapper.innerHTML = tweeter;
		//		tweetWrapper.appendChild(tweeterWrapper);

				var time = new Date(currentFeatureTweet.createdAt).toLocaleString("no", {  timeZone: 'UTC' });
				var timeAndTweet = time + ' meldt av ' + tweeter;
				var timeAndTweetWrapper = document.createElement("div");
				timeAndTweetWrapper.className = 'timeAndTweet';
				timeAndTweetWrapper.innerHTML = timeAndTweet;
				tweetWrapper.appendChild(timeAndTweetWrapper);

				var content = currentFeatureTweet.content;
				var contentWrapper = document.createElement("div");
				contentWrapper.className = 'content';
				contentWrapper.innerHTML = content;
				tweetWrapper.appendChild(contentWrapper);


				featureWrapper.appendChild(tweetWrapper);
			}
			nearestFeaturesWrapper.appendChild(featureWrapper);

		}
		wrapper.appendChild(nearestFeaturesWrapper);

		return wrapper;



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
		this.loaded = true;
		this.updateDom();
	},

	getTemplateData: function () {
		return this.config;
	},
	socketNotificationReceived: function(notification, payload) {

		console.log('Got notification ' + notification);

		if (notification === "STARTED") {
			this.updateDom();
			Log.log("#STARTED");
		}
		else if (notification === "DATA") {
		//	console.log('Got DATA');
			this.loaded = true;
			
			doc = JSON.parse(payload);
			this.processData(doc);
		}
	}

});
