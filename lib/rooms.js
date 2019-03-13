const ns = {};
const rooms = {};

ns.fetchRooms = function () {
    return Object.keys(rooms);
};

ns.fetchUsers = function (roomId) {
    if (!rooms[roomId]) {
        return 'Unauthorized access';
    }

    let {author, users} = rooms[roomId];
    return [author, ...users];
}
ns.exists = function (roomsId) {
    return !!rooms[roomsId];
};

// Create a new room
ns.create = function (roomId, username) {
    rooms[roomId] = rooms[roomId] || {};
    rooms[roomId].author = username;
    rooms[roomId].users = [];
};

// Delete a room
ns.destroy = function (roomsId, username) {
    if (!rooms[roomsId] || rooms[roomsId].author !== username) {
        return 'Unauthorized access';
    }

    let {author, users} = rooms[roomsId];
    delete rooms[roomsId];

    return [...users, author];
};

// Add a new user
ns.add = function (roomId, username) {
    const {users} = rooms[roomId];
    if (users.includes(username)) {
        return {status: {code: 204, error: 'User already exists'}};
    }

    rooms[roomId].users.push(username);
    return {status: {code: 200}};
};

// Remove a user
ns.remove = function (roomId, username) {
    const {users} = rooms[roomId];
    if (!users || !users.includes(username)) {
        return {status: {code: 500, error: 'User does not exists for the room'}};
    }

    let index = rooms[roomId].users.indexOf(username);
    rooms[roomId].users.splice(index, 1);
    return {status: {code: 200}};
};

module.exports = ns;