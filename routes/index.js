var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require("ramda");
var minWindow = require('../min_window')

var concat = _.curry(function(start, end) {
  start.push(end);
  return start;
});
var flipProp = _.flip(_.prop);
var mapIndexed = _.addIndex(_.map);


/* GET home page. */
router.get('/', function(req, res, next) {
  var forwardIndex = fs.readFileSync("./indexes/forward_index.json");
  var idToTitles = fs.readFileSync("./indexes/id_to_title_index.json")
  res.render('index', { title: 'Express', forwardIndex: forwardIndex, idToTitles: idToTitles });
});

router.post('/', function(req, res) {
  var query = _.split(" ", req.body.q);
  var forwardIndex = JSON.parse(fs.readFileSync("./indexes/forward_index.json"));
  var invertedIndex = JSON.parse(fs.readFileSync("./indexes/inverted_index.json"));
  var idToTitles = fs.readFileSync("./indexes/id_to_title_index.json")

  var count = {};

  function occurences(accum, word) {
    var obj = invertedIndex[word];
    for(var id in obj) {
      count[id] = (count[id] || 0) + 1;
      if(count[id] == query.length) {
        accum[id] = forwardIndex[id];
      }
    }
    return accum;
  }

  var fwdIndex = _.reduce(occurences, {}, query);

  var getSnippet = _.curry(function(fwdIndex, invertedIndex, words, id) {
    var propOfIndex = flipProp(invertedIndex);
    var positionsOfQuery = _.map(_.compose(_.map(parseInt), _.prop(id), propOfIndex), words);
    var window = minWindow(positionsOfQuery);
    function toPositions(pos, i) {
      pos--;
      if(pos === -1) {
        return positionsOfQuery[i][0];
      }else{
        return positionsOfQuery[i][pos];
      }
    }
    var sort = _.sort((a,b) => a-b);
    var snippetPositions = _.compose(sort, mapIndexed(toPositions))(window);
    var min = _.head(snippetPositions);
    var max = _.last(snippetPositions);
    return _.take(max-min+1, _.drop(min, fwdIndex[id]));
  });

  var snippetFromQuery = getSnippet(fwdIndex, invertedIndex, query);

  var storeSnippet = function(accum, id) {
    accum[id] = snippetFromQuery(id);
    return accum;
  }

  var ids = _.keys(fwdIndex);
  var range = _.reduce(storeSnippet, {}, ids);

  res.render('index', { title: 'Express', forwardIndex: JSON.stringify(fwdIndex), idToTitles: idToTitles , range: JSON.stringify(range)});

});

module.exports = router;

