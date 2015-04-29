(function() {

    var margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        width = $('#chart').width() - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var color = d3.scale.category20();
    var preference_names = ["Alcohol", "Noise Level", "Attire", "Good for Groups", "Price Range", "Delivery", "Outdoor Seating", "Takes Reservations"];
    var restaurantMapping = [];

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(40)
        .size([width, height]);

    var path = sankey.link();
    var sequence = [],
        target_map = {},
        restaurantOffset = 8;

    var makeDest = function(links) {
        for (var i = 0; i < links.length; i++) {
            if (!target_map[links[i].target]) target_map[links[i].target] = [];
            target_map[links[i].target].push(links[i].source);
        }
    };

    var findTarget = function() {
        var highlight_list = [];
        var limit = (Object.keys(target_map)).length;

        for (var i = 0; i < limit; i++) {
            var sourceArray = (target_map[i+restaurantOffset]).sort();
            var seqArray = sequence.sort();

            for (var k = 0, j = 0; k < sourceArray.length && j < seqArray.length;) {
                if (sourceArray[k] < seqArray[j]) {
                    k++;
                } else if (sourceArray[k] == seqArray[j]) {
                    k++; j++;
                } else {
                    break;
                }
            }

            if(j === seqArray.length) highlight_list.push(i+restaurantOffset);
        }
        return highlight_list;
    };

    // load the data
    d3.json("http://localhost:5000/restaurants", function(error, graph) {
        makeDest(graph.links);
        restaurantMapping = graph.mapping;

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(5);

        // add in the links
        var link = svg.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", function(d) {
                return "link " + d.source.name.substring(0, 3) + " dest-" + d.target.node;
            })
            .attr("d", path)
            .style("stroke-width", 3);

        // add the link titles
        link.append("title")
            .text(function(d) {
                return d.source.name + "  " + d.target.name;
            });

        // add in the nodes
        var node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })

        // add the rectangles for the nodes
        var rect = node.append("rect")
            .attr("height", function(d) {
                return d.dy;
            })
            .attr("width", sankey.nodeWidth())
            .attr("class", function(d) {
                if(d.node >= restaurantOffset)
                    return "restaurant "+d.node;
                return ""+d.node;
            })
            .style("fill", function(d) {
                return d.color = color(d.name.replace(/ .*/, ""));
            })
            .style("stroke", function(d) {
                return d3.rgb(d.color).darker(2);
            })
            .on("click", highlight);

        rect.append("title")
            .text(function(d) {
                return d.name;
            });

        // add in the title for the nodes
        node.append("text")
            .attr("x", -6)
            .attr("y", function(d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) {
                return d.name;
            })
            .filter(function(d) {
                return d.x < width / 2;
            })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

    });

    var highlight = function(evt) {
        if(/(^|\s)restaurant(\s|$)/.test($(this).attr("class")))
            return twilight($(this));

        svg.selectAll(".link").style('stroke-opacity', 0.1);
        var clickedClass = parseInt($(this).attr("class"));
        var pos = sequence.indexOf(clickedClass);
        if(pos > -1) {
            sequence.splice(pos, 1);
        } else {
            sequence.push(clickedClass);
        }

        var target = findTarget();
        var selected = $('.selected');
        $(".restaurant").attr("stroke-width", 1);
        for(var i=0; i<selected.length;i++) {
            var newClass = $(selected[i]).attr('class').split(" ").sort().slice(0,2).join(" ");
            $(selected[i]).attr("class", newClass);
        }

        for(var i = 0; i < target.length; i++) {
            for(var j = 0; j < sequence.length; j++){
                var classed = preference_names[sequence[j]].substring(0, 3);
                svg.selectAll(".link." + classed+".dest-"+target[i]).style('stroke-opacity', 0.6);
                $(".restaurant."+target[i]).attr("class", "restaurant selected "+target[i]);
            }
        }
        $('.selected').attr("stroke-width", 5);
    };

    var twilight = function(element) {
        var restaurantId = parseInt($(element).attr('class').split(" ").sort().slice(0,1));
        restaurantId = restaurantMapping[restaurantId - restaurantOffset];
        var detailResult = $.ajax({
            url: "http://localhost:5000/restaurant_detail/"+restaurantId
        });

        detailResult.done(function(result) {
            detailFiller.renderDetails(result);
        });
    };


})();