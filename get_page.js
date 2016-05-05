var request = require('request');

// request('http://www.google.com', function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(body) // Show the HTML for the Google homepage.
//   }
// })

request.get('https://www.reddit.com/r/leagueoflegends/comments/4hvlvj/singeds_mega_adhesive_should_ground/').pipe(process.stdout);