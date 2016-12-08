var database = require('../config/database.js');
var promise = require('promise');
var _ = require('lodash');

function getAdminAssets(){
    var assets, assignees;
    return new Promise(function(resolve, reject){
        database.ref('assets').once('value').then(function(snapshot){
            assets = snapshot.val();
            database.ref('assignees').once('value').then(function(snapshot){
                assignees = snapshot.val();
                var notifications = [];
                var assetsDetailedInfo = [];
                _.each(assets, function(assetInfo, serial_no){
                    _.each(assignees, function(assigneeInfo, assigneeName){
                      if (assetInfo.assigned && assigneeInfo.assets[serial_no]) { //If assets is assigned record assignee_name
                        if (assigneeInfo.assets[serial_no]['reclaim_date']) {
                          notification = _.merge(assetInfo, {assignee: assigneeName, reclaim_date: assigneeInfo.assets[serial_no]['reclaim_date'], serialNo: serial_no});
                          notifications.push(notification);
                        }
                        assetDetailedInfo = _.merge(assetInfo, { assignee: assigneeName, reclaim_date: assigneeInfo.assets[serial_no]['reclaim_date'], serialNo: serial_no });
                        assetsDetailedInfo.push(assetDetailedInfo);
                      } else { //Since asset is not assigned record just the assetInfo
                        assetDetailedInfo = _.merge(assetInfo, { assignee: '' , serialNo: serial_no })
                        assetsDetailedInfo.push(assetDetailedInfo)
                      }
                    });
                });
                return resolve({ notifications: notifications, assets: assetsDetailedInfo});
            });
        });
    });
};

function getUserAssets(email) {
    return new Promise(function(resolve, reject){
        var assets, userAssets;
        var assetsInfo = [];
        database.ref('assets').once('value').then(function(snapshot){
            assets = snapshot.val();
            database.ref('assignees/'+email+'/assets').once('value').then(function(snapshot){
                userAssets = snapshot.val();
                _.each(userAssets, function(userAsset, serial_no){
                    if (userAsset.return_date === ""){
                        var assetInfo = _.merge(assets[serial_no], { reclaimDate: userAsset.reclaim_date })
                        assetsInfo.push(assetInfo);
                    }
                });
                return resolve({ assets: assetsInfo });
            });
        });
    });
}

function getUsers(access_level){
    return new Promise(function(resolve, reject){
        var users;
        var staffUsers = [];
        database.ref('users').once('value').then(function(snapshot){
            users = snapshot.val();
            _.each(users, function(userInfo, user){
                if(userInfo.access_level == access_level){
                    userInfo = _.merge(userInfo, { email: user+'@gmail.com' });
                    staffUsers.push(userInfo);
                }
            });
            return resolve(staffUsers);
        });
    });
}

function getAdminUsers(){
    return getUsers(2);
}


function getStaffUsers(){
    return getUsers(3);
}

module.exports = {
    getUserAssets: getUserAssets,
    getAdminAssets: getAdminAssets,
    getStaffUsers: getStaffUsers,
    getAdminUsers: getAdminUsers,
}
