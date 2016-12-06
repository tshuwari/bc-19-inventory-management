var express = require('express');
var app    = express();
var routes = require('./route');
routes(app);








 app.listen(5000, function(){
     console.log('Im here now');
 });
 