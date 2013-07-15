/*
Torrent Picking Algorithm

Search each torrent site for the correct torrent, verify by IMDB id

Once verified, we can then get the highest quality set by the user they they prefer
Then, check by seeds and leechers.

Possibly add size checker to make sure we have enough space on the disk.
*/
var torrents = require('./torrents');
var async = require('async');
var $ = require('jquery'); //TODO we can take this out if we find something better for InArray
var search = function (query) {
	if(query === null) {
		throw new Error('No query found');
	}
	var ptpResults = torrents.search.movie(query, 'ptp'); //PassThePopcorn
	var bbResults = torrents.search.movie(query, 'bb'); //BaconBits
	var comparedResult = compareIDs(ptpResults, bbResults); //Ex: [0045274, 0079182, 0077945]
	if(comparedResult.length === 0) {
		throw new Error('No results found');
	}
	var ptpMovie;
	var bbMovie;
	// Take the first ID because we are assuming it matches what the user wants. TODO This might change
	// TODO need to determine which has better seeder size before we decide which site to choose from then we get the quality.
	async.parallel([
		function (callback) {
			async.forEach(ptpResults, function (result) {
				if(result.ImdbId === comparedResult[0]) {
					ptpMovie = result;
				}
			});
			if(ptpMovie === null) {
				throw new Error('Problem finding PTP movie in IMDB List');
			}
			callback();
		},
		function (callback) {
			async.forEach(bbResults, function (result) {
				if(result.ImdbId === comparedResult[0]) {
					bbMovie = result;
				}
			});
			if(bbMovie === null) {
				throw new Error('Problem finding BaconBits movie in IMDB List');
			}
		}
	]);
	compareQuality(ptpMovie, bbMovie);
}
function compareIDs(ptpResults, bbResults) {
	var comparedIDs = [];
	var ptpIDs = [];
	var bbIDs = [];
	// Copy imdbIDs into two seperate arrays, then compare one array with next to get array of common ones.
	async.parallel([
		function (callback) {
			var ptpResultsCounter = 0;
			async.forEach(ptpResults, ptpResultsCounter, function () {
				ptpIDs.push(ptpResults[ptpResultsCounter].ImdbId);
			});
			callback();
		},
		function (callback) {
			var bbResultsCounter = 0;
			async.forEach(bbResults, bbResultsCounter, function () {
				bbIDs.push(bbResults[bbResultsCounter].ImdbId); //TOOD need to make sure this is where the IMDB ids are.
			});
			callback();
		}
	]);
	for(var ptpIdCounter = 0; ptpIdCounter < ptpIDs.length; ptpIdCounter++) {
		if($.inArray(ptpIDs[ptpIdCounter], bbIDs) !== -1) {
			comparedIDs.push(ptpIDs[ptpIdCounter]);
		}
	}
	return comparedIDs;
}