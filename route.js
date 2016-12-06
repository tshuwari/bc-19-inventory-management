
var homeController = require('./controllers/home');
var Assets = require('./controllers/assets');
module.exports = function(app) {

    app.get('/', homeController);


    app.get('/assets', Assets.getAssets);




}