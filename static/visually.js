(function() {
	var compare = false;
	$(function () {
	  $('[data-toggle="tooltip"]').tooltip();
	});

	var margin = {
			top: 20,
			right: 20,
			bottom: 30,
			left: 40
		},
		width = 800 - margin.left - margin.right,
		height = 450 - margin.top - margin.bottom;

	var x = d3.scale.linear()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var color = ['#6C9023', '#7BA428', '#8BB82D', '#9ACD32', '#A4D246', '#AED75B', '#B8DC70', '#C2E184', '#FFC966', '#FFC04D', '#FFB733', '#FFAE19', '#FFA500', '#E69400', '#CC8400'];

	var xAxis = d3.svg.axis()
		.scale(x)
		.ticks(0)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip-custom")
        .style("opacity", 0);

	d3.csv("http://localhost:5000/restaurants", function(error, data) {
		var city = "";

		data.sort(function(a,b) {
			return a.rank - b.rank;
		});

		data.forEach(function(d) {
			d.reviewCount = +d.reviewCount;
			d.rank = +d.rank;
			city = d.city;
		});

		x.domain(d3.extent(data, function(d) {
			return d.rank;
		}).reverse()).nice();
		y.domain(d3.extent(data, function(d) {
			return d.reviewCount;
		})).nice();

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.style("stroke-width", 2)
			.call(xAxis)
			.append("text")
			.attr("class", "label")
			.attr("x", width/2)
			.attr("y", 25)
			.style("text-anchor", "end")
			.html("Highly Recommended &#10140;")
			.style("font-size", "16px");

		svg.append("g")
			.attr("class", "y axis")
			.style("stroke-width", 2)
			.call(yAxis)
			.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Review Count")
			.style("font-size", "16px");

		var text = svg.append("text")
			.attr("x", 60)
			.attr("y", 75)
			.attr("dy", ".35em")
			.style("fill", "#DDD")
			.style("font-size", "40px");

		text.append("tspan")
			.attr("y", 75)
			.text("Recommended Restaurants for You");
		text.append("tspan")
			.attr("x", 205)
			.attr("y", 125)
			.style("font-size", "25px")
			.text("(Click on bubbles for info)")
		text.append("tspan")
			.attr("x", 225)
			.attr("y", 185)
			.style("font-size", "23px")
			.text(function(d) {
				return "In "+city;
			})
		text.append("tspan")
			.attr("x", 125)
			.attr("y", 225)
			.style("font-size", "20px")
			.text("(considered rating, price range & review count)");

		svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", "dot")
			.attr("r", function(d) {
				var checkinCount = d.checkinCount;
				if(checkinCount > 200)
					checkinCount = 200;
				return mapRange(checkinCount, 1, 200, 5, 15);
			})
			.attr("cx", function(d) {
				return x(d.rank);
			})
			.attr("cy", function(d) {
				return y(d.reviewCount);
			})
			.on("mouseover", function(d) {
				tooltip.transition()
				   .duration(200)
				   .style("opacity", .9);
				tooltip.html("<div class='title'>"+d.restaurantName+"</div>"+"<span><em>Rating</em>: "+d.rating+"</span><span><em>Reviews</em>: "+d.reviewCount+"</span><span><em>Checkins (Today)</em>: "+d.checkinCount+"</span>")
				   .style("left", (d3.event.pageX + 5) + "px")
			       .style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function(d) {
			  	tooltip.transition()
			       .duration(500)
			       .style("opacity", 0);
			})
			.on("click", detailed)
			.style("fill", function(d, i) {
				return color[i];
			});

		var legend = svg.selectAll(".legend")
		      .data(color)
		    .enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(-" + (i+15)*20 + ", 0)"; });

		// draw legend colored rectangles
		legend.append("rect")
		  .attr("x", width - 18)
		  .attr("width", 18)
		  .attr("height", 18)
		  .style("fill", function(d, i) { return color[i];});

		var dataSize = data.length;
		// draw legend text
		legend.append("text")
		  .attr("x", width + 16)
		  .attr("y", 25)
		  .attr("dy", ".35em")
		  .style("text-anchor", "end")
		  .text(function(d, i) { 
		  	if(i === 0)
		  		return "Highly";
		  	else if(i === dataSize-1)
		  		return "Least";
		  	else if(i === parseInt(dataSize/2))
		  		return "Recommended →";
		  });
	});

	$(".compare").on("click", function(e){
		compare = true;
	});

	var detailed = function(element) {
		if(!compare) {
			$(".selected-dot").attr("class", "dot");
		} else {
			$(this).attr("class", "dot-color");	
		}
		var classes = $(this).attr("class");
		$(this).attr("class", classes+" selected-dot");
		$(".titles").removeClass("hidden");

	    var restaurantId = parseInt(element.id);
	    var detailResult = $.ajax({
	        url: "http://localhost:5000/restaurant_detail/"+restaurantId
	    });

	    detailResult.done(function(result) {
	        detailFiller.renderDetails(result);
	        renderRadar(result);
	        bubble.renderWords(result.business_id);
	    });
	};

	var renderRadar = function(result) {
		var noise_level = [ "quiet", "average", "loud", "very_loud" ];
		var alcohol = [ "none", "beer_and_wine", "full_bar" ];
		var price_range = 0;
		if(result.attributes.hasOwnProperty("Price Range")) price_range = parseInt(result.attributes["Price Range"]);
		var noise = noise_level.indexOf(result["attributes"]["Noise Level"]);
		if(noise === -1) noise = 0;
		var alcohol_val = alcohol.indexOf(result["attributes"]["Alcohol"]);
		if(alcohol_val === -1) alcohol_val = 0;

		var reviewCount = result.review_count;
		if(reviewCount > 5) {
			if(reviewCount > 100) reviewCount = 100;
			reviewCount = Math.ceil((reviewCount/100) * 5);
		}

		var radarData = {
			axes: [
				{axis: "Price Range", value: price_range},
				{axis: "Stars", value: parseInt(result.stars)},
				{axis: "Noise Level", value: noise+1},
				{axis: "Review Count", value: reviewCount},
				{axis: "Alcohol Serving", value: alcohol_val+2}
			]
		};

		var dataToSend = [];

		if(!compare) {
			comparisonData = radarData;
		} else {
			dataToSend.push(comparisonData);
			compare = false;
		}
		dataToSend.push(radarData);

		radar.renderRadar(dataToSend);
	};

	var mapRange = function(value, leftMin, leftMax, rightMin, rightMax) {
	    var leftSpan = leftMax - leftMin;
	    var rightSpan = rightMax - rightMin;

		var valueScaled = parseFloat(value - leftMin) / parseFloat(leftSpan);

	    return rightMin + (valueScaled * rightSpan);
	};
})();