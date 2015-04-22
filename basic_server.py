from flask import Flask, jsonify, render_template, request
from dbdriver import DBDriver
app = Flask(__name__)


def make_data_for_visual(data):
	preferences = ["alcohol", "noise_level", "attire", "good_for_groups", "price_range", "delivery", "outdoor_seating", "takes_reservations"]
	filter_value = ['none', None, None, True, None, True, True, True]
	return_data = {}

	for item in preferences:
		tuple_index = preferences.index(item)
		consider = filter(lambda x: x[tuple_index+5] != filter_value[tuple_index], data)
		return_data[item] = {}
		for other_item in preferences:
			if other_item == item: continue
			# if preferences.index(other_item) <= preferences.index(item): continue			
			loop_index = preferences.index(other_item)
			return_data[item][other_item] = len(filter(lambda x: x[loop_index+5] != filter_value[loop_index], consider))

	return return_data


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/restaurants')
def restaurant_by_pref():
	dbbridge = DBDriver()
	param_user_id = 4163#request.args.get('user_id')
	param_city = 'Tempe'#request.args.get('city')

	restaurants_for_user = dbbridge.fetch_recommendations(param_user_id, param_city)

	visual_data = make_data_for_visual(restaurants_for_user)

	return jsonify(**visual_data)


if __name__ == '__main__':
	app.debug = True
	app.run()