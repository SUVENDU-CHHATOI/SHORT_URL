const {v4: uuidv4} = require('uuid');
const User = require("../models/user");
const {setUser} = require('../service/auth')

async function handleUserSignup(req, res) {
    const {name, email, password} = req.body;
    await User.create({name, email, password});
    return res.redirect('/')
}

async function handleUserLogin(req, res) {
    const {name, email, password} = req.body;
    const user = await User.findOne({email, password});
    console.log('user inside handleUserLogin', user)
    if(!user) {
        return res.render('login', {error: 'Invalid username or password'})
    }
    // For stateful authentication
    // const sessionId = uuidv4();
    // setUser(sessionId, user);
    // res.cookie("uid", sessionId)

    // For stateless authentication using cookies
    const token = setUser(user);
    res.cookie("token", token);
    return res.redirect('/')

    // For stateless authentication using Authorization header
    // const token = setUser(user);
    // return res.json({token})
}

module.exports = {
    handleUserSignup,
    handleUserLogin
}