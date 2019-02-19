/* server.js -- The code that processes incoming server requests. 
*/
var express = require('express'); //we are using express.js to process GET and POST requests
var app = express(); //instantiate an express app.
var port = process.env.PORT || 3000; //create a port for listening for requests...
var bodyParser = require('body-parser'); //bodyParser helps us to parse the bodies of incoming requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var routes = require("./api/routes/ssDbRoutes"); //Defines the routes 
routes(app); //Registers the routes with the app
app.listen(port); //Listens for requests (asynchronous!)
console.log('Speedgolf Database RESTful API server started on local port ' + port);