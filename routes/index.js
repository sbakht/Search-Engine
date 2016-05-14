var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require("ramda");

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

  var positions = {};
  var range = {};
  for(var id in fwdIndex) {
    positions[id] = [];
    query.forEach(function(word) {
      // positions.push(invertedIndex[word][id]);
      positions[id] = _.concat(positions[id], _.map(parseInt, invertedIndex[word][id]))
    });
    var diff = function(a, b) { return a - b; };
    positions[id] = _.sort(diff, positions[id]);
    console.log(positions[id])
    var min = _.head(positions[id]);
    var max = _.last(positions[id]);
    console.log(max, min)
    console.log(max - min)
    range[id] = _.take(max-min+1, _.drop(min, fwdIndex[id]));
  }

  res.render('index', { title: 'Express', forwardIndex: JSON.stringify(fwdIndex), idToTitles: idToTitles , range: JSON.stringify(range)});

});

module.exports = router;
