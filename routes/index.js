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
  var query = req.body.q;
  var forwardIndex = JSON.parse(fs.readFileSync("./indexes/forward_index.json"));
  var invertedIndex = JSON.parse(fs.readFileSync("./indexes/inverted_index.json"));
  var idToTitles = fs.readFileSync("./indexes/id_to_title_index.json")

  var idOccurences = [];
  var obj = invertedIndex[query];
  var newfwd = {};
  for(var id in obj) {
  	idOccurences.push(id);
    newfwd[id] = forwardIndex[id];
  }

  var test = function(id) {
  	return idOccurences.indexOf(id) !== -1;
  }
  console.log(newfwd);



  res.render('index', { title: 'Express', forwardIndex: JSON.stringify(newfwd), idToTitles: idToTitles });

});

module.exports = router;
