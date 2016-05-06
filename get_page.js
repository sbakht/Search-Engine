var request = require('request');
var cheerio = require('cheerio');
var Task = require("data.task");
var fs = require('fs');
var _ = require('ramda');
var path = require('path');

// TODO - legal headers and timeout so don't get banned
// TODO - dies on non self posts

function downloadUrl(url) {
	console.log(url);
	request({url: url, headers: {'User-Agent': 'Searchinglol Bot'}}, function (error, response, body) {
		if(!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			// console.log($('a.title').html());
			// console.log($('#siteTable .usertext-body p').html());
			var urlInfo = getUrlInfo(url);
			fs.writeFile("./downloaded_html/" + urlInfo.subreddit + '-' + urlInfo.id + ".txt", body, { flag: 'wx' }, function(err) {
				if(err) {
					if(err.code === "EEXIST") {
						console.log(urlInfo.id + " already stored in file");
					}else{
						console.log("Unable to save: ", urlInfo.id, err);
					}
				}else{
					console.log("Data saved to: " + urlInfo.subreddit + '-' + urlInfo.id + '.txt');
				}
			});
		}else{
			console.log("Error reading url:", error);
		}
	});
}

function getUrlInfo(url) {
	var matches = url.match(/\/r\/(\w+)\/comments\/(\w+)\/*/);
	return { subreddit: matches[1], id: matches[2] };
}


// TODO - make async
function getInfoFromFile() {
	$ = cheerio.load(fs.readFileSync("file2.txt"));
	console.log($('a.title').html());
	console.log($('#siteTable .usertext-body p').html());
}
// getInfoFromFile();

function makeFullUrl(end) {
	return 'https://www.reddit.com' + end;
}

function isSelfPost(url) {
	return url.startsWith("/r/leagueoflegends");
}

function getPostLinks(url) {
	var results = [];
	request(url, function (error, response, body) {
		if(!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			$('a.title').map(function(i, el) {
				// console.log($(el).attr("href"));
				results.push($(el).attr("href"));
			});
			_.compose(_.map(_.compose(downloadUrl, makeFullUrl)), _.filter(isSelfPost))(results);
			var nextPage = $("[rel='nofollow next']").attr("href");
			getPostLinks(nextPage);
		}
	});
}

getPostLinks('https://www.reddit.com/r/leagueoflegends/');
// console.log(getUrlInfo('https://www.reddit.com/r/leagueoflegends/comments/4hzmm1/riot_should_lock'));
// $ = cheerio.load('<a href="https://www.reddit.com/r/leagueoflegends/?count=25&amp;after=t3_4hz1ea" rel="nofollow next">next ›</a>');
// console.log($("[rel='nofollow next']").attr("href"))
