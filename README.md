FixPhrase
=========

FixPhrase is a simple algorithm and word list that enable converting a pair of GPS coordinates to 
a four-word phrase and back again. This could be useful in situations where it's easier to deal with
a few words instead of a long series of numbers.

There are currently JavaScript and PHP libraries available. Both are a single file containing the
word list and the encode/decode algorithms, and both function identically.


Features
--------

* Every phrase corresponds to just one point on Earth
* Words can be input in any order without affecting the output coordinates
* Accurate to 11 meters when a full phrase is used
* Partial phrases can be used, with lower accuracy:
    * The first two words of a phrase (when the words are ordered alphabetically) are sufficient to locate a large city (accuracy of at least 11.1km)
    * The first three words are sufficient to locate a neighborhood (accuracy of at least 1.1km)
    * All four words pinpoint a location to an accuracy of at least 11 meters.


How it Works
------------

These are the steps to convert a latitude and longitude pair into a word phrase.

1. Take a pair of coordinates and round them to four decimal places.
2. Add 90 to the latitude and 180 to the longitude to remove the minus sign.
3. Remove the decimal point and left-pad with zeros so latitude and longitude are seven digits long.
4. Take the first four digits of each, then add 2000 to the longitude.
5. You now have two four-digit numbers. These correspond to two words in the word list. These two words will
give you a location accurate to 11.1 km.
6. Take the last three digits from the latitude (we'll call them A, B, and C) and the longitude (we'll call them X, Y, and Z).
7. Arrange the digits into two sets: `ABX CYZ`.
8. Add 5610 to the first set, and add 6610 to the second set.
9. Look up the corresponding words. You now have four words that represent a location accurate to 0.0001 degrees (11 meters).

To convert a phrase into latitude and longitude, do the reverse:

1. Look up the indices for each word.
2. Subtract the offsets that were added previously.
3. The index for the first word, after dividing by 10 and subtracting 90, is the latitude. The adjusted index for the second word, after dividing by 10 and subtracting 180, is the longitude.
4. You now have the latitude and longitude, accurate to 0.1 degrees (11.1km).
5. Take the adjusted index of the third word and pad with zeros on the left to three places. Append the first digit to the latitude, and append the third digit to the longitude.
6. You now have a latitude and longitude with precision of 0.01 degrees (1.1km).
7. Append the second digit of the third word to the latitude.
8. Take the adjusted index of the fourth word, pad with zeros to three places, append the first digit to the latitude, and append the second and third digits to the longitude.
9. You now have the full coordinates, accurate to four decimal places (0.0001 degrees, 11 meters).


Terms of Use
------------

* You may implement the algorithm described above (and in the code) with no restrictions whatsoever.
* You may use the code in this repository according to the terms of LICENSE.md.
