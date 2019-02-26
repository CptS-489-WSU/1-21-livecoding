//db.js  -- This file sets up the local db connection

//The express.js mysql module
var mysql = require('mysql');

//create a pool of connections that will be lazily created as needed.
/* var connectPool = mysql.createPool({
    host: 'localhost',
    database: 'speedgolfdb',
    user: 'root',
    password: 'mypwd'
}); */

//module.exports = connectPool; //export for

const connection = mysql.createConnection({
    host: 'localhost',
    database: 'speedgolfdb',
    user: 'root',
    password: 'Vl95@isbrd'
});

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
    } else {
      console.log("Connected to DB!");
    }
}); 

module.exports = connection; //export