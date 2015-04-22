import psycopg2
from pymongo import MongoClient

class DBDriver(object):
    def __init__(self):
        self.pg_dbname = 'yelp'
        self.pg_port = '5432'
        self.pg_host = 'localhost'
        client = MongoClient()
        self.db = client.yelp

    def get_connection(self):
        return psycopg2.connect("dbname="+self.pg_dbname+" port="+self.pg_port+" host="+self.pg_host)

    def fetch_recommendations(self, user_id, city):
        pg_connection = self.get_connection()
        cursor = pg_connection.cursor()

        selection_columns ="M.restaurant_id, M.name, M.city, M.review_count, M.stars, M.alcohol, M.noise_level,"\
                            " M.attire, M.good_for_groups, M.price_range, M.delivery, M.outdoor_seating, M.takes_reservations, M.categories"

        query = "SELECT "+ selection_columns +" FROM yelp_ratings R, yelp_restaurants M " \
                "RECOMMEND R.restaurant_id TO R.user_id ON R.rating USING SVD " \
                "WHERE R.user_id = "+ str(user_id) +" and R.restaurant_id = M.restaurant_id and M.city = '"+city+"' " \
                "ORDER BY R.rating desc " \
                "LIMIT 15;"

        cursor.execute(query)
        
        results = cursor.fetchall()
        cursor.close()
        pg_connection.close()

        return results

    # def __return_as_json(data):

    # def fetch_restaurant_details(self, restaurant_ids):

