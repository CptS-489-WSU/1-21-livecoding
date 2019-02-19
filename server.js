/* server.js -- The code that processes incoming server requests. 
*/

var express = require('express'); //we are using express.js to process GET and POST requests
var app = express(); //instantiate an express app.
var port = process.env.PORT || 3000; //create a port for listening for requests...
//TO DO: Fill in additional code
app.listen(port); //Listens for requests (asynchronous!)
console.log('Speedgolf Database RESTful API server started on local port ' + port);