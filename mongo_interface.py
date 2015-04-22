from pymongo import MongoClient
client = MongoClient()

db = client.yelp

checkin = db.yelp_checkin
checkin.find({'business_id': 'mVHrayjG3uZ_RLHkLj-AMg'})