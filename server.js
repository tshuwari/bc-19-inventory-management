var bodyParser = require('body-parser');
var express    = require('express');
var session = require('express-session');
var app        = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var cookieParser = require('cookie-parser');
var firebase = require('./config/database');
var database = firebase.dbRef;
var auth = firebase.auth;


app.use(session({
    secret: "SECRET",
    saveUninitialized: true,
    resave: true,
    cookie: {}
}));

app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.use(bodyParser.json());



app.get("/register", function(req, res) {
    res.render('pages/register');
});

app.post("/register", urlencodedParser, function(req, res) {
    var body = req.body;
    auth.createUserWithEmailAndPassword(body.email, body.password).then(function(userDetailsFromFirebase) {
        var user = {email: userDetailsFromFirebase.email, uid: userDetailsFromFirebase.uid,access_level: 3,name: body.name};
        database.ref("users/"+user.uid).set(user);
        req.session.user = JSON.stringify(user);
        res.redirect("/user/home");
    }).catch(function(err){
        res.send(err);
    })
})


app.get('/login', function(req, res){
    res.render('pages/login');
});

app.post('/login', urlencodedParser, function(req, res){
    var response = {
        email: req.body.email,
        password: req.body.password,
    };

    auth.signInWithEmailAndPassword(response.email, response.password).then(function(userDetailsFromFirebase){
        database.ref('users/' +userDetailsFromFirebase.uid).on('value', function(user){
            req.session.user = JSON.stringify(user.val());
            // res.send(user.val());
            var userObj = user.val();
            if(userObj.access_level === 3){
                res.redirect('user/home');
            }else if(userObj.access_level === 2){
                res.redirect('superadmin/home');
            }
            // else{
            //     res.redirect('superadmin/home');
            // }
                
        });
    }).catch(function(err){
        res.send(err);
    });

});

app.get('/superadmin/home', function(req, res){
    
    database.ref('users').on('value', function(snapshot){
        var usersInfo =[];
        var userAssigned = [];
        var users = snapshot.val();
        var uKeys = Object.keys(users);
        for(var user in users) {
            if(users[user].access_level <= 2) {
                usersInfo.push(users[user]);
            }
            if(users[user].access_level === 3){
                userAssigned.push(users[user]);
            }
        }
        
        database.ref('assets').on('value', function(snapshot){
            var assets = snapshot.val();
            var keys = Object.keys(assets);
            var assigned = [];
            var unassigned = [];
            for(var asset in assets){
                
                if(assets[asset].assigned === true){
                    assigned.push(asset);
                }else{
                    unassigned.push(asset);
                }

            }


        database.ref('assigned_assets').on('value', function(snapshot){
            var assignees = snapshot.val();
            var assigneeKeys = Object.keys(assignees);
        
            
            res.render('pages/admin', {
                assets: assets,
                adminUsers: usersInfo,
                assetKeys: keys,
                assetsAssigned: assigned,
                assetsUnassigned: unassigned,
                userKeys: userAssigned,
                assignees: assignees,

            });
        });
        
    });
    
});
});

app.get('/admin/home', function(req, res){
    
    database.ref('users').on('value', function(snapshot){
        var usersInfo =[];
        var userAssigned = [];
        var users = snapshot.val();
        var uKeys = Object.keys(users);
        for(var user in users) {
            if(users[user].access_level <= 2) {
                usersInfo.push(users[user]);
            }
            if(users[user].access_level === 3){
                userAssigned.push(users[user]);
            }
        }
        
        database.ref('assets').on('value', function(snapshot){
            var assets = snapshot.val();
            var keys = Object.keys(assets);
            var assigned = [];
            var unassigned = [];
            for(var asset in assets){
                
                if(assets[asset].assigned === true){
                    assigned.push(asset);
                }else{
                    unassigned.push(asset);
                }

            }


        database.ref('assigned_assets').on('value', function(snapshot){
            var assignees = snapshot.val();
            var assigneeKeys = Object.keys(assignees);
        
            
            res.render('pages/admin1', {
                assets: assets,
                adminUsers: usersInfo,
                assetKeys: keys,
                assetsAssigned: assigned,
                assetsUnassigned: unassigned,
                userKeys: userAssigned,
                assignees: assignees,

            });
        });
        
    });
    
});
});


app.get('/user/home', function(req, res){
    console.log(req.session.user, "test");
    var user = JSON.parse(req.session.user);
    database.ref('assigned_assets/' +user.name).on('value', function(snapshot){
            var assets = snapshot.val();
            var assigned = [];
            var unassigned = [];
            for(var asset in assets){
                if(assets[asset].assigned === true){
                    assigned.push(asset);
                }else{
                    unassigned.push(asset);
                }

            }
            
    res.render('pages/fellow', {user: user, assetsAssigned: assigned, assetsUnassigned: unassigned});

            });
        
    
});

app.post('/user/lost', urlencodedParser, function(req, res){
    var serial = req.body.serial_no;
    var reportInfo = {
        user_name: req.body.user_name,
        asset_name: req.body.asset_name,
        andela_code: req.body.andela_code,
    }
    database.ref('lost_assets/' +serial).set(reportInfo)
    res.redirect('/user/home');
});

app.post('/user/found', urlencodedParser, function(req, res){
    var serial = req.body.serial_no;
    var reportInfo = {
        user_name: req.body.user_name,
        asset_name: req.body.asset_name,
        andela_code: req.body.andela_code,
    }
    database.ref('found_assets/' +serial).set(reportInfo)
    res.redirect('/user/home');
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
    res.redirect('/superadmin/home');
});


app.post('/assets/admin', urlencodedParser, function(req, res){
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

app.post('/assignees', urlencodedParser, function(req, res){
    
    database.ref('assets/'+req.body.serial_no).on('value', function(asset) {
        var updates = {};
        var assetUpdate = asset.val();
        assetUpdate['assigned'] = true;
        updates['assets/'+req.body.serial_no] = assetUpdate;
        
        database.ref().update(updates);
        database.ref('assigned_assets/'+req.body.name).push(req.body);


        res.redirect('/superadmin/home');
    })
   
 });

 app.post('/assignees/admin', urlencodedParser, function(req, res){
    
    database.ref('assets/'+req.body.serial_no).on('value', function(asset) {
        var updates = {};
        var assetUpdate = asset.val();
        assetUpdate['assigned'] = true;
        updates['assets/'+req.body.serial_no] = assetUpdate;
        
        database.ref().update(updates);
        database.ref('assigned_assets/'+req.body.name).push(req.body);


        res.redirect('/admin/home');
    })
   
 });


app.post('/admins', urlencodedParser, function(req, res){
    var body = req.body;
    auth.createUserWithEmailAndPassword(body.email, body.password).then(function(userDetailsFromFirebase) {
        var user = {email: userDetailsFromFirebase.email, uid: userDetailsFromFirebase.uid,access_level: 2, name: req.body.name};
        database.ref("users/"+user.uid).set(user);
        req.session.user = JSON.stringify(user);
        res.redirect("/superadmin/home");
    }).catch(function(err){
        res.send(err);
    })
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



app.listen(process.env.PORT || 5000, function(){
});
 