const jwt = require('jsonwebtoken');
const config = require('../config.json');

const ns = {};
const users = {};

ns.add = function (username) {
    const token = jwt.sign({username: username}, config.token_secret);
    users[username] = {
        token: token,
        rooms: []
    };

    return token;
};

ns.addRoom = function (token, roomId) {
    let response = ns.verify(token);
    if (response.status.code !== 200) {
        return response.status.error;
    }

    const username = response.result.username;
    if (!users[username]) {
        return 'User does not exists in the database';
    }

    let idx = users[username].rooms.indexOf(roomId);
    if (idx >= 0) {
        return 'User has already joined the room'; 
    }

    users[username].rooms.push(roomId);
    return null;
};

ns.getRooms = function (token) {
    let response = ns.verify(token);
    if (response.status.code !== 200) {
        return response.status.error;
    }

    const username = response.result.username;
    if (!users[username]) {
        return 'User does not exists in the database';
    }

    return users[username].rooms;
};

ns.deleteRoom = function (roomId, username) {
    if (!users[username]) {
        return 'User does not exists in the database';
    }

    let idx = users[username].rooms.indexOf(roomId);
    if (idx < 0) {
        return `User didn't joined the room`; 
    }

    users[username].rooms.splice(idx, 1);
    return null;
};

ns.remove = function (token) {    
    let response = ns.verify(token);
    if (response.status.code === 200) {
        const {rooms} = users[response.result.username];
        delete users[response.result.username];
        return rooms;
    }

    return response.status.error;
};

ns.exists = function (username) {
    return !!users[username];
};

ns.verify = function (token) {
    try {
        let decoded = jwt.verify(token, config.token_secret);
        return {status: {code: 200}, result: decoded};
    } catch (err) {
        return {status: {code: 500, error: err.toString()}};
    }
};

module.exports = ns;