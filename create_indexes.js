var request = require('request');
var cheerio = require('cheerio');
var Task = require("data.task");
var fs = require('fs');
var _ = require('ramda');
var P = require('pointfree-fantasy');

function saveToFile(obj) {
	return new Task(function(reject, result) {
		var data = getUrlInfo(obj.url);
		fs.writeFile("./downloaded_html/" + data.subreddit + '-' + data.id + ".txt", data.body, { flag: 'wx' }, function(err) {
			if(err) {
				if(err.code === "EEXIST") {
					reject(data.id + " already stored in file");
				}else{
					console.log("Unable to save: ", data.id, err);
					reject("Unable to save: ", data.id, err);
				}
			}else{
				console.log("Data saved to: " + data.subreddit + '-' + data.id + '.txt');
				result(obj);
			}
		});
	});
}

function bodyText(html) {
	$ = cheerio.load(html);
	// console.log($('a.title').html());
	var results = [];
	$('#siteTable .usertext-body p').map(function(i, el) {
		results.push($(el).html());
	});
	return results.join(' ');
}

//getPageHtml :: FULLURL -> Task(HTML)
var getPageHtml = function(url) {
	return new Task(function(reject, result) {
		request({url: url, headers: {'User-Agent': 'Searchinglol Bot'}}, function (error, response, body) {
			if(!error && response.statusCode == 200) {
				result({url: url, html: body});
			}else{
				reject(error);
			}
		});
	})
}

function getUrlInfo(url) {
	var matches = url.match(/\/r\/(\w+)\/comments\/(\w+)\/*/);
	return { subreddit: matches[1], id: matches[2] };
}

var getUrls = function(filename) {
	return new Task(function(reject, result) {
		fs.readFile(filename, function(err, body) {
			if(err) {
				reject(err);
			}
			result(body.toString());
		});
	});
}

var forwardIndex = {};
var invertedIndex = {};
var addForwardIndex = function(obj) {
	var id = getUrlInfo(obj.url).id;
	var body = bodyText(obj.html);
	var text = body.split(' ');
	if(!forwardIndex[id]) {
		forwardIndex[id] = text;
	}
	fs.writeFileSync("./indexes/forward_index.json", JSON.stringify(forwardIndex));
	return obj;
}

var addInvertedIndex = function(obj) {
	var id = getUrlInfo(obj.url).id;
	var body = bodyText(obj.html);
	var text = body.split(/[\s,\.]+/);
	text.map(function(word, position) {
		if(!invertedIndex[word]) {
			invertedIndex[word] = {};
		}
		if(!invertedIndex[word][id]) {
			invertedIndex[word][id] = [];
		}
		invertedIndex[word][id].push(position);
	});
	fs.writeFileSync("./indexes/inverted_index.json", JSON.stringify(invertedIndex));
	return obj;
}

var forwardIndex = fs.readFileSync("./indexes/forward_index.json");
var invertedIndex = fs.readFileSync("./indexes/inverted_index.json");
if(!forwardIndex.length) {
	forwardIndex = '{}';
}
if(!invertedIndex.length) {
	invertedIndex = '{}';
}
forwardIndex = JSON.parse(forwardIndex);
invertedIndex = JSON.parse(invertedIndex);

//app :: FILENAME -> Task(URLS) -> Task([URLS]) -> Task([Task(obj)]) -> Task([Task(obj)]) -> Task([Task(obj)])
var app = _.compose(_.map(_.map(_.map(_.compose(addInvertedIndex, addForwardIndex)))), _.map(_.map(P.chain(saveToFile))), _.map(_.map(getPageHtml)),  _.map(_.split("\n")), getUrls);

app("downloaded_urls.txt").fork(err => console.log(err), tasks => 
	_.map(task => task.fork(err => console.log(err), body => console.log("Index created")), tasks)
);
