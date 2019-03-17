const express = require('express');
const router = express.Router();

const users = require('../lib/users');
const rooms = require('../lib/rooms');

router.use(function (req, res, next) {
    if (!req.session.token) {
        return res.json({status: {code: 401, error: 'Please supply authentication token'}});
    }

    next();
});

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
    rooms.create(roomId, username);
    response = users.addRoom(req.session.token, roomId);

    if (typeof response === 'string') {
        return res.json({status: {code: 500, error: response}});
    }

    req.session.roomId = roomId;
    req.session.save();

    req.io.emit('room_added', roomId);
    res.json({status: {code: 200}});
});

router.post('/add', function (req, res) {
    const roomId = req.body.roomId;

    let response = users.verify(req.session.token);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    const username = response.result.username;
    response = rooms.add(roomId, username);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    response = users.addRoom(req.session.token, roomId);

    if (typeof response === 'string') {
        return res.json({status: {code: 500, error: response}});
    }

    req.io.emit(roomId, {command: 'refresh'});
    res.json({status: {code: 200}});
});

router.post('/users', function (req, res) {
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

router.post('/available', function (req, res) {
    let response = users.verify(req.session.token);
    if (response.status.code !== 200) {
        return res.json(response);
    }

    if (req.session.roomId) {
        return res.json({status: {code : 405, error: 'Cannot access other rooms while hosting.'}});
    }

    let availableRooms = rooms.fetchRooms();
    const joinedRooms = users.getRooms(req.session.token);
    availableRooms = availableRooms.filter((room) => !joinedRooms.includes(room));

    return res.json({status: {code: 200}, result: availableRooms});
});

module.exports = router;