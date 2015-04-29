var detailFiller = (function() {

	return {
		renderDetails: function(details) {
			var alcoholValues = {"full_bar": "Full Bar", "none": "No", "beer_and_wine": "Beer & Wine", "NA": "NA"};
			var bool = {"true": "Available", "false": "Not Available", "NA": "NA"};
			var groups = {"true": "Yes", "false": "No", "NA": "NA"};
			var noise = details.attributes["Noise Level"]  || "NA";
			var categoryList = "";
			var priceRange = 0, priceIcons = "";

			$(".detail-box .name").html("<h4><span>" + details.name + "</span></h4>");
			$(".detail-box .address").html("<span>" + details.full_address.replace("\n", "<br/>") + "</span>");
			$(".detail-box .rating").html("<span>" + details.stars + "</span>");
			$(".detail-box .alcohol").html("<span>" + alcoholValues[(details.attributes["Alcohol"] || "NA")] + "</span>");
			$(".detail-box .gfgroup").html("<span>" + groups[(details.attributes["Good For Groups"] || "NA")] + "</span>");
			$(".detail-box .noise").html("<span>" + (noise.charAt(0).toUpperCase() + noise.slice(1)) + "</span>");
			var priceRange = (details.attributes["Price Range"] || 0);
			if(priceRange === 0) priceIcons = "NA";
			for(var i=0; i<priceRange; i++) {
				priceIcons += "<span class='glyphicon glyphicon-usd' aria-hidden='true'></span>";
			}

			$(".detail-box .price").html(priceIcons);
			$(".detail-box .delivery").html("<span>" + bool[(details.attributes["Delivery"] || "NA")] + "</span>");
			$(".detail-box .outdoor").html("<span>" + bool[(details.attributes["Outdoor Seating"] || "NA")] + "</span>");
			for (var i = 0; i < details.categories.length; i++) {
				if(details.categories[i] !== "Restaurants")
	        		categoryList +="<h4><span class='label label-info categories' style='display: inline-block;'>"+details.categories[i]+"</span></h4>"
      		}
			$(".detail-box .categories").html(categoryList);

      		$('.detail-box').removeClass("hidden");
      		$('.detail-box').addClass("slideInDown");
		}
	};
})();