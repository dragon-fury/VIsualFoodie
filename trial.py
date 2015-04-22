from dbdriver import DBDriver

dbbridge = DBDriver()
data = dbbridge.fetch_recommendations(4163, 'Tempe')
# print data

preferences = ["alcohol", "noise_level", "attire", "good_for_groups", "price_range", "delivery", "outdoor_seating", "takes_reservations"]
filter_value = ['none', None, None, False, None, False, False, False]
return_data = {}

for item in preferences:
	tuple_index = preferences.index(item)
	consider = filter(lambda x: x[tuple_index+5] != filter_value[tuple_index], data)
	return_data[item] = {}
	for other_item in preferences:
		if other_item == item: continue
		loop_index = preferences.index(other_item)
		return_data[item][other_item] = len(filter(lambda x: x[loop_index+5] != filter_value[loop_index], consider))

print return_data
