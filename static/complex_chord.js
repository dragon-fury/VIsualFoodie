(function() {

	var width = $('#chart').width(),
	    height = 500,
	    innerRadius = Math.min(width, height) * .41,
	    outerRadius = innerRadius * 1.1;

    var matrix = [],
    	attributeList = ["alcohol", "noise_level", "attire", "good_for_groups", "price_range", "delivery", "outdoor_seating", "takes_reservations"],
    	// ["Alcohol", "Noise Level", "Attire", "Price Range", "Has TV", 
    	// 					"Good For Groups", "Delivery", "Accepts Credit Cards", 
    	// 					"Wheelchair Accessible", "Wi-Fi"],
    	numberOfAttributes = attributeList.length;

	var connections = {}, sequence = new Array(), nodes = [0, 1, 2, 3, 4, 5, 6, 7];

	var fill = d3.scale.category10();

	var svg = d3.select("#chart").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


	var initializeMatrixData = function(data) {
		for(var i=0;i<numberOfAttributes;i++) {
		  matrix[i] = [];
		  for(var j=0;j<numberOfAttributes;j++) {
		    matrix[i][j] = 0;
		  }
		}

		for(attribute in data) {
			var attributeIndex = attributeList.indexOf(attribute);
			for(connectedAttribute in data[attribute]) {
				var connectedAttributeIndex = attributeList.indexOf(connectedAttribute);
				var noOfRestaurants = parseInt(data[attribute][connectedAttribute]);
				matrix[attributeIndex][connectedAttributeIndex] = noOfRestaurants;
			}
		}		
	};


	d3.json("http://localhost:5000/restaurants", function(data) {	  

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
		      .style("fill", function(d) { return fill(d.target.index); })
		      .style("opacity", 1)

		  var chordSVG = svg.selectAll("g.group")
        					.data(chord.groups)
      						.enter().append("svg:g")
        					.attr("class", "group");

        	chordSVG.append("svg:path")
		      .style("fill", function(d) { return fill(d.index); })
		      .style("stroke", function(d) { return fill(d.index); })
		      .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
		      .on("click", fade(.1));

		   // chordSVG.append("svg:text")
		   //      .attr("x", 6)
		   //      .attr("dy", 15)
		   //      .text(function(d) { console.log(attributeList[d.index]); return attributeList[d.index]; });

		   
		   function filterBySequence() {
		   		var tempArray = [];
		   		for(var i=0; i < nodes.length; i++) {
		   			if($.inArray(nodes[i], sequence) === -1)
			   			tempArray.push(nodes[i]);
		   		}
		   		return tempArray;
		   }

		  function fade(opacity) {
		    return function(g, current) {
		    	sequence.push(current);

		      	svg.selectAll("path.chord")
			        .transition()
			          .style("opacity", opacity);

			    if(sequence.length > 1) {
			    	var indi = sequence.indexOf(current);
			    	var gotit = filterBySequence();
			    	debugger;
			    	connections[current] = [];
			    	connections[current] = connections[current].concat(gotit);
			    	connections[current].push(sequence[indi-1]);
			    	connections[sequence[indi-1]] = [current];
			    } else {
			    	connections[current] = filterBySequence();
			    }

		      	svg.selectAll("path.chord")
		          .filter(function(d) {
		          	var result = false;
		          	var sourceNode = d.source.index;
		          	var targetNode = d.target.index;

					if($.inArray(targetNode, connections[sourceNode]) !==-1 || $.inArray(sourceNode, connections[targetNode])!==-1) {
		          		result = true; //(d.source.index != current && d.target.index != current);
					}

					return result;
		          })
		        .transition()
		          .style("opacity", 1);
		    };
		}
	});
})();