var detailFiller = (function() {

	return {
		renderDetails: function(details) {
      var categoryList = "";
			$(".detail-box .name").html("<span>" + details.name + "</span>");
			$(".detail-box .address").html("<span>" + details.full_address + "</span>");
			for (var i = 0; i < details.categories.length; i++) {
        categoryList +="<span class='label label-info categories'>"+details.categories[i]+"</span>"
      }
			$(".detail-box .categories").html(categoryList);

      $('.detail-box').removeClass("hidden");
      $('.detail-box').addClass("slideInDown");
		}
	};
})();