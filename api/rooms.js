const express = require('express');
const router = express.Router();

const users = require('../lib/users');
const rooms = require('../lib/rooms');

router.use(function (req, res, next) {
    if (!req.session.token) {
        return res.json({status: {code: 401, error: 'Please supply authentication token'}});
    }

    next();
})
router.post('/create', function (req, res) {
    const roomId = req.body.roomId;
    if (rooms.exists(roomId)) {
        return res.json({status: {code: 500, error: 'Room id already present.'}});
    }

    let response = users.verify(req.session.token);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    const username = response.result.username;
    rooms.create(username, roomId);
    response = users.addRoom(req.session.token, roomId);

    if (typeof response === 'string') {
        return res.json({status: {code: 500, error: response}});
    }

    res.json({status: {code: 200}});
});

router.post('/add', function (req, res) {
    const roomId = req.body.roomId;
    if (rooms.exists(roomId)) {
        return res.json({status: {code: 500, error: 'Room id already present.'}});
    }

    let response = users.verify(req.session.token);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    const username = response.result.username;
    response = rooms.add(username, roomId);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    response = users.addRoom(req.session.token, roomId);

    if (typeof response === 'string') {
        return res.json({status: {code: 500, error: response}});
    }

    res.json({status: {code: 200}});
});


router.post('/remove', function (req, res) {
    const roomId = req.body.roomId;
    if (!rooms.exists(roomId)) {
        return res.json({status: {code: 500, error: 'Room does not exists.'}});
    }

    let response = users.verify(req.session.token);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    const username = response.result.username;
    response = rooms.destroy(roomId, username);

    if (typeof response == 'string') {
        return res.json({status: {code: 500, error: response}});
    }

    response.forEach(user => users.deleteRoom(user, roomId));
    res.json({status: {code: 200}});
});


router.post('/fetch/users', function (req, res) {
    const roomId = req.body.roomId;
    if (!rooms.exists(roomId)) {
        return res.json({status: {code: 500, error: 'Room does not exists.'}});
    }

    let response = users.verify(req.session.token);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    response = rooms.fetchUsers(roomId);
    if (typeof response === 'string') {
        return res.json({status: {code: 500, error: response}});
    }

    res.json({status: {code: 200}, result: response});
});

router.post('/fetch/rooms/all', function () {
    let response = users.verify(req.session.token);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    return res.json({status: {code: 200}, result: rooms.fetchRooms()});
});

module.exports = router;