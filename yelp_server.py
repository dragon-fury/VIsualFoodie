from flask import Flask, jsonify, render_template, request, session, json
from dbdriver import DBDriver
from random import randint
app = Flask(__name__)
dbbridge = DBDriver()

def make_data_for_visual(data):
	# preferences = ["alcohol", "noise_level", "attire", "good_for_groups", "price_range", "delivery", "outdoor_seating", "takes_reservations"]
	# preference_names = ["Alcohol", "Noise Level", "Attire", "Good for Groups", "Price Range", "Delivery", "Outdoor Seating", "Takes Reservations"]
	# filter_value = ['none', None, None, True, None, True, True, True]
	# return_data = {"nodes": [], "links": [], "mapping": []}
	# restaurant_offset = len(preferences)
	# preference_offset = 5

	# restaurants = map(lambda x: x[0], data)
	# restaurant_names = map(lambda x: x[1], data)

	# for item in preferences:
	# 	pref_index = preferences.index(item)
	# 	return_data["nodes"].append({"node": pref_index, "name": preference_names[pref_index]})

	# 	consider = filter(lambda x: x[pref_index+preference_offset] != filter_value[pref_index], data)

	# 	for restaurant in consider:
	# 		rest_index = restaurants.index(restaurant[0])
	# 		return_data["links"].append({"source": pref_index, "target": rest_index+restaurant_offset, "value": 10})

	# for ind in range(0, len(restaurants)):
	# 	return_data["nodes"].append({"node": ind+restaurant_offset, "name": restaurant_names[ind]})
	# 	return_data["mapping"].append(restaurants[ind])
	restaurant_list = data["restaurants"]
	checkins = data["checkin"]
	return_data = "id,city,restaurantName,rank,reviewCount,checkinCount,rating\n"
	for restaurant in restaurant_list:
		review_count = restaurant["review_count"]
		business_id = restaurant["business_id"]
		mapping_id = int(restaurant["mapping_id"])
		checkin_count = 1
		if business_id in checkins:
			checkin_count = checkins[business_id]
		price_range = 1
		if "Price Range" in restaurant["attributes"]:
			price_range = restaurant["attributes"]["Price Range"]

		rank = (restaurant["stars"] * price_range)/review_count

		return_data += ",".join([str(mapping_id), restaurant["city"], restaurant['name'], str(rank), str(review_count), str(checkin_count), str(restaurant["stars"])])+"\n"

	return return_data

def make_data_for_chord(restaurants):
	return_data = {}

	for i in range(0, len(restaurants)):
		return_data[str(restaurants[i])] = {}
		for j in range(0, len(restaurants)):
			if i < j:
				return_data[str(restaurants[i])][str(restaurants[j])] = randint(10, 30)

	return return_data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pump')
def pump():
	session["params_for_reco"] = json.loads(request.args.get('params'))
	return render_template('recommend.html')

@app.route('/details')
def details():
	session['restaurants'] = request.args.get('restaurant_ids')
	return render_template('details.html')

@app.route('/restaurant_connections')
def restaurant_connections():
	visual_data = make_data_for_chord(session['restaurants'].split(","))
	return jsonify(**visual_data)

@app.route('/restaurant_detail/<restaurant_id>')
def restaurant_detail(restaurant_id):
	return jsonify(**dbbridge.fetch_restaurant_details(restaurant_id))

@app.route('/words/<restaurant_id>')
def restaurant_word_detail(restaurant_id):
	word_counts = dbbridge.fetch_word_counts(restaurant_id)
	result = "name,count\n"

	for word in word_counts['words']:
		count = word_counts['words'][word]
		if count < 601 and len(word) > 3 and (word not in ["dont", "thru", "thats", "didnt", "dint", "pizza", "pizzas", "settebello"]):
			result += word+","+str(count)+"\n"

	return result

@app.route('/restaurants')
def restaurant_by_pref():
	restaurants_for_user = dbbridge.fetch_recommendations(session["params_for_reco"])

	visual_data = make_data_for_visual(restaurants_for_user)

	return visual_data

app.secret_key = "amsocool"

if __name__ == '__main__':
	app.debug = True
	app.run()


# function addCol() { 
#  	db.yelp_restaurants.find().forEach(function(doc) { 
#  		var m = db.yelp_restaurant_mapping.find({"business_id": {$eq: doc.business_id}});
#  		var myDoc = m.hasNext() ? m.next() : null;
#  		if(myDoc) {
#  			db.yelp_restaurants.update({_id: doc._id}, {$set: {"mapping_id": myDoc.mapping_id}}); 
#  		}
#  	}); 
# }
