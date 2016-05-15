function minWindow(lists) {
  var pos = Array(lists.length).fill(0);
  var sol = [];
  var currentSol = Infinity; 
  while(true) {
    var minList = argMin(pos, lists);
    if(minList === -1) {break}
    var minValue = lists[minList][pos[minList]];
    var maxValue = maxVal(pos, lists);
    var nextSol = maxValue - minValue;
    if(nextSol < currentSol && nextSol !== 0) {
      currentSol = nextSol;
      sol = pos.slice();
    }
    if(pos[minList] < lists[minList].length){
    pos[minList]++;
  }
  }
  return sol;
}

function argMin(pos, lists) {
  var min = Infinity;
  var arg = -1;
  for(var i in lists) {
    if(lists[i][pos[i]] < min) {
      min = lists[i][pos[i]];
      arg = i;
    }
  }
  return arg;
}

function argMax(pos, lists) {
  var max = -1;
  var arg = -1;
  for(var i in lists) {
    if(lists[i][pos[i]] > max) {
      max = lists[i][pos[i]];
      arg = i;
    }
  }
  return arg;
}

function maxVal(pos, lists) {
  var arg = argMax(pos, lists);
  return lists[arg][pos[arg]];
}

module.exports = minWindow;