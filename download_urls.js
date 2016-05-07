var request = require('request');
var cheerio = require('cheerio');
var Task = require("data.task");
var fs = require('fs');
var _ = require('ramda');


//makeFullUrl :: URL -> FULLURL
function makeFullUrl(end) {
	if(!end.startsWith("https://www.reddit.com")) {
		return 'https://www.reddit.com' + end;
	}
	throw Error("problem making full url");
}

//isSelfPost :: String -> Bool
function isSelfPost(url) {
	return url.startsWith("/r/leagueoflegends");
}

//getPageHtml :: FULLURL -> Task(HTML)
var getPageHtml = function(url) {
	return new Task(function(reject, result) {
		request(url, function (error, response, body) {
			if(!error && response.statusCode == 200) {
				result(body);
			}else{
				reject(error);
			}
		});
	})
}

//postLinks :: HTML -> [URL]
var postLinks = function(data) {
	var results = [];
	$ = cheerio.load(data);
	$('a.title').map(function(i, el) {
		results.push($(el).attr("href"));
	});
	return results;
}

//saveUrls :: [FULLURL] -> Task([FULLURL])
var saveUrls = function(urls) {
	return new Task(function(reject, result) {
		var joinedUrls = urls.join("\n") + "\n";
		fs.writeFile("downloaded_urls.txt", joinedUrls, { flag: 'a' }, function(err) {
			if(err) {
				reject(err);
			}else{
				result();
			}
		});
	});
}

//selfPostLinks :: HTML -> [URL] -> [FULLURL] 
var selfPostLinks = _.compose(_.map(makeFullUrl), _.filter(isSelfPost), postLinks);

var app = function(startUrl) {
	getPageHtml(startUrl).fork(err => console.log(err), function(html) {
		_.compose(saveUrls, selfPostLinks)(html).fork(err => console.log(err), (data) => console.log("Saved urls to downloaded_urls.txt"));
		$ = cheerio.load(html);
		app($("[rel='nofollow next']").attr("href"));
	});
}

app('https://www.reddit.com/r/leagueoflegends/');