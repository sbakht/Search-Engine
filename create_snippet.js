var _ = require("ramda");
var minWindow = require('./min_window')

var flipProp = _.flip(_.prop);
var mapIndexed = _.addIndex(_.map);

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

module.exports = getSnippet;