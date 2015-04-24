(function() {

	var width = $('#chart').width(),
		height = 500,
		innerRadius = Math.min(width, height) * .41,
		outerRadius = innerRadius * 1.1;

	var matrix = [],
		sequence = [];
	// ["Alcohol", "Noise Level", "Attire", "Price Range", "Has TV", 
	// 					"Good For Groups", "Delivery", "Accepts Credit Cards", 
	// 					"Wheelchair Accessible", "Wi-Fi"],

	var fill = d3.scale.category10();

	var svg = d3.select("#chart").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var renderRadar = function(restaurant_id) {
		var radarResult = $.ajax({
			url: "http://localhost:5000/restaurant_detail/"+restaurant_id
		});

		radarResult.done(function(result) {
			var noise_level = [ "quiet", "average", "loud", "very_loud" ];
			var alcohol = [ "none", "beer_and_wine", "full_bar" ];
			var review_count = parseInt(result["review_count"]) || 0;
			var price_range = 0;
			if(result["attributes"].hasOwnProperty("Price Range")) price_range = parseInt(result["attributes"]["Price Range"]);
			var noise = noise_level.indexOf(result["attributes"]["Noise Level"]);
			if(noise === -1) noise = 0;
			var alcohol_val = alcohol.indexOf(result["attributes"]["Alcohol"]);
			if(alcohol_val === -1) alcohol_val = 0;


			if(review_count > 4) {
				if(review_count > 100) review_count = 100;
				review_count = Math.ceil((review_count/100) * 4);
			}
			var dataToSend = [{
				axes: [
					{axis: "Price Range", value: price_range},
					{axis: "Stars", value: parseInt(result["stars"])},
					{axis: "Noise Level", value: noise+1},
					{axis: "Review Count", value: review_count},
					{axis: "Alcohol Serving", value: alcohol_val+1}
				]
			}];

			radar.renderRadar(dataToSend);
		});
	};

	var initializeMatrixData = function(data) {
		var length = (Object.keys(data)).length;

		for (var i = 0; i < length; i++) {
			matrix[i] = [];
			for (var j = 0; j < length; j++) {
				matrix[i][j] = 0;
			}
		}

		var restaurantList = Object.keys(data);
		for (restaurant in data) {
			var restaurantIndex = restaurantList.indexOf(restaurant);
			for (connectedRestaurant in data[restaurant]) {
				var connectedRestaurantIndex = restaurantList.indexOf(connectedRestaurant);
				var noOfRestaurants = parseInt(data[restaurant][connectedRestaurant]);
				matrix[restaurantIndex][connectedRestaurantIndex] = noOfRestaurants;
			}
		}
	};


	d3.json("http://localhost:5000/restaurant_connections", function(data) {

		initializeMatrixData(data);

		var chord = d3.layout.chord()
			.padding(.05)
			.sortSubgroups(d3.descending)
			.matrix(matrix);


		svg.selectAll("path.chord")
			.data(chord.chords)
			.enter().append("path")
			.attr('class', 'chord')
			.attr("d", d3.svg.chord().radius(innerRadius))
			.style("fill", function(d) {
				return fill(d.target.index);
			})
			.style("opacity", 1)

		var chordSVG = svg.selectAll("g.group")
			.data(chord.groups)
			.enter().append("svg:g")
			.attr("class", "group");

		chordSVG.append("svg:path")
			.style("fill", function(d) {
				return fill(d.index);
			})
			.style("stroke", function(d) {
				return fill(d.index);
			})
			.attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
			.on("click", fade(.1));

		function fade(opacity) {
			return function(g, current) {
				if (sequence.length > 2)
					sequence = [];
				sequence.push(current);

				svg.selectAll("path.chord")
					.transition()
					.style("opacity", opacity);

				svg.selectAll("path.chord")
					.filter(function(d) {
						// var result = false;
						var sourceNode = d.source.index;
						var targetNode = d.target.index;

						//        	if(sequence.length == 2) {
						//        		if($.inArray(targetNode, sequence) !==-1 && $.inArray(sourceNode, sequence)!==-1) 
						//        			return true;
						//        	} else if($.inArray(targetNode, sequence) !==-1 || $.inArray(sourceNode, sequence)!==-1) {
						//        		result = true;
						// }

						return (sourceNode === current || targetNode === current);
					})
					.transition()
					.style("opacity", 1);

				renderRadar(current);
			};
		}
	});
})();