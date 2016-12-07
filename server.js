var bodyParser = require('body-parser');
var express    = require('express');
var app        = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var database = require('./config/database.js');

app.use(express.static('public'));



// set up template engine
// app.set('view engine', 'ejs');
app.use(bodyParser.json());



app.get('/', function(req, res){
    res.sendFile(__dirname + "/login.html")
});

app.post('/login', urlencodedParser, function(req, res){
    response = {
        email: req.body.email,
        password: req.body.password,
    };

    
    database.ref("users").once("value").then(function(snapshot){
        var users = snapshot.val();
        // res.end(JSON.stringify(response));
        var email = response.email.replace("@gmail.com", "");
        console.log(users[email]['password']);
        if(users[email] === undefined){
            res.end("Invalid user");
        } else if (users[email]['password'] === response.password){
            res.end('Succesful Login')
        } else {
            res.end('Failure')
        }
    });
});



// app.post('/addItem', function(req, res){
//     var id = req.body.id;
//     res.send('Hello');
// });

// app.get('/assets/:id', function(req, res) {
//     var id = req.params.id;

//     db.ref('users').child(id).once('value', function(snap) {
//         console.log(snap.val());
//         res.send(snap.val())
//     })
// })

// app.delete('/assets/:id', function(req, res){
//     var id = req.params.id
// });

// app.get('/delete', function(req, res){
//     res.send('Delete now');
// });

// app.post('/update', function(req, res){
//     res.send('Update');
// });



 app.listen(5000, function(){
     console.log('Im here now');
 });
 