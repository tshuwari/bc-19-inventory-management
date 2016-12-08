var bodyParser = require('body-parser');
var express    = require('express');
var app        = express();
var actions    = require('./controllers/actions.js');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var cookieParser = require('cookie-parser');
var database = require('./config/database.js');
var authentication = require('./controllers/authentication.js');


app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.use(bodyParser.json());

app.get('/login', function(req, res){
    res.render('pages/login');
});

app.post('/login', urlencodedParser, function(req, res){
    response = {
        email: req.body.email,
        password: req.body.password,
    };
    
    database.ref("users").once("value").then(function(snapshot){
        var users = snapshot.val();
        var email = response.email.replace("@gmail.com", "");
        if(!users[email]){
            res.end("Invalid user");
        } else if (users[email]['password'] === response.password){
            res.cookie('user', JSON.stringify(users[email]));
            res.redirect('/user/home');
        } else {
            res.end('Failure')
        }
    });
});

app.get('/superadmin/home', function(req, res){
    if (!authentication.validateSuperAdmin(req)){
        actions.getAdminAssets().then(function(payload){
            actions.getAdminUsers().then(function(adminUsers){
                console.log(adminUsers);
                res.render('pages/admin', { notifications: payload.notifications, assets: payload.assets, adminUsers: adminUsers });
            });
        });
    } else {
        res.render('pages/unauthorized');
    }
});

app.get('/admin/home', function(req, res){
    if (!authentication.validateAdmin(req)){
        actions.getAdminAssets().then(function(payload){
            res.render('pages/admin1', { notifications: payload.notifications, assets: payload.assets });
        });
    } else {
        res.render('pages/unauthorized');
    }
});

app.get('/user/home', function(req, res){
    if (!authentication.validateUser(req)){
        var user = JSON.parse(req.cookies.user);
        actions.getUserAssets(user.email).then(function(payload){
            res.render('pages/fellow', payload);
        });
    } else {
        res.render('pages/unauthorized');
    }
});

app.post('/assets', urlencodedParser, function(req, res){
    var items = {};
    var itemInfo = {
        name: req.body.name,
        andela_code: req.body.andela_code,
        description: req.body.description,
        date_bought: req.body.date_bought,
        assigned: false,
    }
    database.ref('assets/'+req.body.serial_no).set(itemInfo);
    res.redirect('/admin/home');
});

app.post('/admins', urlencodedParser, function(req, res){
    var admin = {};
    var email = req.body.email.replace("@gmail.com", "");
    var adminInfo = {
        name: req.body.name,
        password: req.body.password,
        access_level: 2
    };
    database.ref('users/'+email).set(adminInfo);
    res.redirect('/admin/home');
});

app.put('/assets/:serialno', urlencodedParser, function(req, res){
    var serialNo = req.params.serialno;
    database.ref('assets/'+serialNo).set({ assigned: req.body.assigned });
    res.json({  status: 'Succesful' });
});


app.get('/user/assets', function(req, res){
    var user = JSON.parse(req.cookies.user);
    actions.getUserAssets(user.email).then(function(payload){
        res.json(payload);
    });
});

app.get('/users', function(req, res){
    actions.getUsers().then(function(users){
        res.send(users);
    });
});


app.listen(5000, function(){
 console.log('Im here now');
});
 