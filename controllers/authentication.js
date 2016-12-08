function validate(req, access_level){
    var user = JSON.parse(req.cookies.user);
    if (user.email && user.access_level == access_level){
        return true;
    } else {
        return false;
    }
}

function validateUser(req) {
    return validate(req, 3);
}

function validateAdmin(req) {
    return validate(req, 2);
}

function validateSuperAdmin(req) {
    return validate(req, 1);
}

module.exports = {
    validateUser: validateUser,
    validateAdmin: validateAdmin,
    validateSuperAdmin: validateSuperAdmin,
};