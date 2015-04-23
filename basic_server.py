from flask import Flask, jsonify, render_template, request
from dbdriver import DBDriver
app = Flask(__name__)


def make_data_for_visual(data):
	preferences = ["alcohol", "noise_level", "attire", "good_for_groups", "price_range", "delivery", "outdoor_seating", "takes_reservations"]
	preference_names = ["Alcohol", "Noise Level", "Attire", "Good for Groups", "Price Range", "Delivery", "Outdoor Seating", "Takes Reservations"]
	filter_value = ['none', None, None, True, None, True, True, True]
	return_data = {"nodes": [], "links": []}
	restaurant_offset = len(preferences)
	preference_offset = 5

	restaurants = map(lambda x: x[0], data)
	restaurant_names = map(lambda x: x[1], data)

	for item in preferences:
		pref_index = preferences.index(item)
		return_data["nodes"].append({"node": pref_index, "name": preference_names[pref_index]})

		consider = filter(lambda x: x[pref_index+preference_offset] != filter_value[pref_index], data)

		for restaurant in consider:
			rest_index = restaurants.index(restaurant[0])
			return_data["links"].append({"source": pref_index, "target": rest_index+restaurant_offset, "value": 10})

	for ind in range(0, len(restaurants)):
		return_data["nodes"].append({"node": ind+restaurant_offset, "name": restaurant_names[ind]})

	return return_data


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/restaurants')
def restaurant_by_pref():
	dbbridge = DBDriver()
	param_user_id = request.args.get('user_id')
	param_city = request.args.get('city')

	restaurants_for_user = dbbridge.fetch_recommendations(param_user_id, param_city)

	visual_data = make_data_for_visual(restaurants_for_user)

	return jsonify(**visual_data)


if __name__ == '__main__':
	app.debug = True
	app.run()