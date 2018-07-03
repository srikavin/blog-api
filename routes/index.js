var express = require('express');
var router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if (!user.validPassword(password)) {
                return done(null, false, {message: 'Incorrect password.'});
            }
            return done(null, user);
        });
    }
));

router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


router.get('/loginSuccess', function (req, res) {
    res.send({status: 'success'})
});

router.get('/loginFail', function (req, res) {
    res.send({status: 'failure'})
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/loginSuccess',
        failureRedirect: '/loginFail'
    })
);

module.exports = router;
