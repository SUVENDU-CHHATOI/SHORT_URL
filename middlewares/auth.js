
const {getUser} = require('../service/auth');

async function checkForAuthentication(req, res, next) {
    // For stateless auhtentication using headers
    // const authorizationHeaderValue = req.headers['authorization'];
    // req.user = null;

    // if(!authorizationHeaderValue || !authorizationHeaderValue.startsWith('Bearer ')) {
    //     return next();
    // }

    // const token = authorizationHeaderValue.split('Bearer ')[1];
    // const user = getUser(token);

    // req.user = user;
    // return next();



    // For stateless authentication using cookies
const tokenCookie = req.cookies.token;
req.user = null;
 if(!tokenCookie) {
     return next();
 }

 const token = tokenCookie;
 const user = getUser(token);

 req.user = user;
 return next();
}

async function restrictToLoggedinUserOnly(req, res, next) {
    // For stateless authentication using cookies
    // const userUid = req?.cookies?.token; 

    // For stateless authentication using Authorization header
    const userUid = req?.headers["authorization"]; 

    if(!userUid) {
        return res.redirect('/login')
    }
    
    const token = userUid.split('Bearer ')[1];
    const user = getUser(token);

    if(!user) {
        res.clearCookie('uid'); // Clear the invalid cookie
        return res.redirect('/login')
    }

    req.user = user;
    next();
}

async function checkAuth(req, res, next) {
    // For stateless authentication using cookies
    // const userUid = req?.cookies?.uid; 
    // const user = getUser(userUid);

    // For stateless authentication using Authorization header
    const userUid = req?.headers["authorization"];
    const token = userUid?.split('Bearer ')[1];
    const user = getUser(token);

    if (!user) {
        res.clearCookie('uid'); // Clear the invalid cookie
    }

    req.user = user;
    next();
}

function restrictTo(roles = []){
    return function (req, res, next){
        if(!req.user) return res.redirect('/login');
        if(!roles.includes(req.user.role)) return res.end('You are not authorized to access this route');
        return next()
    }
}

module.exports = {
    // restrictToLoggedinUserOnly,
    // checkAuth,
    checkForAuthentication,
    restrictTo
}


