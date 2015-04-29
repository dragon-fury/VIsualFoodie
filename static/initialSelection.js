(function() {
	var colors = ["#FFA500", "#40E0D0", "#F2DA22", "#85BB65", "#FF6347"];
	var attributes = ["Outdoor Seating", "Low Noise Level", "Serves Alcohol", "Price Range", "Good for Groups"];
	var attributeNames = ["outdoor_seating", "noise_level", "alcohol", "price_range", "good_for_groups"];
	var matrix = [];

	for (i = 0; i < 5; i++) {
		matrix[i] = [];
		for (j = 0; j < 5; j++) {
			matrix[i][j] = 1;
		}
	}

	var chord = d3.layout.chord()
		.padding(.05)
		.sortSubgroups(d3.descending)
		.matrix(matrix);

	var width = 700,
		height = 600,
		innerRadius = Math.min(width, height) * .25,
		outerRadius = 200;

	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	var svg = d3.select("#chord").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var centerText = svg.append("text")
		.attr("x", -90)
		.attr("dy", 0);

	centerText
		.append("tspan")
			.style("font-size", 18)
			.text("WHAT DO YOU PREFER?");
	centerText
		.append("tspan")
			.attr("x", -45)
			.attr("dy", 25)
			.text("Click to select");

	var group = svg.selectAll(".group")
		.data(chord.groups)
		.enter().append("g")
		.attr("class", "group")
		.style("stroke", "#000");

	var groupPath = group.append("path")
		.attr("class", function(d) {
			return "ring preference-"+d.index;
		})
		.attr("id", function(d, i) {
			return "group" + i;
		})
		.attr("d", arc)
		.style("fill", function(d, i) {
			return colors[i];
		})
		.on("click", triggerSelection);


	var groupText = group.append("text")
		.attr("x", 60)
		.attr("dy", 25)
		.style("font-size", 20)
		.style("stroke-width", 0);


	groupText.append("textPath")
		.attr("xlink:href", function(d, i) {
			return "#group" + i;
		})
		.text(function(d, i) {
			return attributes[i];
		});

	$("input[name=preferences]").on('click', function(evt){
		var selections = $(".ring.selected");
		var paramToSend = {};

		paramToSend["use_history"] = ($("input[name=onoffswitch]:checked").length === 1);
		paramToSend["city"] = $(".hidden-city").text();
		paramToSend["user_id"] = $(".hidden-user").text();

		for(var i = 0; i < selections.length; i++) {
			var classes = $(selections[i]).attr("class");
			var preferenceClass =(classes.split(" ").sort())[0];
			var value = parseInt((preferenceClass.split("-"))[1]);
			var name = attributeNames[value];
			if(value === 1) {
				paramToSend[name] = "quiet";
			} else if(value === 2) {
				paramToSend[name] = $("input[name=alcohol]:checked").attr("value");
			} else if(value === 3) {
				paramToSend[name] = $("input[name=price_range]:checked").attr("value");
			} else {
				paramToSend[name] = "true";
			}
		}

		evt.preventDefault();
		window.location = "http://localhost:5000/pump?params="+JSON.stringify(paramToSend);
	});

	function triggerSelection(evt) {
		if(/(^|\s)selected(\s|$)/.test($(this).attr("class"))) {
			$(this).attr("class", "ring preference-"+evt.index);
		} else {
			$(this).attr("class", "ring selected preference-"+evt.index);
		}

		switch(evt.index) {
			case 2:
				var listElement = $('<li>');
				var div = $("<div>");
				var subDiv = $("<div>").html("How would you prefer it?");
				

				var content = '<div class="register-switch">'+
						  		'<input type="radio" name="alcohol" value="beer_and_wine" id="baw" class="register-switch-alcohol" checked>'+
						  		'<label for="baw" class="register-switch-label">Beer &amp; Wine</label>'+
						  		'<input type="radio" name="alcohol" value="full_bar" id="fb" class="register-switch-alcohol">'+
						  		'<label for="fb" class="register-switch-label">Full Bar</label>'+
						  	'</div>';
				div.html(content);
				div.prepend(subDiv);
				listElement.append(div);
				$("#list").append(listElement);

				setTimeout(function() {
				  listElement.attr("class", "show");
				}, 10);

				break;

			case 3:
				var listElement = $('<li>');
				var div = $("<div>");
				var subDiv = $("<div>").html("Choose a range");
				var content = '<div class="register-switch">'+
						  		'<input type="radio" name="price_range" value="2" id="two" class="register-switch-price" checked>'+
						  		'<label for="two" class="register-switch-label">&#36; or &#36;&#36;</label>'+
						  		'<input type="radio" name="price_range" value="3" id="three" class="register-switch-price">'+
						  		'<label for="three" class="register-switch-label">&#36;&#36;&#36; and high</label>'+
						  	'</div>';
				div.html(content);
				div.prepend(subDiv);
				listElement.append(div);
				$("#list").append(listElement);

				setTimeout(function() {
				  listElement.attr("class", "show");
				}, 10);

				break;

			default:
				break;

		}

	};
})();