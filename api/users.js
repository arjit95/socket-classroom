const express = require('express');
const router = express.Router();

const users = require('../lib/users');
const rooms = require('../lib/rooms');

router.post('/login', function (req, res) {
    const username = req.body.username;
    if ( !username ) {
        return res.json({status: {code: 500, error: 'Please specify username'}});
    }

    if (users.exists(username)) {
        return res.json({status: {code: 500, error: 'User already exists'}});
    }

    req.session.token = users.add(username);
    req.session.save();
    res.json({status: {code: 200}});
});

const removeHandler = function (req, res) {
    const token = req.session.token;
    const decoded = users.verify(token);

    if (decoded.status.code !== 200) {
        req.session.destroy();
        return res.redirect('/');
    }

    const username = decoded.result.username;

    if (req.session.roomId) {
        const subscribedUsers = rooms.destroy(req.session.roomId, username);
        if (subscribedUsers instanceof Array) {
            subscribedUsers.forEach((user) => users.deleteRoom(req.session.roomId, user));
            req.io.emit('room_removed', req.session.roomId);
        }
    }

    const response = users.remove(token);    
    if (typeof response == 'string') {
        return res.json({status: {code: 500, error: response.toString()}});
    }

    if (response instanceof Array) {
        response.forEach((room) => {
            rooms.remove(room, username);
            req.io.emit('room_removed', room);
        });
    }

    req.session.destroy();
    res.redirect('/');
};

router.post('/remove', function (req, res, next) {
    if (!req.session.token) {
        return res.json({status: {code: 401, error: 'Please supply authentication token'}});
    }

    next();
});

router.post('/remove', removeHandler);
router.get('/logout', removeHandler);

// Fetches the Available rooms for the user..
router.post('/fetch', function (req, res) {
    if (!req.session.token) {
        return res.json({status: {code: 401, error: 'Please supply authentication token'}});
    }

    let response = users.verify(req.session.token);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    if ( !users.exists(response.result.username) ) {
        return res.json({status: {code: 401, error: 'The supplied user does not exists'}});
    }

    if (req.session.roomId) {
        return res.json({status: {code : 405, error: 'Cannot access other rooms while hosting.'}});
    }

    response = users.getRooms(req.session.token);
    if (typeof response === 'string') {
        return res.json({status: {code: 401, error: response}});
    }

    res.json({status: {code: 200}, result: response});
});

module.exports = router;