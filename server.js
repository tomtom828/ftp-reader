// Local vs. Heroku FTP Credentials
var ftpConfig;
if (process.env == "production") {
  ftpConfig = {
    host: process.env.HOST,
    port: 21,
    user: process.env.USER,
    pass: process.env.PASS
  }
}
else {
  ftpConfig = require('./config.json');
}


// Node Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var JSFtp = require("jsftp");
var ftp = new JSFtp(ftpConfig);


// Set up Express + Body bodyParser
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Serve Static elements
app.use(express.static('public'));

// Set Up Handlebars
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


// =============== Start of Routes ===============


// Index Route
app.get('/', function(req,res) {
  res.render('index');
});



// Basic Index Route
app.get('/inventory', function(req,res) {

  // Read the README.txt file from FTP
  var str = ""; // Will store the contents of the file 
  ftp.get('QSPLLC_INVENTORY_with_PALLETS_(07-28-17).csv', function(err, socket) {
    
    if (err) return;
 
    socket.on("data", function(d) { str += d.toString(); })
    socket.on("close", function(hadErr) {
      if (hadErr){
        console.error('There was an error retrieving the file.');
      }
      else {

        // Remove any whitespace
        str = str.trim();


        // Split result by enter key
        str = str.split("\n");

        // Iterate over each enter split and split by commas
        var result = [];
        for (var i = 0; i < str.length; i++) {
          result.push( str[i].split(",") );
        }

        // Seperate Table Header from Body
        var tblHeader = result[0];
        var tblBody = result.slice(1);

        var tableResult = {
          header: tblHeader,
          body: tblBody
        }

        // Render Index Page
        res.render('inventory', {hbsObject: tableResult});

      }
    });
    socket.resume();
  });

});



// Catch All 404 Route (must be the last route listed)
app.get('*', function(req,res) {
  res.render('404');
});


// =============== End of Routes ===============


// Open Server
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Listening on port ' + port);
});