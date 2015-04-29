import psycopg2
from pymongo import MongoClient

class DBDriver(object):
    def __init__(self):
        self.pg_dbname = 'yelp'
        self.pg_port = '5432'
        self.pg_host = 'localhost'
        client = MongoClient()
        self.db = client.yelp
        self.checkin = self.db.yelp_checkin
        self.restaurants = self.db.yelp_restaurants
        self.users = self.db.yelp_users
        self.word_count = self.db.yelp_word_cloud

    def get_connection(self):
        return psycopg2.connect("dbname="+self.pg_dbname+" port="+self.pg_port+" host="+self.pg_host)

    def fetch_restaurant_details(self, restaurant_id):
        return self.restaurants.find_one({'mapping_id': int(restaurant_id)}, {'_id': 0, 'city': 1, 'review_count': 1, 'name': 1, 'business_id': 1, 'full_address': 1, 'state': 1, 'stars': 1, 'attributes': 1, 'categories': 1})

    def query_recommendation_engine(self, params):
        user_id = params["user_id"]
        city = params["city"]
        param_string = ""

        pg_connection = self.get_connection()
        cursor = pg_connection.cursor()


        if "alcohol" in params:
            param_string += " and M.alcohol='"+params["alcohol"]+"'"
        if "noise_level" in params:
            param_string += " and M.noise_level='"+params["noise_level"]+"'"
        if "outdoor_seating" in params:
            param_string += " and M.outdoor_seating="+params["outdoor_seating"]
        if "good_for_groups" in params:
            param_string += " and M.good_for_groups="+params["good_for_groups"]
        if "price_range" in params:
            price_range = params["price_range"]
            if int(price_range) == 3:
                param_string += " and M.price_range >= "+price_range
            else:
                param_string += " and M.price_range <= "+price_range

        query = "SELECT M.restaurant_id FROM yelp_ratings R, yelp_restaurants M " \
                "RECOMMEND R.restaurant_id TO R.user_id ON R.rating USING ItemCosCF " \
                "WHERE R.user_id = "+ str(user_id) +" and R.restaurant_id = M.restaurant_id and M.city = '"+city+"'"+param_string+" " \
                "ORDER BY R.rating desc " \
                "LIMIT 15;"
        
        cursor.execute(query)
        
        results = cursor.fetchall()
        cursor.close()
        pg_connection.close()
        
        restaurant_ids = [int(tup[0]) for tup in results]

        return self.query_mongo(params, restaurant_ids)

    def query_mongo(self, params, ids = []):
        if len(ids) > 0:
            params = {}
            params["mapping_id"] = {}
            params["mapping_id"]["$in"] = ids
        else:
            params.pop('user_id')
            params.pop('use_history')
            params["stars"] = {}
            params["stars"]["$gt"] = 3.4
            if "outdoor_seating" in params:
                params["attributes.Outdoor Seating"] = (params.pop("outdoor_seating") == 'true')
            if "price_range" in params:
                price_range = int(params.pop("price_range"))
                if price_range == 3:
                    params["attributes.Price Range"] = {}
                    params["attributes.Price Range"]["$gte"] = price_range
                else:
                    params["attributes.Price Range"] = {}
                    params["attributes.Price Range"]["$lte"] = price_range

            if "alcohol" in params:
                params["attributes.Alcohol"] = params.pop("alcohol")
            if "good_for_groups" in params:
                params["attributes.Good For Groups"] = (params.pop("good_for_groups") == 'true')
            if "noise_level" in params:
                params["attributes.Noise Level"] = params.pop("noise_level")

        result = {"restaurants": [], "checkin": {}}
        business_ids = []
        
        cursor = self.restaurants.find(params, {'_id': 0, 'mapping_id': 1, 'city': 1, 'review_count': 1, 'name': 1, 'business_id': 1, 'full_address': 1, 'state': 1, 'stars': 1, 'attributes': 1, 'categories': 1}).limit(15)
        for entry in cursor:
            business_ids.append(entry["business_id"])
            result["restaurants"].append(entry)

        params = {}
        params["business_id"] = {}
        params["business_id"]["$in"] = business_ids
 
        cursor = self.checkin.find(params, {'_id': 0})
        for entry in cursor:
            day = (entry["days"].keys())[0]
            result["checkin"][entry["business_id"]] = int(entry["days"][day])

        return result

    def fetch_recommendations(self, params):
        if params["use_history"]:
            results = self.query_recommendation_engine(params)
        else:
            results = self.query_mongo(params)

        return results

    def fetch_word_counts(self, restaurant_id):
        return self.word_count.find_one({'business_id': restaurant_id}, {'_id': 0, 'words': 1})
