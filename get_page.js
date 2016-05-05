var request = require('request');
var cheerio = require('cheerio');
var Task = require("data.task");
var fs = require('fs');
var _ = require('ramda');

// TODO - legal headers and timeout so don't get banned
// TODO - dies on non self posts

function downloadUrl(url) {
	request('https://www.reddit.com' + url, function (error, response, body) {
		if(!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			console.log($('a.title').html());
			console.log($('#siteTable .usertext-body p').html());
		}
	}).pipe(fs.createWriteStream(getId(url)));
}

function getId(str) {
	var postId = str.match(/comments\/(\w+)\/*/)[1];
	console.log(postId);
	return postId;
}


// TODO - make async
function getInfoFromFile() {
	$ = cheerio.load(fs.readFileSync("file2.txt"));
	console.log($('a.title').html());
	console.log($('#siteTable .usertext-body p').html());
}
getInfoFromFile();

function getPostLinks() {
	var results = []
	request('https://www.reddit.com/r/leagueoflegends/', function (error, response, body) {
		if(!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			$('a.title').map(function(i, el) {
				console.log($(el).attr("href"));
				results.push($(el).attr("href"));
			});
			_.map(downloadUrl, results);
		}
	});
}

getPostLinks();
