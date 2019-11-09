/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMM-Lynheter",{
	news: [],
	loaded: false,

	defaults: {
		refreshInterval: 1000 * 60 * 1,
		lat: 59.8260275,
		lon: 10.8133689,
		distance: 15,
		httpRequestURL: 'http://139.162.242.171:8442',
		alertDistance: 5,
		recentHours: 1
	},

	getStyles: function () {
        return ['lynheter.css'];
	},
	
	start: function () {
		Log.info("Starting module: " + this.name);

		this.loaded = false;
		this.sendSocketNotification("CONFIG", this.config);
	},

	sortChronologically: function(news) {
		var me = this,
			features = news.features;	

		function compare( feature1, feature2 ) {

			var feature1Properties = feature1.properties;
			var feature1Tweets = feature1Properties.tweets;
			var feature1LatestTweet = me.minMax(feature1Tweets);

			var feature2Properties = feature2.properties;
			var feature2Tweets = feature2Properties.tweets;
			var feature2LatestTweet = me.minMax(feature2Tweets);


			if ( feature1LatestTweet.createdAt < feature2LatestTweet.createdAt ){
			  return 1;
			}
			if ( feature1LatestTweet.createdAt > feature2LatestTweet.createdAt ){
			  return -1;
			}
			return 0;
		  }
		  
		  news.features = features.sort( compare );
		  return news;
	},

	minMax: function (items) {
		return items.reduce((acc, val) => {
			if (acc.createdAt > val.createdAt) {
				return acc;
			}
			return val;
		}, { createdAt: 0});
	},

	

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = 'lynheter-news'

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			Log.log("#LOADING");
			return wrapper;
		}
		if (!this.news) {
			wrapper.innerHTML = "No data";
			Log.log("#NODATA");
			return wrapper;
		}

		var XHoursEarlier = new Date();
		XHoursEarlier.setHours(XHoursEarlier.getHours() - this.config.recentHours);

		var features = this.news.features;
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
			distanceWrapper.className = "distance";
			
			featureWrapper.appendChild(distanceWrapper);

			
			var recentFeature = false;
			var featureTweets = featureProperties.tweets;
			for (var j = 0; j < featureTweets.length; j++) {
				var currentFeatureTweet = featureTweets[j];
				var tweetWrapper = document.createElement("div");
				tweetWrapper.className = 'tweet';

				var tweeter = currentFeatureTweet.tweeter;

				var time = new Date(currentFeatureTweet.createdAt)
				var timeString = time.toLocaleString("no");
				var timeAndTweet = timeString + ' meldt av ' + tweeter;
				var timeAndTweetWrapper = document.createElement("div");
				timeAndTweetWrapper.className = 'timeAndTweet';
				timeAndTweetWrapper.innerHTML = timeAndTweet;
				tweetWrapper.appendChild(timeAndTweetWrapper);

				// Figure out if this is a recent tweet or not
				var timeBetweenNowAndTweet = time - XHoursEarlier;
				// todo debug and fix this
				console.log(time.toLocaleString("no") + ' vs ' + XHoursEarlier.toLocaleString("no"));
				console.log('time diff at ' + distance + ' is ' + ((timeBetweenNowAndTweet/1000)/60) + ' minutes ');

				if (timeBetweenNowAndTweet > 0) {
					recentFeature = true;
				}

				var content = currentFeatureTweet.content;
				var contentWrapper = document.createElement("div");
				contentWrapper.className = 'content';
				contentWrapper.innerHTML = '<i>' + content + '</i>';
				tweetWrapper.appendChild(contentWrapper);
				featureWrapper.appendChild(tweetWrapper);
			}

			if (distance < this.config.alertDistance) {
				if (recentFeature) {
					featureWrapper.className = 'close-and-recent-feature';
				}
				else {
					featureWrapper.className = 'close-feature';
				}
			}
			else {
				if (recentFeature) {
					featureWrapper.className = 'far-and-recent-feature';
				}
				else {
					featureWrapper.className = 'far-feature';
				}
			}


			nearestFeaturesWrapper.appendChild(featureWrapper);

		}
		wrapper.appendChild(nearestFeaturesWrapper);

		return wrapper;



	},

	// unload the results from uber services
	processData: function(news) {
		console.log('processData()');
		if (!news) {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			Log.log("#No data");
			return;
		}
		
		news = this.sortChronologically(news);

		this.news = news;
		this.loaded = true;
		this.updateDom(3000);
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