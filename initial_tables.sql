drop table yelp_user;
drop table yelp_restaurant;
drop table yelp_rating;

CREATE TABLE yelp_users (id serial PRIMARY KEY not null, user_id int not null);
CREATE TABLE yelp_restaurants (id serial PRIMARY KEY not null, restaurant_id int not null, name varchar, city varchar, review_count int, stars real, alcohol varchar, noise_level varchar, attire varchar, good_for_groups boolean, price_range int, delivery boolean, outdoor_seating boolean, takes_reservations boolean, categories varchar);
CREATE TABLE yelp_ratings (ratingid serial PRIMARY KEY not null, user_id int not null, restaurant_id int not null, rating real);

set client_encoding = LATIN1;

COPY yelp_users(user_id) from '/home/sesha/Subjects/Spring2K15/DataViz/Project/yelp_dataset_challenge_academic_dataset/users.dat' DELIMITERS ';';
COPY yelp_restaurants(restaurant_id,name,city,review_count,stars,alcohol,noise_level,attire,good_for_groups,price_range,delivery,outdoor_seating, takes_reservations,categories) from '/home/sesha/Subjects/Spring2K15/DataViz/Project/yelp_dataset_challenge_academic_dataset/restaurants.dat' DELIMITERS ';';
COPY yelp_ratings(user_id, restaurant_id, rating) from '/home/sesha/Subjects/Spring2K15/DataViz/Project/yelp_dataset_challenge_academic_dataset/ratings.dat' DELIMITERS ';';

create index userid_index on yelp_users(user_id);
create index restaurantid_index on yelp_restaurants(restaurant_id);
create index userrating_index on yelp_ratings(user_id);
create index restaurantrating_index on yelp_ratings(restaurant_id);



CREATE RECOMMENDER RestaurantRec ON yelp_ratings
USERS FROM user_id
ITEMS FROM restaurant_id
EVENTS FROM rating
USING UserPearCF;


SELECT * FROM yelp_ratings R
RECOMMEND R.restaurant_id TO R.user_id ON R.rating USING UserPearCF
WHERE R.user_id = 1
ORDER BY R.rating
LIMIT 10;



45634 |   778
   65803 |   629
   13976 |   566
   60139 |   550
  298564 |   546
  178284 |   509
  281632 |   469
   17265 |   421
  146060 |   374
    4163 |   347
   98048 |   339
  297442 |   334
  122636 |   316
  206462 |   314
  175972 |   305
   89100 |   291
  274895 |   290
  187100 |   281
   90820 |   278
  181679 |   278
  163486 |   278
  301576 |   274
  161858 |   268
  337165 |   254
   31756 |   241
  343037 |   240
  115196 |   239
  121533 |   239
  133369 |   235
   17178 |   227
  196207 |   226
  222105 |   224
  350729 |   219
  283752 |   218
  107422 |   215
  366475 |   215
  300761 |   212
  151531 |   209
   85805 |   208
   61505 |   202
  151421 |   201
   45629 |   201
  260501 |   198
    1112 |   196
  346062 |   193
  109467 |   193
   78603 |   192
  323285 |   188
  296864 |   187
   31139 |   180
  301031 |   177
  108077 |   175
  188853 |   169
