# Module: MMM-Lynheter
Live news feed for all of Norway based on Twitter alerts

## Screenshot
Pending

## Using the module
Add the following to the modules array in config.js:

		{
			module: "MMM-Lynheter"
            config: {
                ...
            }
		},


## Config options
config: {
    	refreshInterval: 10000, // How often the module should check for news
		lat: 59.8260275, // latitude of point-of-interest
		lon: 10.8133689, // longitude of point-of-interest
		distance: 15, // Distance (in km) limit. 15 would return all news in a radius of 15km from
        // point-of-interest.
		alertDistance: 4 // If a news item happened within the specified distance, it will be colored red.
        recentHours: 1 // How recent (in hours) a news item should be before it is styled as a recent item.
}

## Disclaimer
This is very much a work in progress. 
It relies on a service hosted entirely by yours truly which
have no uptime guarantees what so ever.