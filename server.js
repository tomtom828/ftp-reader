// Import FTP Credentials
var ftpConfig = require('./config.json');

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


// Basic Index Route
app.get('/', function(req,res) {


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

        // Render Index Page
        res.render('index', {hbsObject: str});
        
      }
    });
    socket.resume();
  });


});

// Open Server
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Listening on port ' + port);
});